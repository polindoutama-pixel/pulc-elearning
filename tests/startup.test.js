import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';

test('startup exits with an error when the API port is already occupied', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'pulc-startup-'));
  const occupied = createServer();
  occupied.listen(0, '0.0.0.0');
  await once(occupied, 'listening');
  try {
    const child = spawn(process.execPath, ['server/index.js'], {
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PULC_DEMO: 'true',
        PORT: String(occupied.address().port),
        DATA_DIR: directory,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '',
      stderr = '';
    child.stdout.on('data', (c) => (stdout += c));
    child.stderr.on('data', (c) => (stderr += c));
    const [exitCode] = await once(child, 'exit');
    assert.equal(exitCode, 1);
    assert.match(stderr, /Gagal memulai PULC.*EADDRINUSE/);
    assert.doesNotMatch(stdout, /PULC API berjalan/);
  } finally {
    await new Promise((resolve) => occupied.close(resolve));
    rmSync(directory, { recursive: true, force: true });
  }
});
