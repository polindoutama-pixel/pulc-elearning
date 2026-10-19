import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function checkPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(password, salt, 64);
  return (
    candidate.length === Buffer.from(hash, 'hex').length &&
    timingSafeEqual(candidate, Buffer.from(hash, 'hex'))
  );
}
export function openDatabase(filename) {
  mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY,value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, nik TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', department TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','employee')), password TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, must_change_password INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS courses (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, duration INTEGER NOT NULL, cover TEXT NOT NULL, status TEXT NOT NULL, sequential INTEGER NOT NULL DEFAULT 0, lessons TEXT NOT NULL, quiz TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, audience TEXT NOT NULL DEFAULT '[]');
    CREATE TABLE IF NOT EXISTS programs (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, course_ids TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS enrollments (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), course_id TEXT REFERENCES courses(id), required INTEGER NOT NULL DEFAULT 0, due TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id,course_id));
    CREATE TABLE IF NOT EXISTS program_assignments (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), program_id TEXT REFERENCES programs(id), due TEXT, UNIQUE(user_id,program_id));
    CREATE TABLE IF NOT EXISTS progress (user_id TEXT REFERENCES users(id), course_id TEXT REFERENCES courses(id), lesson_id TEXT NOT NULL, complete INTEGER NOT NULL DEFAULT 0, position REAL NOT NULL DEFAULT 0, ranges TEXT NOT NULL DEFAULT '[]', completed_at TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id,course_id,lesson_id));
    CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), course_id TEXT REFERENCES courses(id), score INTEGER NOT NULL, passed INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS extra_attempts (user_id TEXT REFERENCES users(id), course_id TEXT REFERENCES courses(id), count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(user_id,course_id));
    CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, filename TEXT NOT NULL, original_name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, actor_id TEXT, action TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
  // Additive migrations preserve existing local learning records.
  if (
    !db
      .prepare('PRAGMA table_info(courses)')
      .all()
      .some((c) => c.name === 'audience')
  )
    db.exec(
      "ALTER TABLE courses ADD COLUMN audience TEXT NOT NULL DEFAULT '[]'",
    );
  if (
    !db
      .prepare('PRAGMA table_info(progress)')
      .all()
      .some((c) => c.name === 'completed_at')
  )
    db.exec('ALTER TABLE progress ADD COLUMN completed_at TEXT');
  if (
    !db
      .prepare('PRAGMA table_info(courses)')
      .all()
      .some((c) => c.name === 'pre_quiz')
  )
    db.exec('ALTER TABLE courses ADD COLUMN pre_quiz TEXT');
  if (
    !db
      .prepare('PRAGMA table_info(attempts)')
      .all()
      .some((c) => c.name === 'phase')
  )
    db.exec(
      "ALTER TABLE attempts ADD COLUMN phase TEXT NOT NULL DEFAULT 'post' CHECK(phase IN ('pre','post'))",
    );
  db.exec(
    'UPDATE progress SET completed_at=updated_at WHERE complete=1 AND completed_at IS NULL',
  );
  return db;
}
