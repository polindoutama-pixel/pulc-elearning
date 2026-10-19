import { test, expect } from '@playwright/test';
const base = process.env.PULC_TEST_URL || 'http://127.0.0.1:3011';
async function login(page) {
  await page.goto(base);
  await page
    .getByRole('button', { name: 'Sebagai admin', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Ringkasan Pembelajaran' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Kelola Kelas', exact: true }).click();
}

test('rich text formats articles, saves safe links, and bottom add button appends focused lessons', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await login(page);
  await page.getByRole('button', { name: 'Buat kelas', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog
    .getByLabel('Judul kelas', { exact: true })
    .fill('Artikel Rich Text E2E');
  await dialog
    .getByLabel('Deskripsi', { exact: true })
    .fill('Panduan yang ditulis dengan editor visual.');
  await dialog.getByLabel('Status publikasi').selectOption('published');
  await dialog.getByRole('button', { name: 'Materi 0', exact: true }).click();
  await dialog
    .getByRole('button', { name: 'Tambah materi', exact: true })
    .click();
  let lesson = dialog.locator('.lesson-editor').nth(0);
  await expect(
    lesson.getByLabel('Judul materi', { exact: true }),
  ).toBeFocused();
  await lesson
    .getByLabel('Judul materi', { exact: true })
    .fill('Panduan kerja');
  let editor = lesson.getByRole('textbox', { name: 'Isi materi', exact: true });
  await editor.fill('Utamakan keselamatan');
  await editor.selectText();
  await lesson.getByLabel('Gaya paragraf').selectOption('h2');
  await lesson.getByRole('button', { name: 'Tebal', exact: true }).click();
  await lesson.getByRole('button', { name: 'Miring', exact: true }).click();
  await lesson
    .getByRole('button', { name: 'Garis bawah', exact: true })
    .click();
  await expect(editor.locator('h2')).toHaveText('Utamakan keselamatan');
  for (const tag of ['strong', 'em', 'u'])
    await expect(editor.locator(tag)).toHaveText('Utamakan keselamatan');
  await lesson
    .getByRole('button', { name: 'Tambahkan tautan', exact: true })
    .click();
  await lesson.getByLabel('Alamat tautan').fill('javascript:alert(1)');
  await lesson.getByRole('button', { name: 'Terapkan tautan' }).click();
  await expect(lesson.getByRole('alert')).toContainText('Gunakan alamat HTTPS');
  await lesson.getByLabel('Alamat tautan').fill('https://example.com/panduan');
  await lesson.getByRole('button', { name: 'Terapkan tautan' }).click();
  await expect(editor.locator('a')).toHaveAttribute(
    'href',
    'https://example.com/panduan',
  );
  await dialog
    .getByRole('button', { name: 'Tambah materi di bawah', exact: true })
    .click();
  await expect(dialog.locator('.lesson-editor')).toHaveCount(2);
  lesson = dialog.locator('.lesson-editor').nth(1);
  await expect(
    lesson.getByLabel('Judul materi', { exact: true }),
  ).toBeFocused();
  await lesson
    .getByLabel('Judul materi', { exact: true })
    .fill('Langkah persiapan');
  editor = lesson.getByRole('textbox', { name: 'Isi materi', exact: true });
  await editor.fill('Periksa perlengkapan kerja');
  await lesson
    .getByRole('button', { name: 'Daftar poin', exact: true })
    .click();
  await expect(editor.locator('ul li')).toHaveText(
    'Periksa perlengkapan kerja',
  );
  await lesson.getByRole('button', { name: 'Urungkan', exact: true }).click();
  await lesson.getByRole('button', { name: 'Ulangi', exact: true }).click();
  await expect(editor.locator('ul li')).toHaveText(
    'Periksa perlengkapan kerja',
  );
  await lesson
    .getByRole('button', { name: 'Daftar bernomor', exact: true })
    .click();
  await expect(editor.locator('ol li')).toHaveText(
    'Periksa perlengkapan kerja',
  );
  await dialog
    .getByRole('button', { name: 'Tambah materi di bawah', exact: true })
    .click();
  lesson = dialog.locator('.lesson-editor').nth(2);
  await expect(
    lesson.getByLabel('Judul materi', { exact: true }),
  ).toBeFocused();
  await lesson
    .getByLabel('Judul materi', { exact: true })
    .fill('Catatan supervisor');
  editor = lesson.getByRole('textbox', { name: 'Isi materi', exact: true });
  await editor.fill('Tanyakan jika belum memahami instruksi.');
  await lesson.getByRole('button', { name: 'Kutipan', exact: true }).click();
  await expect(editor.locator('blockquote')).toHaveText(
    'Tanyakan jika belum memahami instruksi.',
  );
  await lesson
    .getByRole('checkbox', { name: 'Materi wajib untuk kelulusan' })
    .uncheck();
  await dialog.getByRole('button', { name: 'Simpan kelas' }).click();
  await expect(dialog).toHaveCount(0);
  const state = await (await page.request.get(base + '/api/bootstrap')).json();
  const c = state.courses.find((c) => c.title === 'Artikel Rich Text E2E');
  expect(c.lessons).toHaveLength(3);
  expect(c.lessons[0].body).toContain('<h2>');
  expect(c.lessons[0].body).toContain('<strong>');
  expect(c.lessons[0].body).toContain('<u>');
  expect(c.lessons[0].body).toContain('https://example.com/panduan');
  expect(c.lessons[0].body).not.toContain('javascript:');
  expect(c.lessons[1].body).toContain('<ol>');
  expect(c.lessons[2].body).toContain('<blockquote>');
  expect(c.lessons[2].required).toBe(false);
  await page.reload();
  await page
    .getByRole('button', { name: 'Edit Artikel Rich Text E2E', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Materi 3', exact: true })
    .click();
  await expect(
    page
      .getByRole('textbox', { name: 'Isi materi', exact: true })
      .first()
      .locator('h2'),
  ).toHaveText('Utamakan keselamatan');
  await page.screenshot({
    path: '/tmp/pulc-rich-text-editor.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Batal', exact: true }).click();
  await page.goto(base + '/#/preview/' + c.id);
  const article = page.locator('.lesson-content .prose');
  await expect(article.locator('h2')).toHaveText('Utamakan keselamatan');
  await expect(article.locator('u')).toHaveText('Utamakan keselamatan');
  expect(errors).toEqual([]);
});

test('opening a legacy enrolled article keeps its original HTML when only metadata is changed', async ({
  page,
  request,
}) => {
  await request.post(base + '/api/auth/login', {
    data: { nik: 'ADMIN001', password: 'BelajarPULC!2026' },
  });
  const body =
    '<h2>Artikel lama</h2><p>Belajar <strong>bersama</strong>.</p><h4>Catatan</h4><p><a href="https://example.com">Panduan</a></p>';
  const created = await request.post(base + '/api/admin/courses', {
    data: {
      title: 'Artikel Lama E2E',
      description: 'Artikel yang sudah memiliki peserta.',
      category: 'Orientasi',
      duration: 5,
      cover: 'company',
      status: 'published',
      sequential: true,
      lessons: [
        { id: 'old', type: 'text', title: 'Materi lama', body, required: true },
      ],
      quiz: null,
    },
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  await request.post(base + '/api/admin/assignments', {
    data: { courseId: id, department: 'Produksi' },
  });
  const before = (
    await (await request.get(base + '/api/bootstrap')).json()
  ).courses.find((c) => c.id === id).lessons[0].body;
  await login(page);
  await page
    .getByRole('button', { name: 'Edit Artikel Lama E2E', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Materi 1', exact: true }).click();
  const editor = dialog.getByRole('textbox', {
    name: 'Isi materi',
    exact: true,
  });
  await expect(editor.locator('h2')).toHaveText('Artikel lama');
  await expect(editor).not.toContainText('<h2>');
  await dialog.getByRole('button', { name: 'Informasi', exact: true }).click();
  await dialog.getByLabel('Estimasi durasi (menit)').fill('10');
  await dialog.getByRole('button', { name: 'Simpan kelas' }).click();
  await expect(dialog).toHaveCount(0);
  const after = (
    await (await request.get(base + '/api/bootstrap')).json()
  ).courses.find((c) => c.id === id);
  expect(after.lessons[0].body).toBe(before);
  expect(after.duration).toBe(10);
});

test('rich text toolbar and the bottom add button work on a phone screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page
    .getByRole('button', { name: 'Sebagai admin', exact: true })
    .click();
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await page.getByRole('link', { name: 'Kelola Kelas', exact: true }).click();
  await page.getByRole('button', { name: 'Buat kelas', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Materi 0', exact: true }).click();
  await dialog
    .getByRole('button', { name: 'Tambah materi', exact: true })
    .click();
  const editor = dialog.getByRole('textbox', {
    name: 'Isi materi',
    exact: true,
  });
  await editor.fill('Panduan di ponsel');
  await editor.selectText();
  await dialog.getByRole('button', { name: 'Tebal', exact: true }).click();
  await expect(editor.locator('strong')).toHaveText('Panduan di ponsel');
  await dialog
    .getByRole('button', { name: 'Tambah materi di bawah', exact: true })
    .click();
  await expect(dialog.locator('.lesson-editor')).toHaveCount(2);
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
});
