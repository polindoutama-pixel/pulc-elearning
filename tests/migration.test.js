import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { once } from 'node:events';
import { openDatabase } from '../server/db.js';
import { createApp } from '../server/app.js';
test('legacy quiz attempts migrate to post-tests without losing scores or completion records', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'pulc-migration-')),
    filename = path.join(directory, 'old.sqlite');
  let db = new DatabaseSync(filename);
  try {
    db.exec(`CREATE TABLE users (id TEXT PRIMARY KEY,nik TEXT,name TEXT,email TEXT,department TEXT,role TEXT,password TEXT,active INTEGER,must_change_password INTEGER);
   CREATE TABLE courses (id TEXT PRIMARY KEY,title TEXT,description TEXT,category TEXT,duration INTEGER,cover TEXT,status TEXT,sequential INTEGER,lessons TEXT,quiz TEXT,created_at TEXT,audience TEXT DEFAULT '[]');
   CREATE TABLE attempts (id TEXT PRIMARY KEY,user_id TEXT,course_id TEXT,score INTEGER,passed INTEGER,created_at TEXT);
   INSERT INTO users VALUES('legacy','OLD','Lama','','Produksi','employee','not-a-real-hash',1,0);
   INSERT INTO attempts VALUES('legacy-attempt','legacy','legacy-course',90,1,'2026-01-01 01:00:00');`);
    const lessons = [
      {
        id: 'one',
        title: 'Materi lama',
        type: 'text',
        body: '<p>Materi lama</p>',
        required: true,
      },
    ];
    const quiz = {
      passScore: 80,
      maxAttempts: 3,
      questions: [{ id: 'q', text: 'Soal', options: ['A', 'B'], answer: 1 }],
    };
    db.prepare(
      "INSERT INTO courses VALUES('legacy-course','Lama','Lama','Orientasi',5,'company','published',0,?,?,'2026-01-01','[]')",
    ).run(JSON.stringify(lessons), JSON.stringify(quiz));
    db.close();
    db = openDatabase(filename);
    db.prepare(
      "INSERT INTO progress(user_id,course_id,lesson_id,complete,completed_at) VALUES('legacy','legacy-course','one',1,'2026-01-01 00:00:00')",
    ).run();
    db.prepare(
      "INSERT INTO enrollments(id,user_id,course_id) VALUES('enrollment','legacy','legacy-course')",
    ).run();
    db.close();
    db = openDatabase(filename);
    const attempt = db.prepare('SELECT * FROM attempts').get();
    assert.equal(attempt.phase, 'post');
    assert.equal(attempt.score, 90);
    assert.equal(attempt.id, 'legacy-attempt');
    assert.equal(
      db.prepare('SELECT pre_quiz FROM courses').get().pre_quiz,
      null,
    );
    assert.equal(
      db.prepare('SELECT completed_at FROM progress').get().completed_at,
      '2026-01-01 00:00:00',
    );
    db.prepare('INSERT INTO sessions(id,user_id,expires) VALUES(?,?,?)').run(
      'migration-session',
      'legacy',
      Date.now() + 60000,
    );
    const server = createApp(db, { dataDir: directory }).listen(0, '127.0.0.1');
    await once(server, 'listening');
    try {
      const response = await fetch(
        'http://127.0.0.1:' + server.address().port + '/api/bootstrap',
        { headers: { Cookie: 'pulc_session=migration-session' } },
      );
      const data = await response.json();
      assert.equal(response.status, 200);
      const summary = data.summaries.find(
        (s) => s.courseId === 'legacy-course',
      );
      assert.equal(summary.complete, true);
      assert.equal(summary.percent, 100);
      assert.equal(summary.remainingAttempts, 2);
      assert.equal(summary.attempts[0].score, 90);
      assert.equal(data.courses[0].preQuiz, null);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
