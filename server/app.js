import express from 'express';
import { isDeepStrictEqual } from 'node:util';
import multer from 'multer';
import sanitizeHtml from 'sanitize-html';
import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';
import { checkPassword, hashPassword } from './db.js';
const uid = () => randomBytes(12).toString('hex');
const safeUser = ({ password, ...user }) => user;
const parseCourse = (c) => ({
  ...c,
  lessons: JSON.parse(c.lessons),
  quiz: c.quiz ? JSON.parse(c.quiz) : null,
  audience: JSON.parse(c.audience || '[]'),
});
const fail = (status, message) => {
  const e = new Error(message);
  e.status = status;
  throw e;
};
const cleanText = (x, max = 500) =>
  typeof x === 'string' ? x.trim().slice(0, max) : '';
const validDate = (x) =>
  !x ||
  (/^\d{4}-\d{2}-\d{2}$/.test(x) &&
    !Number.isNaN(Date.parse(x)) &&
    new Date(x).toISOString().slice(0, 10) === x);
export function createApp(
  db,
  { dataDir, production = false, demo = true } = {},
) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'X-Frame-Options': 'SAMEORIGIN',
    });
    if (req.path.startsWith('/api')) res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '2mb' }));
  app.use('/api', (req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.get('origin');
      if (
        (origin && new URL(origin).host !== req.get('host')) ||
        req.get('sec-fetch-site') === 'cross-site'
      )
        return res
          .status(403)
          .json({ error: 'Permintaan dari situs lain ditolak.' });
      if (!req.is('application/json') && !req.is('multipart/form-data'))
        return res
          .status(415)
          .json({ error: 'Format permintaan tidak didukung.' });
    }
    next();
  });
  app.get('/api/health', (req, res) => res.json({ status: 'ok', demo }));
  const loginLimits = new Map();
  const sessionCookie = (token, clear = false) =>
    `pulc_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${clear ? 0 : 28800}${production ? '; Secure' : ''}`;
  app.post('/api/auth/login', (req, res) => {
    const key = req.socket.remoteAddress;
    const limit = loginLimits.get(key);
    if (limit && limit.until > Date.now() && limit.count >= 10)
      return res
        .status(429)
        .json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' });
    const { nik, password } = req.body;
    const user = db
      .prepare('SELECT * FROM users WHERE nik=? AND active=1')
      .get(cleanText(nik));
    if (
      !user ||
      typeof password !== 'string' ||
      password.length > 256 ||
      !checkPassword(password, user.password)
    ) {
      loginLimits.set(key, {
        until: limit?.until > Date.now() ? limit.until : Date.now() + 900000,
        count: limit?.until > Date.now() ? limit.count + 1 : 1,
      });
      return res
        .status(401)
        .json({ error: 'NIK atau kata sandi tidak sesuai.' });
    }
    loginLimits.delete(key);
    db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
    const token = uid() + uid();
    db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(
      token,
      user.id,
      Date.now() + 28800000,
    );
    res.set('Set-Cookie', sessionCookie(token)).json({ user: safeUser(user) });
  });
  app.use('/api', (req, res, next) => {
    const token = req.headers.cookie
      ?.split(';')
      .map((x) => x.trim())
      .find((x) => x.startsWith('pulc_session='))
      ?.slice(13);
    const session =
      token &&
      db
        .prepare(
          'SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.id=? AND s.expires>? AND u.active=1',
        )
        .get(token, Date.now());
    if (!session)
      return res
        .status(401)
        .json({ error: 'Silakan masuk untuk melanjutkan.' });
    req.user = session;
    req.token = token;
    next();
  });
  app.get('/api/me', (req, res) =>
    res.json({ user: safeUser(req.user), demo }),
  );
  app.post('/api/auth/logout', (req, res) => {
    db.prepare('DELETE FROM sessions WHERE id=?').run(req.token);
    res.set('Set-Cookie', sessionCookie('', true)).json({ ok: true });
  });
  app.post('/api/auth/password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (
      typeof currentPassword !== 'string' ||
      currentPassword.length > 256 ||
      !checkPassword(currentPassword, req.user.password)
    )
      fail(400, 'Kata sandi saat ini salah.');
    if (
      typeof newPassword !== 'string' ||
      newPassword.length < 12 ||
      newPassword.length > 256
    )
      fail(400, 'Kata sandi baru minimal 12 dan maksimal 256 karakter.');
    db.prepare(
      'UPDATE users SET password=?,must_change_password=0 WHERE id=?',
    ).run(hashPassword(newPassword), req.user.id);
    db.prepare('DELETE FROM sessions WHERE user_id=? AND id!=?').run(
      req.user.id,
      req.token,
    );
    res.json({ ok: true });
  });
  app.use('/api', (req, res, next) =>
    req.user.must_change_password
      ? res.status(403).json({
          error: 'Ganti kata sandi awal untuk melanjutkan.',
          code: 'PASSWORD_CHANGE_REQUIRED',
        })
      : next(),
  );
  const audit = (user, action, detail) =>
    db
      .prepare('INSERT INTO audit(actor_id,action,detail) VALUES(?,?,?)')
      .run(user, action, JSON.stringify(detail));
  const admin = (req, res, next) =>
    req.user.role === 'admin'
      ? next()
      : res.status(403).json({ error: 'Akses hanya untuk admin.' });
  const getCourse = (id) => {
    const c = db.prepare('SELECT * FROM courses WHERE id=?').get(id);
    if (!c) fail(404, 'Kelas tidak ditemukan.');
    return parseCourse(c);
  };
  const enrollment = (u, c) =>
    db
      .prepare('SELECT * FROM enrollments WHERE user_id=? AND course_id=?')
      .get(u, c);
  const canRead = (u, c) =>
    u.role === 'admin' ||
    (c.status === 'published' &&
      (!c.audience.length ||
        c.audience.includes(u.department) ||
        enrollment(u.id, c.id))) ||
    (c.status === 'archived' && enrollment(u.id, c.id));
  const publicCourse = (c, user) =>
    user.role === 'admin'
      ? c
      : {
          ...c,
          quiz: c.quiz
            ? {
                ...c.quiz,
                questions: c.quiz.questions.map(({ answer, ...q }) => q),
              }
            : null,
        };
  const summary = (userId, c) => {
    const progress = db
      .prepare('SELECT * FROM progress WHERE user_id=? AND course_id=?')
      .all(userId, c.id);
    const attempts = db
      .prepare(
        'SELECT id,score,passed,created_at FROM attempts WHERE user_id=? AND course_id=? ORDER BY created_at,id',
      )
      .all(userId, c.id);
    const needed = c.lessons.filter((l) => l.required !== false);
    const done = needed.filter((l) =>
      progress.some((p) => p.lesson_id === l.id && p.complete),
    ).length;
    const passed = !c.quiz || attempts.some((a) => a.passed);
    const complete = needed.length > 0 && done === needed.length && passed;
    const total = needed.length + (c.quiz ? 1 : 0);
    const percent = total
      ? Math.round(((done + (c.quiz && passed ? 1 : 0)) / total) * 100)
      : 0;
    const extra =
      db
        .prepare(
          'SELECT count FROM extra_attempts WHERE user_id=? AND course_id=?',
        )
        .get(userId, c.id)?.count || 0;
    return {
      courseId: c.id,
      percent,
      complete,
      started: progress.length > 0 || attempts.length > 0,
      progress: progress.map((p) => ({ ...p, ranges: JSON.parse(p.ranges) })),
      attempts,
      remainingAttempts: c.quiz
        ? Math.max(0, c.quiz.maxAttempts + extra - attempts.length)
        : 0,
    };
  };
  app.get('/api/bootstrap', (req, res) => {
    const all = db
      .prepare('SELECT * FROM courses ORDER BY created_at,id')
      .all()
      .map(parseCourse);
    const courses = all.filter((c) => canRead(req.user, c));
    const enrollments = db
      .prepare('SELECT * FROM enrollments WHERE user_id=?')
      .all(req.user.id);
    const assignedPrograms = db
      .prepare('SELECT * FROM program_assignments WHERE user_id=?')
      .all(req.user.id);
    const programs = db
      .prepare('SELECT * FROM programs')
      .all()
      .map((p) => ({ ...p, courseIds: JSON.parse(p.course_ids) }))
      .filter(
        (p) =>
          req.user.role === 'admin' ||
          assignedPrograms.some((a) => a.program_id === p.id),
      );
    const users =
      req.user.role === 'admin'
        ? db
            .prepare(
              'SELECT id,nik,name,email,department,role,active,must_change_password FROM users ORDER BY name',
            )
            .all()
        : [];
    res.json({
      user: safeUser(req.user),
      demo,
      courses: courses.map((c) => publicCourse(c, req.user)),
      enrollments,
      summaries: courses.map((c) => summary(req.user.id, c)),
      programs,
      assignedPrograms,
      users,
    });
  });
  app.post('/api/courses/:id/enroll', (req, res) => {
    const c = getCourse(req.params.id);
    if (c.status !== 'published' || !canRead(req.user, c))
      fail(403, 'Kelas belum tersedia untuk akun Anda.');
    db.prepare(
      'INSERT OR IGNORE INTO enrollments(id,user_id,course_id) VALUES(?,?,?)',
    ).run(uid(), req.user.id, c.id);
    res.json({ ok: true });
  });
  app.post('/api/courses/:id/progress', (req, res) => {
    const c = getCourse(req.params.id);
    if (!canRead(req.user, c) || !enrollment(req.user.id, c.id))
      fail(403, 'Ikuti kelas terlebih dahulu.');
    const l = c.lessons.find((x) => x.id === req.body.lessonId);
    if (!l) fail(404, 'Materi tidak ditemukan.');
    const state = summary(req.user.id, c);
    if (c.sequential) {
      const index = c.lessons.indexOf(l);
      if (
        c.lessons
          .slice(0, index)
          .some(
            (x) =>
              x.required !== false &&
              !state.progress.some((p) => p.lesson_id === x.id && p.complete),
          )
      )
        fail(400, 'Selesaikan materi sebelumnya terlebih dahulu.');
    }
    const old = state.progress.find((p) => p.lesson_id === l.id);
    let ranges = old?.ranges || [],
      complete = old?.complete || 0,
      position = old?.position || 0;
    if (l.type === 'video') {
      const { from, to } = req.body;
      if (
        !Number.isFinite(from) ||
        !Number.isFinite(to) ||
        from < 0 ||
        to < from ||
        to - from > 15 ||
        to > l.durationSeconds + 1
      )
        fail(400, 'Rentang pemutaran video tidak valid.');
      ranges = [...ranges, [from, Math.min(to, l.durationSeconds)]].sort(
        (a, b) => a[0] - b[0],
      );
      ranges = ranges.reduce((acc, r) => {
        const last = acc.at(-1);
        if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
        else acc.push([...r]);
        return acc;
      }, []);
      const watched = ranges.reduce((n, [a, b]) => n + b - a, 0);
      position = to;
      complete = complete || Number(watched >= l.durationSeconds * 0.9);
    } else complete = 1;
    db.prepare(
      'INSERT INTO progress(user_id,course_id,lesson_id,complete,position,ranges,completed_at) VALUES(?,?,?,?,?,?,CASE WHEN ?=1 THEN CURRENT_TIMESTAMP ELSE NULL END) ON CONFLICT(user_id,course_id,lesson_id) DO UPDATE SET complete=excluded.complete,position=excluded.position,ranges=excluded.ranges,completed_at=COALESCE(progress.completed_at,excluded.completed_at),updated_at=CURRENT_TIMESTAMP',
    ).run(
      req.user.id,
      c.id,
      l.id,
      Number(complete),
      position,
      JSON.stringify(ranges),
      Number(complete),
    );
    res.json(summary(req.user.id, c));
  });
  app.post('/api/courses/:id/quiz', (req, res) => {
    const c = getCourse(req.params.id);
    if (!canRead(req.user, c) || !enrollment(req.user.id, c.id))
      fail(403, 'Ikuti kelas terlebih dahulu.');
    if (!c.quiz) fail(400, 'Kelas ini tidak memiliki kuis.');
    const state = summary(req.user.id, c);
    if (
      c.lessons.some(
        (l) =>
          l.required !== false &&
          !state.progress.some((p) => p.lesson_id === l.id && p.complete),
      )
    )
      fail(400, 'Selesaikan seluruh materi wajib sebelum kuis.');
    if (!state.remainingAttempts)
      fail(
        400,
        'Kesempatan kuis habis. Hubungi admin untuk percobaan tambahan.',
      );
    if (state.attempts.some((a) => a.passed))
      fail(400, 'Anda sudah lulus kuis ini.');
    const answers = req.body.answers;
    if (
      !Array.isArray(answers) ||
      answers.length !== c.quiz.questions.length ||
      answers.some(
        (a, i) =>
          !Number.isInteger(a) ||
          a < 0 ||
          a >= c.quiz.questions[i].options.length,
      )
    )
      fail(400, 'Jawab semua pertanyaan sebelum mengumpulkan.');
    const score = Math.round(
      (c.quiz.questions.filter((q, i) => q.answer === answers[i]).length /
        c.quiz.questions.length) *
        100,
    );
    const passed = score >= c.quiz.passScore;
    db.prepare(
      'INSERT INTO attempts(id,user_id,course_id,score,passed) VALUES(?,?,?,?,?)',
    ).run(uid(), req.user.id, c.id, score, Number(passed));
    audit(req.user.id, 'quiz.submitted', { courseId: c.id, score, passed });
    res.json({ score, passed, summary: summary(req.user.id, c) });
  });
  app.use('/api/admin', admin);
  const validateCourse = (body) => {
    const title = cleanText(body.title, 150),
      description = cleanText(body.description, 3000),
      category = cleanText(body.category, 80);
    if (!title || !description || !category)
      fail(400, 'Judul, deskripsi, dan kategori wajib diisi.');
    if (
      !Number.isInteger(Number(body.duration)) ||
      Number(body.duration) < 1 ||
      Number(body.duration) > 6000
    )
      fail(400, 'Durasi kelas harus 1–6000 menit.');
    if (!['draft', 'published', 'archived'].includes(body.status))
      fail(400, 'Status kelas tidak valid.');
    if (!Array.isArray(body.lessons) || body.lessons.length > 100)
      fail(400, 'Daftar materi tidak valid (maksimal 100).');
    const ids = new Set();
    const lessons = body.lessons.map((l) => {
      const id = cleanText(l.id, 80) || uid();
      if (ids.has(id)) fail(400, 'ID materi duplikat.');
      ids.add(id);
      if (
        !['text', 'video', 'image', 'pdf'].includes(l.type) ||
        !cleanText(l.title, 150)
      )
        fail(400, 'Judul dan format setiap materi wajib diisi.');
      const lesson = {
        id,
        title: cleanText(l.title, 150),
        type: l.type,
        required: l.required !== false,
      };
      if (cleanText(l.module, 100)) lesson.module = cleanText(l.module, 100);
      if (l.type === 'text') {
        lesson.body = sanitizeHtml(l.body || '', {
          allowedTags: [
            'h2',
            'h3',
            'h4',
            'p',
            'br',
            'strong',
            'em',
            'ul',
            'ol',
            'li',
            'blockquote',
            'a',
          ],
          allowedAttributes: { a: ['href', 'target', 'rel'] },
          allowedSchemes: ['https', 'mailto'],
        });
        if (
          !sanitizeHtml(lesson.body, {
            allowedTags: [],
            allowedAttributes: {},
          }).trim()
        )
          fail(400, 'Materi teks tidak boleh kosong.');
      } else {
        if (l.assetId) {
          const file = db
            .prepare('SELECT * FROM files WHERE id=?')
            .get(l.assetId);
          const types = {
            video: ['video/mp4', 'video/webm'],
            image: ['image/png', 'image/jpeg', 'image/webp'],
            pdf: ['application/pdf'],
          };
          if (!file || !types[l.type].includes(file.mime))
            fail(400, 'File materi tidak ditemukan atau format tidak sesuai.');
          lesson.assetId = l.assetId;
        } else if (
          l.type === 'video' &&
          typeof l.url === 'string' &&
          l.url.startsWith('https://')
        ) {
          try {
            new URL(l.url);
          } catch {
            fail(400, 'URL video tidak valid.');
          }
          lesson.url = l.url;
        } else fail(400, 'Unggah file materi terlebih dahulu.');
        if (l.type === 'video') {
          lesson.durationSeconds = Number(l.durationSeconds);
          if (
            !Number.isFinite(lesson.durationSeconds) ||
            lesson.durationSeconds < 1
          )
            fail(400, 'Isi durasi video dalam detik.');
        }
      }
      return lesson;
    });
    if (body.status === 'published' && !lessons.some((l) => l.required))
      fail(400, 'Tambahkan minimal satu materi wajib sebelum menerbitkan.');
    let quiz = null;
    if (body.quiz) {
      const q = body.quiz;
      if (
        !Number.isInteger(Number(q.passScore)) ||
        Number(q.passScore) < 1 ||
        Number(q.passScore) > 100 ||
        !Number.isInteger(Number(q.maxAttempts)) ||
        Number(q.maxAttempts) < 1 ||
        Number(q.maxAttempts) > 20 ||
        !Array.isArray(q.questions) ||
        !q.questions.length ||
        q.questions.length > 100
      )
        fail(
          400,
          'Nilai kelulusan, batas percobaan, atau soal kuis tidak valid.',
        );
      quiz = {
        passScore: Number(q.passScore),
        maxAttempts: Number(q.maxAttempts),
        questions: q.questions.map((question) => {
          if (
            !cleanText(question.text, 1000) ||
            !Array.isArray(question.options) ||
            question.options.length < 2 ||
            question.options.length > 6 ||
            question.options.some((o) => !cleanText(o, 500)) ||
            !Number.isInteger(Number(question.answer)) ||
            Number(question.answer) < 0 ||
            Number(question.answer) >= question.options.length
          )
            fail(400, 'Lengkapi pertanyaan, pilihan, dan kunci jawaban kuis.');
          return {
            id: cleanText(question.id, 80) || uid(),
            text: cleanText(question.text, 1000),
            options: question.options.map((o) => cleanText(o, 500)),
            answer: Number(question.answer),
          };
        }),
      };
    }
    if (
      body.audience !== undefined &&
      (!Array.isArray(body.audience) ||
        body.audience.length > 100 ||
        body.audience.some((d) => !cleanText(d, 100)))
    )
      fail(400, 'Daftar departemen tidak valid.');
    const audience = [
      ...new Set((body.audience || []).map((d) => cleanText(d, 100))),
    ];
    return {
      audience,
      title,
      description,
      category,
      duration: Number(body.duration),
      cover: [
        'company',
        'safety',
        'factory',
        'quality',
        'teamwork',
        'digital',
      ].includes(body.cover)
        ? body.cover
        : 'company',
      status: body.status,
      sequential: body.sequential ? 1 : 0,
      lessons,
      quiz,
    };
  };
  app.post('/api/admin/courses', (req, res) => {
    const c = validateCourse(req.body),
      id = uid();
    db.prepare(
      'INSERT INTO courses(id,title,description,category,duration,cover,status,sequential,lessons,quiz,audience) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
    ).run(
      id,
      c.title,
      c.description,
      c.category,
      c.duration,
      c.cover,
      c.status,
      c.sequential,
      JSON.stringify(c.lessons),
      c.quiz ? JSON.stringify(c.quiz) : null,
      JSON.stringify(c.audience),
    );
    audit(req.user.id, 'course.created', {
      id,
      title: c.title,
      status: c.status,
    });
    res.status(201).json({ id });
  });
  app.put('/api/admin/courses/:id', (req, res) => {
    const old = getCourse(req.params.id),
      c = validateCourse(req.body);
    const hasEnrollment = db
      .prepare('SELECT 1 FROM enrollments WHERE course_id=? LIMIT 1')
      .get(old.id);
    if (
      hasEnrollment &&
      (!isDeepStrictEqual(c.lessons, old.lessons) ||
        !isDeepStrictEqual(c.quiz, old.quiz) ||
        c.sequential !== old.sequential)
    )
      fail(
        409,
        'Kelas sudah memiliki peserta. Duplikasikan ke draft baru untuk mengubah materi atau kuis agar riwayat tetap utuh.',
      );
    if (hasEnrollment && c.status === 'draft')
      fail(
        409,
        'Kelas yang memiliki peserta hanya dapat diterbitkan atau diarsipkan.',
      );
    db.prepare(
      'UPDATE courses SET title=?,description=?,category=?,duration=?,cover=?,status=?,sequential=?,lessons=?,quiz=?,audience=? WHERE id=?',
    ).run(
      c.title,
      c.description,
      c.category,
      c.duration,
      c.cover,
      c.status,
      c.sequential,
      JSON.stringify(c.lessons),
      c.quiz ? JSON.stringify(c.quiz) : null,
      JSON.stringify(c.audience),
      old.id,
    );
    audit(req.user.id, 'course.updated', { id: old.id, status: c.status });
    res.json({ ok: true });
  });
  app.post('/api/admin/courses/:id/duplicate', (req, res) => {
    const c = getCourse(req.params.id),
      id = uid();
    db.prepare(
      "INSERT INTO courses(id,title,description,category,duration,cover,status,sequential,lessons,quiz,audience) VALUES(?,?,?,?,?,?,'draft',?,?,?,?)",
    ).run(
      id,
      c.title + ' (salinan)',
      c.description,
      c.category,
      c.duration,
      c.cover,
      c.sequential,
      JSON.stringify(c.lessons),
      c.quiz ? JSON.stringify(c.quiz) : null,
      JSON.stringify(c.audience),
    );
    audit(req.user.id, 'course.duplicated', { id, from: c.id });
    res.status(201).json({ id });
  });
  function validateUser(u) {
    const nik = cleanText(u.nik, 50),
      name = cleanText(u.name, 150),
      department = cleanText(u.department, 100),
      email = cleanText(u.email, 200);
    if (!nik || !name || !department || !['admin', 'employee'].includes(u.role))
      fail(400, 'Lengkapi NIK, nama, departemen, dan peran.');
    if (!/^[a-zA-Z0-9._-]+$/.test(nik))
      fail(
        400,
        'NIK hanya boleh berisi huruf, angka, titik, garis bawah, dan tanda hubung.',
      );
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      fail(400, 'Alamat email tidak valid.');
    if (
      u.password &&
      (typeof u.password !== 'string' ||
        u.password.length < 12 ||
        u.password.length > 256)
    )
      fail(400, 'Kata sandi awal minimal 12 karakter.');
    return {
      nik,
      name,
      department,
      email,
      role: u.role,
      active: u.active === false || u.active === 0 ? 0 : 1,
    };
  }
  app.post('/api/admin/users', (req, res) => {
    const u = validateUser(req.body);
    if (!req.body.password) fail(400, 'Kata sandi awal wajib diisi.');
    if (db.prepare('SELECT 1 FROM users WHERE nik=?').get(u.nik))
      fail(409, 'NIK sudah terdaftar.');
    const id = uid();
    db.prepare(
      'INSERT INTO users(id,nik,name,email,department,role,password,active) VALUES(?,?,?,?,?,?,?,?)',
    ).run(
      id,
      u.nik,
      u.name,
      u.email,
      u.department,
      u.role,
      hashPassword(req.body.password),
      u.active,
    );
    audit(req.user.id, 'user.created', { id, nik: u.nik });
    res.status(201).json({ id });
  });
  app.put('/api/admin/users/:id', (req, res) => {
    const u = validateUser(req.body),
      id = req.params.id;
    if (!db.prepare('SELECT 1 FROM users WHERE id=?').get(id))
      fail(404, 'Karyawan tidak ditemukan.');
    if (id === req.user.id && (!u.active || u.role !== 'admin'))
      fail(
        400,
        'Anda tidak dapat menonaktifkan atau menurunkan peran akun sendiri.',
      );
    if (db.prepare('SELECT 1 FROM users WHERE nik=? AND id!=?').get(u.nik, id))
      fail(409, 'NIK sudah digunakan.');
    db.prepare(
      'UPDATE users SET nik=?,name=?,email=?,department=?,role=?,active=? WHERE id=?',
    ).run(u.nik, u.name, u.email, u.department, u.role, u.active, id);
    if (req.body.password) {
      db.prepare(
        'UPDATE users SET password=?,must_change_password=1 WHERE id=?',
      ).run(hashPassword(req.body.password), id);
      db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);
    }
    audit(req.user.id, 'user.updated', { id, active: u.active, role: u.role });
    res.json({ ok: true });
  });
  app.post('/api/admin/users/import', (req, res) => {
    if (
      !Array.isArray(req.body.rows) ||
      !req.body.rows.length ||
      req.body.rows.length > 500
    )
      fail(400, 'Impor harus berisi 1–500 baris.');
    const seen = new Set(),
      errors = [],
      rows = [];
    req.body.rows.forEach((row, i) => {
      try {
        const u = validateUser({ ...row, role: 'employee' });
        if (!row.password) throw new Error('Kata sandi awal wajib diisi.');
        if (
          seen.has(u.nik) ||
          db.prepare('SELECT 1 FROM users WHERE nik=?').get(u.nik)
        )
          throw new Error('NIK duplikat atau sudah terdaftar.');
        seen.add(u.nik);
        rows.push({ ...u, password: row.password });
      } catch (e) {
        errors.push({ row: i + 2, error: e.message });
      }
    });
    if (errors.length || req.body.preview)
      return res.status(errors.length ? 400 : 200).json({
        errors,
        count: rows.length,
        preview: rows.map(({ password, ...r }) => r),
      });
    db.exec('BEGIN');
    try {
      for (const u of rows)
        db.prepare(
          'INSERT INTO users(id,nik,name,email,department,role,password) VALUES(?,?,?,?,?,?,?)',
        ).run(
          uid(),
          u.nik,
          u.name,
          u.email,
          u.department,
          'employee',
          hashPassword(u.password),
        );
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
    audit(req.user.id, 'users.imported', { count: rows.length });
    res.json({ count: rows.length });
  });
  app.post('/api/admin/programs', (req, res) => {
    const { courseIds } = req.body,
      title = cleanText(req.body.title, 150),
      description = cleanText(req.body.description, 1000);
    if (
      !title ||
      !Array.isArray(courseIds) ||
      !courseIds.length ||
      new Set(courseIds).size !== courseIds.length
    )
      fail(400, 'Isi nama program dan pilih kelas yang berbeda.');
    for (const id of courseIds)
      if (getCourse(id).status !== 'published')
        fail(400, 'Program hanya dapat berisi kelas yang diterbitkan.');
    const id = uid();
    db.prepare('INSERT INTO programs VALUES(?,?,?,?)').run(
      id,
      title,
      description,
      JSON.stringify(courseIds),
    );
    audit(req.user.id, 'program.created', { id });
    res.status(201).json({ id });
  });
  app.post('/api/admin/assignments', (req, res) => {
    const { courseId, programId, due, department, userIds } = req.body;
    if ((!courseId && !programId) || (courseId && programId))
      fail(400, 'Pilih satu kelas atau program.');
    if (!validDate(due)) fail(400, 'Tanggal tenggat tidak valid.');
    let courseIds = [];
    if (programId) {
      const p = db.prepare('SELECT * FROM programs WHERE id=?').get(programId);
      if (!p) fail(404, 'Program tidak ditemukan.');
      courseIds = JSON.parse(p.course_ids);
    } else courseIds = [courseId];
    for (const id of courseIds)
      if (getCourse(id).status !== 'published')
        fail(400, 'Semua kelas harus berstatus diterbitkan.');
    const users = db
      .prepare(
        "SELECT id,department FROM users WHERE active=1 AND role='employee'",
      )
      .all()
      .filter((u) =>
        department
          ? u.department === department
          : Array.isArray(userIds) && userIds.includes(u.id),
      );
    if (!users.length) fail(400, 'Pilih minimal satu karyawan aktif.');
    db.exec('BEGIN');
    try {
      for (const user of users) {
        for (const id of courseIds)
          db.prepare(
            'INSERT INTO enrollments(id,user_id,course_id,required,due) VALUES(?,?,?,1,?) ON CONFLICT(user_id,course_id) DO UPDATE SET required=1,due=CASE WHEN enrollments.due IS NULL THEN excluded.due WHEN excluded.due IS NULL THEN enrollments.due ELSE MIN(enrollments.due,excluded.due) END',
          ).run(uid(), user.id, id, due || null);
        if (programId)
          db.prepare(
            'INSERT INTO program_assignments(id,user_id,program_id,due) VALUES(?,?,?,?) ON CONFLICT(user_id,program_id) DO NOTHING',
          ).run(uid(), user.id, programId, due || null);
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
    audit(req.user.id, 'learning.assigned', {
      courseIds,
      programId,
      count: users.length,
      due: due || null,
    });
    res.json({ count: users.length });
  });
  app.post('/api/admin/extra-attempts', (req, res) => {
    const { userId, courseId, reason } = req.body;
    if (!cleanText(reason, 500))
      fail(400, 'Alasan pemberian kesempatan wajib diisi.');
    if (!enrollment(userId, courseId) || !getCourse(courseId).quiz)
      fail(400, 'Penugasan atau kuis tidak ditemukan.');
    db.prepare(
      'INSERT INTO extra_attempts(user_id,course_id,count) VALUES(?,?,1) ON CONFLICT(user_id,course_id) DO UPDATE SET count=count+1',
    ).run(userId, courseId);
    audit(req.user.id, 'quiz.extra_attempt', {
      userId,
      courseId,
      reason: cleanText(reason, 500),
    });
    res.json({ ok: true });
  });
  const reportRows = () =>
    db
      .prepare(
        'SELECT e.*,u.name,u.nik,u.department,u.active FROM enrollments e JOIN users u ON e.user_id=u.id ORDER BY e.created_at DESC',
      )
      .all()
      .map((e) => {
        const c = getCourse(e.course_id),
          s = summary(e.user_id, c);
        const today = new Date().toLocaleDateString('en-CA', {
          timeZone: 'Asia/Jakarta',
        });
        const completedAt = s.complete
          ? [
              ...s.progress
                .filter(
                  (p) =>
                    p.complete &&
                    c.lessons.some(
                      (l) => l.id === p.lesson_id && l.required !== false,
                    ),
                )
                .map((p) => p.completed_at || p.updated_at),
              ...s.attempts.filter((a) => a.passed).map((a) => a.created_at),
            ]
              .sort()
              .at(-1)
          : null;
        return {
          ...e,
          courseTitle: c.title,
          percent: s.percent,
          complete: s.complete,
          started: s.started,
          remainingAttempts: s.remainingAttempts,
          score: s.attempts.length
            ? Math.max(...s.attempts.map((a) => a.score))
            : null,
          attemptCount: s.attempts.length,
          hasQuiz: !!c.quiz,
          late: !!(e.due && e.due < today && !s.complete),
          completedAt,
          onTime:
            s.complete &&
            !!e.due &&
            new Date(completedAt.replace(' ', 'T') + 'Z').toLocaleDateString(
              'en-CA',
              { timeZone: 'Asia/Jakarta' },
            ) <= e.due,
        };
      });
  app.get('/api/admin/reports', (req, res) =>
    res.json({
      rows: reportRows(),
      audit: db
        .prepare(
          'SELECT a.*,u.name AS actor FROM audit a LEFT JOIN users u ON a.actor_id=u.id ORDER BY a.id DESC LIMIT 100',
        )
        .all(),
    }),
  );
  app.get('/api/admin/reports.csv', (req, res) => {
    const cell = (v) =>
      '"' +
      String(v ?? '')
        .replaceAll('"', '""')
        .replace(/^[=+@\-\t\r]/, "'$&") +
      '"';
    const rows = reportRows().map((r) => [
      r.nik,
      r.name,
      r.department,
      r.courseTitle,
      r.percent,
      r.complete
        ? 'Selesai'
        : r.late
          ? 'Terlambat'
          : r.started
            ? 'Sedang dipelajari'
            : 'Belum dimulai',
      r.due,
      r.score,
      r.completedAt,
    ]);
    res
      .type('text/csv')
      .attachment('pulc-laporan.csv')
      .send(
        '\uFEFF' +
          [
            [
              'NIK',
              'Nama',
              'Departemen',
              'Kelas',
              'Progres (%)',
              'Status',
              'Tenggat',
              'Nilai terbaik',
              'Selesai pada',
            ],
            ...rows,
          ]
            .map((r) => r.map(cell).join(','))
            .join('\r\n'),
      );
  });
  const uploadDir = path.join(dataDir, 'uploads');
  mkdirSync(uploadDir, { recursive: true });
  const upload = multer({
    dest: uploadDir,
    limits: { fileSize: 100 * 1024 * 1024, files: 1 },
  });
  app.post('/api/admin/uploads', upload.single('file'), (req, res) => {
    if (!req.file) fail(400, 'Pilih file untuk diunggah.');
    const f = req.file,
      bytes = readFileSync(f.path).subarray(0, 16);
    const mime =
      bytes.subarray(0, 5).toString() === '%PDF-'
        ? 'application/pdf'
        : bytes
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          ? 'image/png'
          : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            ? 'image/jpeg'
            : bytes.subarray(0, 4).toString() === 'RIFF' &&
                bytes.subarray(8, 12).toString() === 'WEBP'
              ? 'image/webp'
              : bytes.subarray(4, 8).toString() === 'ftyp'
                ? 'video/mp4'
                : bytes.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163]))
                  ? 'video/webm'
                  : null;
    if (!mime) {
      unlinkSync(f.path);
      fail(
        400,
        'Gunakan file PDF, PNG, JPEG, WebP, MP4, atau WebM yang valid.',
      );
    }
    const id = uid();
    db.prepare('INSERT INTO files VALUES(?,?,?,?,?)').run(
      id,
      f.filename,
      cleanText(f.originalname, 200),
      mime,
      f.size,
    );
    audit(req.user.id, 'file.uploaded', { id, mime, size: f.size });
    res.status(201).json({ id, name: f.originalname, mime, size: f.size });
  });
  app.get('/api/files/:id', (req, res) => {
    const file = db
      .prepare('SELECT * FROM files WHERE id=?')
      .get(req.params.id);
    if (!file) fail(404, 'File tidak ditemukan.');
    const canAccess =
      req.user.role === 'admin' ||
      db
        .prepare('SELECT * FROM courses')
        .all()
        .map(parseCourse)
        .some(
          (c) =>
            canRead(req.user, c) &&
            c.lessons.some((l) => l.assetId === file.id),
        );
    if (!canAccess) fail(403, 'Anda tidak memiliki akses ke materi ini.');
    res
      .type(file.mime)
      .set(
        'Content-Disposition',
        `inline; filename="materi${path.extname(file.original_name).replace(/[^.a-zA-Z0-9]/g, '')}"`,
      )
      .sendFile(path.join(uploadDir, file.filename));
  });
  app.use('/api', (req, res) =>
    res.status(404).json({ error: 'Endpoint tidak ditemukan.' }),
  );
  const dist = path.resolve('dist');
  if (existsSync(dist)) {
    app.use(express.static(dist));
    app.get('/{*splat}', (req, res) =>
      res.sendFile(path.join(dist, 'index.html')),
    );
  }
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(413).json({ error: 'Ukuran file maksimal 100 MB.' });
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({
      error:
        status >= 500
          ? 'Terjadi kesalahan pada server.'
          : err.message || 'Permintaan tidak valid.',
    });
  });
  return app;
}
