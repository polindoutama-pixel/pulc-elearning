import { test, expect } from '@playwright/test';
const appUrl = process.env.PULC_TEST_URL || 'http://127.0.0.1:3011';
async function login(page, role = 'employee') {
  await page.goto(appUrl);
  await page
    .getByRole('button', {
      name: role === 'admin' ? 'Sebagai admin' : 'Sebagai karyawan',
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('heading', {
      name: role === 'admin' ? 'Ringkasan Pembelajaran' : 'Selamat datang,',
      exact: false,
    }),
  ).toBeVisible();
}
test('employee completes onboarding class, reloads progress, filters catalog, and logs out', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await login(page);
  await page.screenshot({ path: '/tmp/pulc-home-desktop.png', fullPage: true });
  await page
    .getByRole('button', { name: 'Lanjutkan pembelajaran', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Budaya kerja & kolaborasi' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Selesai & lanjutkan' }).click();
  await expect(
    page.getByRole('heading', { name: 'Mengenal tim & kontak penting' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Selesai & lanjutkan' }).click();
  await expect(
    page.getByRole('heading', { name: 'Uji pemahaman Anda' }),
  ).toBeVisible();
  await page
    .getByText('Mengonfirmasi kepada penanggung jawab', { exact: true })
    .click();
  await page
    .getByText('Setelah memperoleh pelatihan dan izin yang sesuai', {
      exact: true,
    })
    .click();
  await page.getByRole('button', { name: 'Kumpulkan jawaban' }).click();
  await expect(
    page.getByRole('heading', { name: 'Selamat, Anda berhasil!' }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole('button', { name: 'Kuis pembelajaran', exact: false })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Selamat, Anda berhasil!' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Katalog Kelas', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Cari dalam katalog' })
    .fill('Quality');
  await expect(
    page.getByRole('button', {
      name: 'Kualitas Dasar Quality Control',
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.locator('.course-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Keluar', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Perjalanan belajar dimulai di sini.' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test('admin creates and publishes a class, program, employee, and assignment', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await login(page, 'admin');
  await expect(
    page.getByRole('heading', { name: 'Ringkasan Pembelajaran' }),
  ).toBeVisible();
  await page.screenshot({
    path: '/tmp/pulc-admin-desktop.png',
    fullPage: true,
  });
  await page.getByRole('link', { name: 'Kelola Kelas', exact: true }).click();
  await page.getByRole('button', { name: 'Buat kelas', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Judul kelas', exact: true })
    .fill('Orientasi Tim Baru E2E');
  await page
    .getByRole('textbox', { name: 'Deskripsi', exact: true })
    .fill('Materi untuk pengujian alur pembelajaran.');
  await page.getByLabel('Status publikasi').selectOption('published');
  await page.getByRole('button', { name: 'Materi 0', exact: true }).click();
  await page
    .getByRole('button', { name: 'Tambah materi', exact: true })
    .click();
  await page
    .getByRole('textbox', { name: 'Judul materi', exact: true })
    .fill('Selamat datang di tim');
  await page
    .getByRole('textbox', { name: 'Isi materi', exact: false })
    .fill('Pelajari peran dan tanggung jawab bersama tim Anda.');
  await page.getByRole('button', { name: 'Simpan kelas', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByText('Orientasi Tim Baru E2E', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Program Onboarding', exact: true })
    .click();
  await page.getByRole('button', { name: 'Buat program', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Nama program', exact: true })
    .fill('Program E2E');
  await page.getByLabel('Orientasi Tim Baru E2E', { exact: false }).check();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Buat program', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Program E2E', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Karyawan', exact: true }).click();
  await page
    .getByRole('button', { name: 'Tambah karyawan', exact: true })
    .click();
  await page
    .getByRole('textbox', { name: 'Nama lengkap' })
    .fill('Karyawan E2E');
  await page.getByRole('textbox', { name: 'NIK / ID Karyawan' }).fill('E2E001');
  await page.getByRole('combobox', { name: 'Departemen' }).fill('Produksi');
  await page
    .getByLabel('Kata sandi awal', { exact: false })
    .fill('PasswordAwal!2026');
  await page.getByRole('button', { name: 'Simpan karyawan' }).click();
  await expect(page.getByText('Karyawan E2E', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Penugasan', exact: true }).click();
  await page
    .getByRole('button', { name: 'Buat penugasan', exact: true })
    .click();
  await page
    .getByLabel('Pilih pembelajaran')
    .selectOption({ label: 'Orientasi Tim Baru E2E' });
  await page.getByLabel('Departemen', { exact: true }).selectOption('Produksi');
  await page.getByLabel('Tenggat (opsional)').fill('2027-01-31');
  await page
    .getByRole('button', { name: 'Tugaskan pembelajaran', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page
      .getByRole('row')
      .filter({ hasText: 'Karyawan E2E' })
      .filter({ hasText: 'Orientasi Tim Baru E2E' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Laporan', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Ekspor CSV' }).click();
  expect((await download).suggestedFilename()).toBe('pulc-laporan.csv');
  expect(errors).toEqual([]);
});
test('mobile navigation and course layout fit a phone screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.screenshot({ path: '/tmp/pulc-home-mobile.png', fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await page.getByRole('link', { name: 'Katalog Kelas', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Katalog Kelas', exact: true }),
  ).toBeVisible();
  await page.locator('.course-card').first().click();
  await expect(
    page.getByRole('heading', { name: 'Perjalanan belajar Anda' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test('uploaded video, image, and PDF support a real learning session', async ({
  page,
  request,
}) => {
  const { readFileSync } = await import('node:fs');
  await request.post(appUrl + '/api/auth/login', {
    data: { nik: 'ADMIN001', password: 'BelajarPULC!2026' },
  });
  const upload = async (name, mimeType) => {
    const r = await request.post(appUrl + '/api/admin/uploads', {
      multipart: {
        file: {
          name,
          mimeType,
          buffer: readFileSync('tests/fixtures/' + name),
        },
      },
    });
    expect(r.status()).toBe(201);
    return (await r.json()).id;
  };
  const videoId = await upload('intro.webm', 'video/webm'),
    imageId = await upload('pixel.png', 'image/png'),
    pdfId = await upload('slides.pdf', 'application/pdf');
  const created = await request.post(appUrl + '/api/admin/courses', {
    data: {
      title: 'Kelas Multimedia E2E',
      description: 'Video, gambar, dan presentasi.',
      category: 'Orientasi',
      duration: 1,
      cover: 'company',
      status: 'published',
      sequential: true,
      lessons: [
        {
          id: 'mv',
          title: 'Video pengenalan',
          type: 'video',
          assetId: videoId,
          durationSeconds: 3,
          required: true,
        },
        {
          id: 'mi',
          title: 'Gambar orientasi',
          type: 'image',
          assetId: imageId,
          required: true,
        },
        {
          id: 'mp',
          title: 'Presentasi tim',
          type: 'pdf',
          assetId: pdfId,
          required: true,
        },
      ],
      quiz: null,
    },
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  await login(page);
  await page.goto(appUrl + '/#/course/' + id);
  await page
    .getByRole('button', { name: 'Mulai belajar', exact: true })
    .click();
  await expect(page.locator('video')).toBeVisible();
  await page.locator('video').evaluate((el) => el.play());
  await expect(
    page.getByRole('button', { name: 'Materi berikutnya', exact: true }),
  ).toBeEnabled({ timeout: 15000 });
  await page
    .getByRole('button', { name: 'Materi berikutnya', exact: true })
    .click();
  await expect(
    page.getByRole('img', { name: 'Gambar orientasi' }),
  ).toBeVisible();
  expect(
    await page
      .getByRole('img', { name: 'Gambar orientasi' })
      .evaluate((el) => el.complete && el.naturalWidth > 0),
  ).toBe(true);
  await page.getByRole('button', { name: 'Selesai & lanjutkan' }).click();
  await expect(page.locator('iframe[title="Presentasi tim"]')).toBeVisible();
  const pdf = await page.request.get(appUrl + '/api/files/' + pdfId);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  await page.getByRole('button', { name: 'Selesai & lanjutkan' }).click();
  await expect(page.locator('.player-top')).toContainText('100% selesai');
});

test('admin previews an unpublished class without enrollment or saved progress', async ({
  page,
  request,
}) => {
  await request.post(appUrl + '/api/auth/login', {
    data: { nik: 'ADMIN001', password: 'BelajarPULC!2026' },
  });
  const created = await request.post(appUrl + '/api/admin/courses', {
    data: {
      title: 'Draft Preview E2E',
      description: 'Pratinjau admin sebelum publikasi.',
      category: 'Orientasi',
      duration: 5,
      cover: 'company',
      status: 'draft',
      sequential: true,
      lessons: [
        {
          id: 'preview-1',
          module: 'Pengenalan',
          title: 'Materi pratinjau',
          type: 'text',
          body: '<h2>Konten yang belum terbit</h2><p>Contoh materi.</p>',
          required: true,
        },
      ],
      quiz: {
        passScore: 80,
        maxAttempts: 3,
        questions: [
          {
            id: 'pq',
            text: 'Pilih jawaban yang benar',
            options: ['Pilihan benar', 'Pilihan salah'],
            answer: 0,
          },
        ],
      },
    },
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  await login(page, 'admin');
  await page.goto(appUrl + '/#/course/' + id);
  await page.getByRole('button', { name: 'Pratinjau materi' }).click();
  await expect(
    page.getByRole('heading', { name: 'Konten yang belum terbit' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Lanjutkan pratinjau' }).click();
  await expect(
    page.getByText(
      'Pratinjau admin. Jawaban benar ditampilkan dan tidak dinilai.',
    ),
  ).toBeVisible();
  const state = await (
    await page.request.get(appUrl + '/api/bootstrap')
  ).json();
  expect(state.enrollments.some((e) => e.course_id === id)).toBe(false);
  expect(state.summaries.find((s) => s.courseId === id).progress).toHaveLength(
    0,
  );
});

test('new employee changes the initial password before learning', async ({
  page,
  request,
}) => {
  await request.post(appUrl + '/api/auth/login', {
    data: { nik: 'ADMIN001', password: 'BelajarPULC!2026' },
  });
  const created = await request.post(appUrl + '/api/admin/users', {
    data: {
      nik: 'PW-E2E',
      name: 'Pengguna Awal',
      department: 'Produksi',
      role: 'employee',
      password: 'PasswordAwal!2026',
    },
  });
  expect(created.status()).toBe(201);
  await page.goto(appUrl);
  await page.getByRole('textbox', { name: 'NIK / ID Karyawan' }).fill('PW-E2E');
  await page
    .getByLabel('Kata sandi', { exact: true })
    .fill('PasswordAwal!2026');
  await page.getByRole('button', { name: 'Masuk ke PULC' }).click();
  await expect(
    page.getByRole('heading', { name: 'Amankan akun Anda' }),
  ).toBeVisible();
  await page.getByLabel('Kata sandi saat ini').fill('PasswordAwal!2026');
  await page
    .getByLabel('Kata sandi baru', { exact: true })
    .fill('PasswordBaru!2026');
  await page.getByLabel('Konfirmasi kata sandi baru').fill('PasswordBaru!2026');
  await page.getByRole('button', { name: 'Simpan kata sandi' }).click();
  await expect(
    page.getByRole('heading', { name: 'Selamat datang, Pengguna' }),
  ).toBeVisible();
});

test('development proxy preserves origin checks and allows normal login', async ({
  page,
}) => {
  test.skip(
    !!process.env.PULC_TEST_URL,
    'Proxy development terpisah hanya dimulai pada konfigurasi lokal.',
  );
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:5181');
  await page
    .getByRole('button', { name: 'Sebagai admin', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Ringkasan Pembelajaran' }),
  ).toBeVisible();
  const health = await page.request.get('http://127.0.0.1:5181/api/health');
  expect(health.status()).toBe(200);
  expect(errors).toEqual([]);
});
