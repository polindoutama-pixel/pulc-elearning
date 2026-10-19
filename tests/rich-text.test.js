import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanHTML, validateLessons } from '../server/course-content.js';
test('rich text retains supported formatting while removing unsafe pasted content and links', () => {
  const body =
    '<h2>Judul</h2><p><strong>Tebal</strong> <em>Miring</em> <u>Garis bawah</u></p><ol><li>Langkah</li></ol><blockquote>Catatan</blockquote><p><a href="https://example.com/panduan">Panduan</a><a href="javascript:alert(1)">Tidak aman</a></p><script>alert(1)</script><img src=x onerror="alert(1)">';
  const saved = validateLessons([
    { id: 'text', title: 'Artikel', type: 'text', body, required: true },
  ]);
  assert.equal(saved[0].body, cleanHTML(body));
  for (const tag of [
    '<h2>',
    '<strong>',
    '<em>',
    '<u>',
    '<ol>',
    '<li>',
    '<blockquote>',
  ])
    assert.ok(saved[0].body.includes(tag));
  assert.ok(saved[0].body.includes('href="https://example.com/panduan"'));
  for (const unsafe of ['javascript:', '<script', 'onerror', '<img'])
    assert.ok(!saved[0].body.includes(unsafe));
  assert.throws(
    () =>
      validateLessons([
        {
          id: 'empty',
          title: 'Kosong',
          type: 'text',
          body: '<p><br></p>',
          required: true,
        },
      ]),
    /tidak boleh kosong/,
  );
});
