import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { openDatabase } from '../server/db.js';
import { seed } from '../server/seed.js';
import { createApp } from '../server/app.js';
const dir = mkdtempSync(path.join(tmpdir(), 'pulc-test-'));
let db, server, base, adminCookie, employeeCookie;
async function request(
  route,
  { cookie, body, method = 'GET', headers = {} } = {},
) {
  const r = await fetch(base + route, {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const value = r.headers.get('content-type')?.includes('application/json')
    ? await r.json()
    : await r.text();
  return {
    status: r.status,
    data: value,
    cookie: r.headers.get('set-cookie')?.split(';')[0],
    headers: r.headers,
  };
}
const admin = (route, body, method = 'POST') =>
  request(route, { cookie: adminCookie, body, method });
const employee = (route, body, method = 'POST') =>
  request(route, { cookie: employeeCookie, body, method });
before(async () => {
  db = openDatabase(path.join(dir, 'test.sqlite'));
  seed(db);
  server = createApp(db, { dataDir: dir, demo: true }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = 'http://127.0.0.1:' + server.address().port;
  adminCookie = (
    await request('/api/auth/login', {
      method: 'POST',
      body: { nik: 'ADMIN001', password: 'BelajarPULC!2026' },
    })
  ).cookie;
  employeeCookie = (
    await request('/api/auth/login', {
      method: 'POST',
      body: { nik: 'PU2026001', password: 'BelajarPULC!2026' },
    })
  ).cookie;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
test('authentication protects APIs and never sends password hashes', async () => {
  assert.equal((await request('/api/bootstrap')).status, 401);
  const me = await request('/api/me', { cookie: employeeCookie });
  assert.equal(me.data.user.nik, 'PU2026001');
  assert.equal(me.data.user.password, undefined);
  const denied = await employee('/api/admin/reports', undefined, 'GET');
  assert.equal(denied.status, 403);
});
test('bootstrap redacts quiz answers and other employee data', async () => {
  const r = await employee('/api/bootstrap', undefined, 'GET');
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.users, []);
  assert.ok(r.data.courses.length >= 3);
  assert.equal(r.data.courses[0].quiz.questions[0].answer, undefined);
  assert.ok(
    r.data.summaries.every((s) =>
      s.progress.every((p) => p.user_id === 'employee'),
    ),
  );
});
test('server grades quizzes, enforces prerequisites, preserves completion', async () => {
  const early = await employee('/api/courses/company/quiz', {
    answers: [1, 0],
  });
  assert.equal(early.status, 400);
  const skip = await employee('/api/courses/company/progress', {
    lessonId: 'company-3',
  });
  assert.equal(skip.status, 400);
  for (const lessonId of ['company-2', 'company-3'])
    assert.equal(
      (await employee('/api/courses/company/progress', { lessonId })).status,
      200,
    );
  assert.equal(
    (await employee('/api/courses/company/quiz', { answers: [0, 0] })).data
      .passed,
    false,
  );
  const pass = await employee('/api/courses/company/quiz', { answers: [1, 0] });
  assert.equal(pass.data.score, 100);
  assert.equal(pass.data.summary.complete, true);
  assert.equal(pass.data.summary.percent, 100);
  assert.equal(
    (await employee('/api/courses/company/quiz', { answers: [1, 0] })).status,
    400,
  );
  const report = await admin('/api/admin/reports', undefined, 'GET');
  assert.equal(
    report.data.rows.find(
      (r) => r.user_id === 'employee' && r.course_id === 'company',
    ).complete,
    true,
  );
});
test('quiz attempts cannot be reset by enrolling again; additional attempts are audited', async () => {
  for (const lessonId of ['safety-1', 'safety-2', 'safety-3'])
    await employee('/api/courses/safety/progress', { lessonId });
  for (let i = 0; i < 3; i++)
    assert.equal(
      (await employee('/api/courses/safety/quiz', { answers: [0, 1] })).data
        .passed,
      false,
    );
  assert.equal(
    (await employee('/api/courses/safety/quiz', { answers: [1, 0] })).status,
    400,
  );
  await employee('/api/courses/safety/enroll', {});
  assert.equal(
    (await employee('/api/courses/safety/quiz', { answers: [1, 0] })).status,
    400,
  );
  assert.equal(
    (
      await admin('/api/admin/extra-attempts', {
        userId: 'employee',
        courseId: 'safety',
        reason: 'Pendampingan ulang oleh HR',
      })
    ).status,
    200,
  );
  assert.equal(
    (await employee('/api/courses/safety/quiz', { answers: [1, 0] })).data
      .passed,
    true,
  );
});
test('course editor sanitizes HTML and protects histories without blocking metadata updates', async () => {
  const b = await admin('/api/bootstrap', undefined, 'GET');
  const course = b.data.courses.find((c) => c.id === 'company');
  const edit = await admin(
    '/api/admin/courses/company',
    { ...course, title: 'Mengenal Polindo Utama (diperbarui)' },
    'PUT',
  );
  assert.equal(edit.status, 200, JSON.stringify(edit.data));
  const change = await admin(
    '/api/admin/courses/company',
    {
      ...course,
      lessons: [
        { ...course.lessons[0], body: '<p>Berubah</p>' },
        ...course.lessons.slice(1),
      ],
    },
    'PUT',
  );
  assert.equal(change.status, 409);
  const copied = await admin('/api/admin/courses/company/duplicate', {});
  assert.equal(copied.status, 201);
  const draft = {
    ...course,
    status: 'draft',
    title: 'Uji Sanitasi',
    lessons: [
      {
        id: 'safe-text',
        title: 'Teks',
        type: 'text',
        required: true,
        body: '<h2>Aman</h2><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">tautan</a>',
      },
    ],
    quiz: null,
  };
  const saved = await admin(
    '/api/admin/courses/' + copied.data.id,
    draft,
    'PUT',
  );
  assert.equal(saved.status, 200, JSON.stringify(saved.data));
  const updated = (
    await admin('/api/bootstrap', undefined, 'GET')
  ).data.courses.find((c) => c.id === copied.data.id);
  assert.ok(!updated.lessons[0].body.includes('script'));
  assert.ok(!updated.lessons[0].body.includes('onerror'));
  assert.ok(!updated.lessons[0].body.includes('javascript:'));
  assert.ok(
    !(await employee('/api/bootstrap', undefined, 'GET')).data.courses.some(
      (c) => c.id === copied.data.id,
    ),
  );
});
test('assignments target current department members and preserve completed progress', async () => {
  const r = await admin('/api/admin/assignments', {
    courseId: 'quality',
    department: 'Produksi',
    due: '2027-01-31',
  });
  assert.equal(r.data.count, 2);
  assert.equal(
    db
      .prepare(
        "SELECT COUNT(*) AS n FROM enrollments WHERE course_id='quality'",
      )
      .get().n,
    2,
  );
  await admin('/api/admin/assignments', {
    courseId: 'company',
    department: 'Produksi',
    due: '2027-01-31',
  });
  const b = (await employee('/api/bootstrap', undefined, 'GET')).data;
  assert.equal(
    b.summaries.find((s) => s.courseId === 'company').complete,
    true,
  );
  assert.equal(
    (
      await admin('/api/admin/assignments', {
        courseId: 'quality',
        department: 'Produksi',
        due: '2027-02-31',
      })
    ).status,
    400,
  );
});
test('new accounts must change initial passwords and inactive accounts lose access', async () => {
  const created = await admin('/api/admin/users', {
    nik: 'NEW001',
    name: 'Karyawan Baru',
    department: 'Produksi',
    role: 'employee',
    password: 'PasswordAwal!2026',
  });
  assert.equal(created.status, 201);
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: { nik: 'NEW001', password: 'PasswordAwal!2026' },
  });
  assert.equal(login.status, 200);
  assert.equal(
    (await request('/api/bootstrap', { cookie: login.cookie })).data.code,
    'PASSWORD_CHANGE_REQUIRED',
  );
  const changed = await request('/api/auth/password', {
    cookie: login.cookie,
    method: 'POST',
    body: {
      currentPassword: 'PasswordAwal!2026',
      newPassword: 'PasswordBaru!2026',
    },
  });
  assert.equal(changed.status, 200);
  assert.equal(
    (await request('/api/bootstrap', { cookie: login.cookie })).status,
    200,
  );
  await admin(
    '/api/admin/users/' + created.data.id,
    {
      nik: 'NEW001',
      name: 'Karyawan Baru',
      department: 'Produksi',
      role: 'employee',
      active: false,
    },
    'PUT',
  );
  assert.equal(
    (await request('/api/me', { cookie: login.cookie })).status,
    401,
  );
});
test('CSV preview validates duplicates and import is atomic', async () => {
  const rows = [
    {
      nik: 'CSV001',
      name: 'Satu',
      department: 'Produksi',
      password: 'PasswordAwal!2026',
    },
    {
      nik: 'CSV001',
      name: 'Dua',
      department: 'Produksi',
      password: 'PasswordAwal!2026',
    },
  ];
  const bad = await admin('/api/admin/users/import', { rows });
  assert.equal(bad.status, 400);
  assert.equal(bad.data.errors[0].row, 3);
  assert.equal(
    db.prepare("SELECT COUNT(*) AS n FROM users WHERE nik='CSV001'").get().n,
    0,
  );
  const preview = await admin('/api/admin/users/import', {
    rows: rows.slice(0, 1),
    preview: true,
  });
  assert.equal(preview.status, 200);
  assert.equal(preview.data.preview[0].password, undefined);
  const good = await admin('/api/admin/users/import', {
    rows: rows.slice(0, 1),
  });
  assert.equal(good.data.count, 1);
});
test('uploads are validated and access controlled', async () => {
  const f = new FormData();
  f.append(
    'file',
    new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' }),
    'slides.pdf',
  );
  const response = await fetch(base + '/api/admin/uploads', {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: f,
  });
  const file = await response.json();
  assert.equal(response.status, 201, JSON.stringify(file));
  assert.equal(
    (await employee('/api/files/' + file.id, undefined, 'GET')).status,
    403,
  );
  assert.equal(
    (await admin('/api/files/' + file.id, undefined, 'GET')).status,
    200,
  );
  const invalid = new FormData();
  invalid.append(
    'file',
    new Blob(['<svg onload="alert(1)"></svg>'], { type: 'image/png' }),
    'fake.png',
  );
  assert.equal(
    (
      await fetch(base + '/api/admin/uploads', {
        method: 'POST',
        headers: { Cookie: adminCookie },
        body: invalid,
      })
    ).status,
    400,
  );
});
test('video completion measures unique ranges and cannot be set via completion flag', async () => {
  const course = {
    title: 'Video Test',
    description: 'Video',
    category: 'Orientasi',
    duration: 1,
    cover: 'company',
    status: 'published',
    sequential: true,
    lessons: [
      {
        id: 'v1',
        title: 'Video',
        type: 'video',
        url: 'https://example.com/video.mp4',
        durationSeconds: 20,
        required: true,
      },
    ],
    quiz: null,
  };
  const r = await admin('/api/admin/courses', course);
  const id = r.data.id;
  await employee('/api/courses/' + id + '/enroll', {});
  assert.equal(
    (
      await employee('/api/courses/' + id + '/progress', {
        lessonId: 'v1',
        complete: true,
      })
    ).status,
    400,
  );
  await employee('/api/courses/' + id + '/progress', {
    lessonId: 'v1',
    from: 0,
    to: 10,
  });
  let update = await employee('/api/courses/' + id + '/progress', {
    lessonId: 'v1',
    from: 0,
    to: 10,
  });
  assert.equal(update.data.complete, false);
  update = await employee('/api/courses/' + id + '/progress', {
    lessonId: 'v1',
    from: 10,
    to: 18,
  });
  assert.equal(update.data.complete, true);
  assert.equal(update.data.percent, 100);
});
test('cross-site mutations rejected; logout invalidates session', async () => {
  assert.equal(
    (
      await request('/api/courses/company/enroll', {
        method: 'POST',
        cookie: employeeCookie,
        headers: { Origin: 'https://evil.example' },
        body: {},
      })
    ).status,
    403,
  );
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: { nik: 'ADMIN001', password: 'BelajarPULC!2026' },
  });
  assert.ok(login.cookie);
  const logout = await request('/api/auth/logout', {
    cookie: login.cookie,
    method: 'POST',
    body: {},
  });
  assert.equal(logout.status, 200);
  assert.equal(
    (await request('/api/me', { cookie: login.cookie })).status,
    401,
  );
});
test('department restrictions apply to catalog, self-enrollment, and files; explicit assignment permits access', async () => {
  const c = {
    title: 'Khusus QC',
    description: 'Konten departemen',
    category: 'Kualitas',
    duration: 5,
    cover: 'quality',
    status: 'published',
    audience: ['Quality Control'],
    sequential: false,
    lessons: [
      {
        id: 'qc1',
        module: 'Pendahuluan',
        title: 'Orientasi QC',
        type: 'text',
        body: '<p>QC</p>',
        required: true,
      },
    ],
    quiz: null,
  };
  const saved = await admin('/api/admin/courses', c);
  assert.equal(saved.status, 201);
  const id = saved.data.id;
  assert.ok(
    !(await employee('/api/bootstrap', undefined, 'GET')).data.courses.some(
      (c) => c.id === id,
    ),
  );
  assert.equal(
    (await employee('/api/courses/' + id + '/enroll', {})).status,
    403,
  );
  await admin('/api/admin/assignments', {
    courseId: id,
    userIds: ['employee'],
  });
  assert.ok(
    (await employee('/api/bootstrap', undefined, 'GET')).data.courses.some(
      (c) => c.id === id,
    ),
  );
  assert.equal(
    (await employee('/api/courses/' + id + '/progress', { lessonId: 'qc1' }))
      .data.complete,
    true,
  );
  const copied = await admin('/api/admin/courses/' + id + '/duplicate', {});
  assert.deepEqual(
    (await admin('/api/bootstrap', undefined, 'GET')).data.courses.find(
      (c) => c.id === copied.data.id,
    ).audience,
    ['Quality Control'],
  );
});
test('completion timestamps stay stable when completed material is reviewed', async () => {
  const c = {
    title: 'Selesai Sekali',
    description: 'Timestamp',
    category: 'Orientasi',
    duration: 1,
    cover: 'company',
    status: 'published',
    sequential: false,
    lessons: [
      {
        id: 'once',
        title: 'Baca',
        type: 'text',
        body: '<p>Materi</p>',
        required: true,
      },
    ],
    quiz: null,
  };
  const id = (await admin('/api/admin/courses', c)).data.id;
  await employee('/api/courses/' + id + '/enroll', {});
  await employee('/api/courses/' + id + '/progress', { lessonId: 'once' });
  db.prepare('UPDATE progress SET completed_at=? WHERE course_id=?').run(
    '2026-01-01 01:00:00',
    id,
  );
  await employee('/api/courses/' + id + '/progress', { lessonId: 'once' });
  const r = (
    await admin('/api/admin/reports', undefined, 'GET')
  ).data.rows.find((r) => r.course_id === id);
  assert.equal(r.completedAt, '2026-01-01 01:00:00');
});
test('production initialization refuses demo data and requires a strong bootstrap password', () => {
  assert.throws(() => seed(db, { demo: false }), /Database demo/);
  const prod = openDatabase(path.join(dir, 'production.sqlite'));
  const previous = process.env.ADMIN_PASSWORD;
  try {
    delete process.env.ADMIN_PASSWORD;
    assert.throws(() => seed(prod, { demo: false }), /ADMIN_PASSWORD/);
    process.env.ADMIN_PASSWORD = 'BootstrapPassword!2026';
    seed(prod, { demo: false });
    assert.equal(prod.prepare('SELECT COUNT(*) AS n FROM users').get().n, 1);
    assert.equal(
      prod.prepare('SELECT must_change_password FROM users').get()
        .must_change_password,
      1,
    );
  } finally {
    if (previous === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = previous;
    prod.close();
  }
});
