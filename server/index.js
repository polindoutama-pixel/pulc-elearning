import path from 'node:path';
import { openDatabase } from './db.js';
import { seed } from './seed.js';
import { createApp } from './app.js';
const production = process.env.NODE_ENV === 'production';
const demo =
  process.env.PULC_DEMO === 'true' ||
  (!production && process.env.PULC_DEMO !== 'false');
if (production && demo)
  throw new Error('Mode demo tidak boleh digunakan dalam produksi.');
const dataDir = path.resolve(process.env.DATA_DIR || 'data');
const db = openDatabase(path.join(dataDir, 'pulc.sqlite'));
seed(db, { demo });
const app = createApp(db, { dataDir, production, demo });
const server = app.listen(
  Number(process.env.PORT || 3001),
  '0.0.0.0',
  (error) => {
    if (error) {
      console.error('Gagal memulai PULC:', error.message);
      db.close();
      process.exit(1);
    }
    console.log(
      `PULC API berjalan pada port ${server.address().port} (${demo ? 'demo' : 'non-demo'}).`,
    );
  },
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
