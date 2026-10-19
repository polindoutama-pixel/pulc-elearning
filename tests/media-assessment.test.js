import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { once } from 'node:events';
import { openDatabase } from '../server/db.js';
import { seed } from '../server/seed.js';
import { createApp } from '../server/app.js';
import { youtubeVideoId, canvaEmbedURL } from '../shared/media.js';
const directory = mkdtempSync(path.join(tmpdir(), 'pulc-revisions-'));
let db, server, base, adminCookie, employeeCookie;
async function call(url, body, role = 'admin', method = body ? 'POST' : 'GET') {
  const response = await fetch(base + '/api' + url, {
    method,
    headers: {
      Cookie: role === 'admin' ? adminCookie : employeeCookie,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    response,
    status: response.status,
    data: response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : await response.arrayBuffer(),
  };
}
const question = {
  id: 'q1',
  text: 'Jawaban yang tepat?',
  options: ['Pilihan A', 'Pilihan B'],
  answer: 1,
};
const newCourse = (extra = {}) => ({
  title: 'Kelas Revisi',
  description: 'Multimedia dan evaluasi',
  category: 'Orientasi',
  duration: 5,
  cover: 'company',
  status: 'published',
  sequential: true,
  lessons: [
    {
      id: 'intro',
      title: 'Pengenalan',
      type: 'text',
      body: '<p>Selamat datang</p>',
      required: true,
    },
  ],
  quiz: null,
  ...extra,
});
async function create(extra) {
  const r = await call('/admin/courses', newCourse(extra));
  assert.equal(r.status, 201, JSON.stringify(r.data));
  return r.data.id;
}
async function enroll(id) {
  assert.equal(
    (await call('/courses/' + id + '/enroll', {}, 'employee')).status,
    200,
  );
}
async function upload(name) {
  const form = new FormData();
  form.append('file', new Blob([readFileSync('tests/fixtures/' + name)]), name);
  const response = await fetch(base + '/api/admin/uploads', {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: form,
  });
  const data = await response.json();
  assert.equal(response.status, 201, JSON.stringify(data));
  return data;
}
before(async () => {
  db = openDatabase(path.join(directory, 'db.sqlite'));
  seed(db);
  server = createApp(db, { dataDir: directory }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = 'http://127.0.0.1:' + server.address().port;
  for (const [role, nik] of [
    ['admin', 'ADMIN001'],
    ['employee', 'PU2026001'],
  ]) {
    const r = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nik, password: 'BelajarPULC!2026' }),
    });
    if (role === 'admin')
      adminCookie = r.headers.get('set-cookie').split(';')[0];
    else employeeCookie = r.headers.get('set-cookie').split(';')[0];
  }
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
  rmSync(directory, { recursive: true, force: true });
});
test('YouTube and Canva URLs are normalized without accepting arbitrary embeds', () => {
  for (const url of [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=2s',
    'https://youtu.be/dQw4w9WgXcQ?si=abc',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  ])
    assert.equal(youtubeVideoId(url), 'dQw4w9WgXcQ');
  for (const url of [
    'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ',
    'https://youtube.com@evil.test/watch?v=dQw4w9WgXcQ',
    'javascript:alert(1)',
    'http://youtu.be/dQw4w9WgXcQ',
    'https://youtube.com:123/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/bad',
  ])
    assert.equal(youtubeVideoId(url), null);
  assert.equal(
    canvaEmbedURL(
      'https://www.canva.com/design/DAGdemo/token/view?utm_source=share',
    ),
    'https://www.canva.com/design/DAGdemo/token/view?embed',
  );
  for (const url of [
    'https://www.canva.com/design/DAGdemo/token/edit',
    'https://canva.com.evil.test/design/DAGdemo/view',
    '<iframe src="https://canva.com/design/x/view"></iframe>',
    'javascript:alert(1)',
  ])
    assert.equal(canvaEmbedURL(url), null);
});
test('pre-test gates learning, remains diagnostic, and is independent from post-test attempts', async () => {
  const id = await create({
    preQuiz: { questions: [question] },
    quiz: { passScore: 80, maxAttempts: 2, questions: [question] },
  });
  await enroll(id);
  assert.equal(
    (
      await call(
        '/courses/' + id + '/progress',
        { lessonId: 'intro' },
        'employee',
      )
    ).status,
    400,
  );
  assert.equal(
    (await call('/courses/' + id + '/quiz', { answers: [1] }, 'employee'))
      .status,
    400,
  );
  const pre = await call(
    '/courses/' + id + '/quiz',
    { phase: 'pre', answers: [0] },
    'employee',
  );
  assert.equal(pre.status, 200);
  assert.equal(pre.data.score, 0);
  assert.equal(pre.data.passed, null);
  assert.equal(pre.data.summary.preTest.submitted, true);
  assert.equal(pre.data.summary.remainingAttempts, 2);
  assert.equal(pre.data.summary.percent, 33);
  assert.equal(
    (
      await call(
        '/courses/' + id + '/quiz',
        { phase: 'pre', answers: [1] },
        'employee',
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        '/courses/' + id + '/quiz',
        { phase: 'invalid', answers: [1] },
        'employee',
      )
    ).status,
    400,
  );
  const progress = await call(
    '/courses/' + id + '/progress',
    { lessonId: 'intro' },
    'employee',
  );
  assert.equal(progress.status, 200);
  assert.equal(progress.data.complete, false);
  const failed = await call(
    '/courses/' + id + '/quiz',
    { phase: 'post', answers: [0] },
    'employee',
  );
  assert.equal(failed.data.passed, false);
  assert.equal(failed.data.summary.remainingAttempts, 1);
  const passed = await call(
    '/courses/' + id + '/quiz',
    { phase: 'post', answers: [1] },
    'employee',
  );
  assert.equal(passed.data.summary.complete, true);
  assert.equal(passed.data.summary.percent, 100);
  const report = (await call('/admin/reports')).data.rows.find(
    (r) => r.course_id === id && r.user_id === 'employee',
  );
  assert.equal(report.preScore, 0);
  assert.equal(report.score, 100);
  assert.equal(report.scoreImprovement, 100);
  assert.equal(report.attemptCount, 2);
  const csv = Buffer.from((await call('/admin/reports.csv')).data).toString();
  assert.ok(csv.includes('Nilai pre-test'));
  assert.ok(csv.includes('Nilai post-test terbaik'));
});
test('both quiz answer keys and raw pre-test JSON are hidden from employees', async () => {
  const id = await create({
    preQuiz: { questions: [question] },
    quiz: { passScore: 80, maxAttempts: 3, questions: [question] },
  });
  const c = (await call('/bootstrap', undefined, 'employee')).data.courses.find(
    (c) => c.id === id,
  );
  assert.equal(c.preQuiz.questions[0].answer, undefined);
  assert.equal(c.quiz.questions[0].answer, undefined);
  assert.equal(c.pre_quiz, undefined);
  assert.equal(
    (
      await call(
        '/courses/' + id + '/quiz',
        { phase: 'pre', answers: [1] },
        'employee',
      )
    ).status,
    403,
  );
});
test('pre-test-only class completes without requiring a passing baseline; duplicated class retains both tests', async () => {
  const id = await create({ preQuiz: { questions: [question] } });
  await enroll(id);
  await call(
    '/courses/' + id + '/quiz',
    { phase: 'pre', answers: [0] },
    'employee',
  );
  assert.equal(
    (
      await call(
        '/courses/' + id + '/progress',
        { lessonId: 'intro' },
        'employee',
      )
    ).data.complete,
    true,
  );
  const current = (await call('/bootstrap')).data.courses.find(
    (c) => c.id === id,
  );
  assert.equal(
    (
      await call(
        '/admin/courses/' + id,
        { ...current, preQuiz: null },
        'admin',
        'PUT',
      )
    ).status,
    409,
  );
  const copy = await call('/admin/courses/' + id + '/duplicate', {});
  assert.equal(copy.status, 201);
  const copied = (await call('/bootstrap')).data.courses.find(
    (c) => c.id === copy.data.id,
  );
  assert.deepEqual(copied.preQuiz, current.preQuiz);
  assert.equal(copied.status, 'draft');
});
test('YouTube, Canva and explanations are saved and sanitized; invalid provider URLs are rejected', async () => {
  const id = await create({
    lessons: [
      {
        id: 'yt',
        title: 'Video',
        type: 'video',
        provider: 'youtube',
        url: 'https://youtu.be/dQw4w9WgXcQ',
        durationSeconds: 10,
        description: '<p>Arahan</p><script>alert(1)</script>',
        required: true,
      },
      {
        id: 'canva',
        title: 'Presentasi',
        type: 'canva',
        url: 'https://www.canva.com/design/DAGdemo/token/view?utm_source=share',
        description: '<p>Perhatikan slide pertama</p>',
        required: true,
      },
    ],
  });
  const c = (await call('/bootstrap')).data.courses.find((c) => c.id === id);
  assert.equal(c.lessons[0].provider, 'youtube');
  assert.equal(c.lessons[0].description, '<p>Arahan</p>');
  assert.equal(
    c.lessons[1].url,
    'https://www.canva.com/design/DAGdemo/token/view?embed',
  );
  for (const l of [
    {
      id: 'bad',
      type: 'video',
      provider: 'youtube',
      url: 'https://evil.test/watch?v=dQw4w9WgXcQ',
      durationSeconds: 30,
    },
    {
      id: 'bad',
      type: 'canva',
      url: 'https://www.canva.com/design/DAGdemo/token/edit',
    },
  ])
    assert.equal(
      (
        await call(
          '/admin/courses',
          newCourse({
            lessons: [{ ...l, title: 'Tidak valid', required: true }],
          }),
        )
      ).status,
      400,
    );
});
test('audio uploads recognize WAV and M4A and track unique playback rather than manual completion', async () => {
  const wav = await upload('intro.wav'),
    m4a = await upload('intro.m4a');
  assert.equal(wav.mime, 'audio/wav');
  assert.equal(m4a.mime, 'audio/mp4');
  const id = await create({
    lessons: [
      {
        id: 'audio',
        title: 'Audio',
        type: 'audio',
        assetId: wav.id,
        durationSeconds: 3,
        description: '<p>Dengarkan baik-baik</p>',
        required: true,
      },
    ],
  });
  await enroll(id);
  assert.equal(
    (
      await call(
        '/courses/' + id + '/progress',
        { lessonId: 'audio' },
        'employee',
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        '/courses/' + id + '/progress',
        { lessonId: 'audio', from: 0, to: 1 },
        'employee',
      )
    ).data.complete,
    false,
  );
  assert.equal(
    (
      await call(
        '/courses/' + id + '/progress',
        { lessonId: 'audio', from: 0, to: 1 },
        'employee',
      )
    ).data.complete,
    false,
  );
  assert.equal(
    (
      await call(
        '/courses/' + id + '/progress',
        { lessonId: 'audio', from: 1, to: 2.8 },
        'employee',
      )
    ).data.complete,
    true,
  );
});
test('PDF and Word downloads preserve filenames and enforce course access', async () => {
  const pdf = await upload('slides.pdf'),
    doc = await upload('handbook.docx');
  assert.equal(
    doc.mime,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  );
  assert.equal(
    (await call('/files/' + doc.id + '?download=1', undefined, 'employee'))
      .status,
    403,
  );
  const id = await create({
    audience: ['Quality Control'],
    lessons: [
      {
        id: 'pdf',
        title: 'PDF',
        type: 'pdf',
        assetId: pdf.id,
        description: 'Penjelasan PDF',
        required: true,
      },
      {
        id: 'doc',
        title: 'Panduan',
        type: 'document',
        assetId: doc.id,
        description: 'Panduan kerja',
        required: true,
      },
    ],
  });
  assert.equal(
    (await call('/files/' + doc.id + '?download=1', undefined, 'employee'))
      .status,
    403,
  );
  await call('/admin/assignments', { courseId: id, userIds: ['employee'] });
  for (const [file, name] of [
    [pdf, 'slides.pdf'],
    [doc, 'handbook.docx'],
  ]) {
    const r = await call(
      '/files/' + file.id + '?download=1',
      undefined,
      'employee',
    );
    assert.equal(r.status, 200);
    assert.ok(
      r.response.headers.get('content-disposition').includes('attachment'),
    );
    assert.ok(r.response.headers.get('content-disposition').includes(name));
    assert.deepEqual(
      Buffer.from(r.data),
      readFileSync('tests/fixtures/' + name),
    );
  }
});
