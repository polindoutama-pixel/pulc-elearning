import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const base = process.env.PULC_TEST_URL || 'http://127.0.0.1:3011';
const q = {
  id: 'q',
  text: 'Apa pilihan yang tepat?',
  options: ['Belum tepat', 'Pilihan yang tepat'],
  answer: 1,
};
async function adminLogin(request) {
  expect(
    (
      await request.post(base + '/api/auth/login', {
        data: { nik: 'ADMIN001', password: 'BelajarPULC!2026' },
      })
    ).status(),
  ).toBe(200);
}
async function upload(request, name, mimeType) {
  const r = await request.post(base + '/api/admin/uploads', {
    multipart: {
      file: { name, mimeType, buffer: readFileSync('tests/fixtures/' + name) },
    },
  });
  expect(r.status()).toBe(201);
  return (await r.json()).id;
}
async function employeeLogin(page) {
  await page.goto(base);
  await page
    .getByRole('button', { name: 'Sebagai karyawan', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Selamat datang,', exact: false }),
  ).toBeVisible();
}
async function create(request, extra) {
  const r = await request.post(base + '/api/admin/courses', {
    data: {
      title: 'Kelas Revisi E2E',
      description: 'Materi multimedia lengkap',
      category: 'Orientasi',
      duration: 5,
      cover: 'company',
      status: 'published',
      sequential: true,
      quiz: null,
      ...extra,
    },
  });
  expect(r.status()).toBe(201);
  return (await r.json()).id;
}

test('pre-test opens materials even with score zero, audio plays, documents download, and post-test completes learning', async ({
  page,
  request,
}) => {
  await adminLogin(request);
  const audio = await upload(request, 'intro.wav', 'audio/wav'),
    pdf = await upload(request, 'slides.pdf', 'application/pdf'),
    doc = await upload(
      request,
      'handbook.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
  const id = await create(request, {
    preQuiz: { questions: [q] },
    quiz: { passScore: 80, maxAttempts: 2, questions: [q] },
    lessons: [
      {
        id: 'audio',
        title: 'Arahan Audio',
        type: 'audio',
        assetId: audio,
        durationSeconds: 3,
        description: 'Dengarkan arahan sebelum melanjutkan ke panduan.',
        required: true,
      },
      {
        id: 'pdf',
        title: 'Slide PDF',
        type: 'pdf',
        assetId: pdf,
        description: 'Baca slide sebagai persiapan kerja.',
        required: true,
      },
      {
        id: 'word',
        title: 'Panduan Word',
        type: 'document',
        assetId: doc,
        description: 'Unduh panduan untuk langkah kerja terperinci.',
        required: true,
      },
    ],
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await employeeLogin(page);
  await page.goto(base + '/#/course/' + id);
  await expect(
    page.getByText('Pre-test · Evaluasi awal', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Mulai belajar', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Kenali pemahaman awal Anda' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'MATERI 01 Arahan Audio' }),
  ).toBeDisabled();
  await page.getByText('Belum tepat', { exact: true }).click();
  await page.getByRole('button', { name: 'Kumpulkan jawaban' }).click();
  await expect(
    page.getByRole('heading', { name: 'Pemahaman awal Anda sudah tercatat' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Arahan Audio', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Dengarkan arahan sebelum melanjutkan ke panduan.', {
      exact: true,
    }),
  ).toBeVisible();
  await page.locator('audio').evaluate((el) => el.play());
  await expect(
    page.getByRole('button', { name: 'Materi berikutnya', exact: true }),
  ).toBeEnabled({ timeout: 15000 });
  await page
    .getByRole('button', { name: 'Materi berikutnya', exact: true })
    .click();
  let downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Unduh PDF', exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('slides.pdf');
  await expect(
    page.getByText('Baca slide sebagai persiapan kerja.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Selesai & lanjutkan' }).click();
  await expect(
    page.getByText('Unduh panduan untuk langkah kerja terperinci.', {
      exact: true,
    }),
  ).toBeVisible();
  downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Unduh dokumen' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('handbook.docx');
  await page.getByRole('button', { name: 'Selesai & lanjutkan' }).click();
  await expect(
    page.getByRole('heading', { name: 'Uji pemahaman Anda' }),
  ).toBeVisible();
  await page.getByText('Pilihan yang tepat', { exact: true }).click();
  await page.getByRole('button', { name: 'Kumpulkan jawaban' }).click();
  await expect(
    page.getByRole('heading', { name: 'Selamat, Anda berhasil!' }),
  ).toBeVisible();
  await expect(
    page.getByText('Nilai pre-test:', { exact: false }),
  ).toContainText('0');
  const report = await (await request.get(base + '/api/admin/reports')).json();
  const row = report.rows.find(
    (r) => r.course_id === id && r.nik === 'PU2026001',
  );
  expect(row.preScore).toBe(0);
  expect(row.score).toBe(100);
  expect(row.complete).toBe(true);
  expect(errors).toEqual([]);
});

test('admin configures YouTube, Canva, audio, explanations, and both evaluations through the editor', async ({
  page,
}) => {
  await page.goto(base);
  await page
    .getByRole('button', { name: 'Sebagai admin', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Ringkasan Pembelajaran' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Kelola Kelas', exact: true }).click();
  await page.getByRole('button', { name: 'Buat kelas', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog
    .getByLabel('Judul kelas', { exact: true })
    .fill('Editor Multimedia & Evaluasi E2E');
  await dialog
    .getByLabel('Deskripsi', { exact: true })
    .fill('Kelas dengan evaluasi awal dan akhir.');
  await dialog.getByLabel('Status publikasi').selectOption('published');
  await dialog.getByRole('button', { name: 'Materi 0', exact: true }).click();
  await dialog.getByRole('button', { name: 'Tambah materi' }).click();
  let lesson = dialog.locator('.lesson-editor').nth(0);
  await lesson
    .getByLabel('Judul materi', { exact: true })
    .fill('Belajar lewat YouTube');
  await lesson.getByLabel('Format', { exact: true }).selectOption('video');
  await lesson.getByLabel('Sumber video').selectOption('youtube');
  await lesson
    .getByLabel('Link video YouTube')
    .fill('https://youtu.be/dQw4w9WgXcQ');
  await lesson.getByLabel('Durasi video (detik)').fill('30');
  await lesson
    .getByLabel('Deskripsi / arahan materi (opsional)')
    .fill('Perhatikan langkah pertama pada video.');
  await dialog.getByRole('button', { name: 'Tambah materi' }).click();
  lesson = dialog.locator('.lesson-editor').nth(1);
  await lesson
    .getByLabel('Judul materi', { exact: true })
    .fill('Presentasi Canva');
  await lesson.getByLabel('Format', { exact: true }).selectOption('canva');
  await lesson
    .getByLabel('Link presentasi Canva')
    .fill('https://www.canva.com/design/DAGdemo/token/view');
  await lesson
    .getByLabel('Deskripsi / arahan materi (opsional)')
    .fill('Baca slide 1 sampai 3.');
  await dialog.getByRole('button', { name: 'Tambah materi' }).click();
  lesson = dialog.locator('.lesson-editor').nth(2);
  await lesson
    .getByLabel('Judul materi', { exact: true })
    .fill('Audio pembuka');
  await lesson.getByLabel('Format', { exact: true }).selectOption('audio');
  await lesson
    .getByLabel('Unggah file materi')
    .setInputFiles('tests/fixtures/intro.wav');
  await expect(
    lesson.getByRole('link', { name: 'intro.wav', exact: false }),
  ).toBeVisible();
  await lesson.getByLabel('Durasi audio (detik)').fill('3');
  await lesson
    .getByLabel('Deskripsi / arahan materi (opsional)')
    .fill('Dengarkan hingga selesai.');
  await dialog.getByRole('button', { name: 'Kuis', exact: true }).click();
  for (const phase of ['pre', 'post']) {
    const section = dialog.getByRole('region', {
      name: phase === 'pre' ? 'Pengaturan pre-test' : 'Pengaturan post-test',
    });
    await section.getByRole('checkbox').check();
    await section
      .getByLabel('Pertanyaan', { exact: true })
      .fill(
        phase === 'pre'
          ? 'Pertanyaan sebelum belajar?'
          : 'Pertanyaan setelah belajar?',
      );
    await section
      .getByLabel('Pilihan jawaban 1', { exact: true })
      .fill('Pilihan satu');
    await section
      .getByLabel('Pilihan jawaban 2', { exact: true })
      .fill('Pilihan dua');
    await section.getByRole('radio', { name: 'Kunci jawaban 2' }).check();
  }
  await dialog.getByRole('button', { name: 'Simpan kelas' }).click();
  await expect(dialog).toHaveCount(0);
  const bootstrap = await (
    await page.request.get(base + '/api/bootstrap')
  ).json();
  const c = bootstrap.courses.find(
    (c) => c.title === 'Editor Multimedia & Evaluasi E2E',
  );
  expect(c.preQuiz.questions[0].answer).toBe(1);
  expect(c.quiz.questions[0].answer).toBe(1);
  expect(c.lessons[0].provider).toBe('youtube');
  expect(c.lessons[1].url).toBe(
    'https://www.canva.com/design/DAGdemo/token/view?embed',
  );
  expect(c.lessons[2].type).toBe('audio');
});

// The remote SDK is stubbed so CI can exercise the player contract without relying on video ads,
// third-party accounts, or the external network. Native audio/video tests use real fixture playback.
const fakeYouTubeSDK = `window.YT={PlayerState:{PLAYING:1,PAUSED:2,ENDED:0},Player:function(target,options){const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+options.videoId;target.replaceWith(frame);let started=0,position=0;this.getIframe=()=>frame;this.getCurrentTime=()=>started?Math.min(3,(Date.now()-started)/1000):position;this.seekTo=p=>{position=p;};const play=event=>{if(event.source!==frame.contentWindow||event.data!=='fixture-play')return;started=Date.now();options.events.onStateChange({data:1});setTimeout(()=>{position=3;started=0;options.events.onStateChange({data:0});},3200);};window.addEventListener('message',play);this.destroy=()=>{window.removeEventListener('message',play);frame.remove();};setTimeout(()=>options.events.onReady(),0);}};window.onYouTubeIframeAPIReady();`;
test('YouTube SDK playback records progress and Canva embeds safely with instructions on mobile', async ({
  page,
  request,
}) => {
  await adminLogin(request);
  const id = await create(request, {
    lessons: [
      {
        id: 'youtube',
        title: 'YouTube Orientation',
        type: 'video',
        provider: 'youtube',
        url: 'https://youtu.be/dQw4w9WgXcQ',
        durationSeconds: 3,
        description: 'Penjelasan video YouTube.',
        required: true,
      },
      {
        id: 'canva',
        title: 'Canva Orientation',
        type: 'canva',
        url: 'https://www.canva.com/design/DAGdemo/token/view',
        description: 'Arahan presentasi Canva.',
        required: true,
      },
    ],
  });
  await page.route('https://www.youtube.com/iframe_api', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: fakeYouTubeSDK,
    }),
  );
  await page.route('https://www.youtube-nocookie.com/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: "<button onclick=\"parent.postMessage('fixture-play','*')\">Putar video</button>",
    }),
  );
  await page.route('https://www.canva.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<h1>Presentasi Perusahaan</h1>',
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await employeeLogin(page);
  await page.goto(base + '/#/course/' + id);
  await page
    .getByRole('button', { name: 'Mulai belajar', exact: true })
    .click();
  await expect(
    page.getByText('Penjelasan video YouTube.', { exact: true }),
  ).toBeVisible();
  await page
    .frameLocator('.youtube-player iframe')
    .getByRole('button', { name: 'Putar video' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Materi berikutnya', exact: true }),
  ).toBeEnabled({ timeout: 12000 });
  await page
    .getByRole('button', { name: 'Materi berikutnya', exact: true })
    .click();
  await expect(
    page.locator('iframe[title="Canva Orientation"]'),
  ).toHaveAttribute(
    'src',
    'https://www.canva.com/design/DAGdemo/token/view?embed',
  );
  await expect(
    page.getByText('Arahan presentasi Canva.', { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .frameLocator('iframe[title="Canva Orientation"]')
      .getByRole('heading', { name: 'Presentasi Perusahaan' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Selesai & lanjutkan' }).click();
  await expect(page.locator('.player-top')).toContainText('100% selesai');
  await page.screenshot({ path: '/tmp/pulc-canva-mobile.png', fullPage: true });
});

test('an unavailable YouTube SDK displays a useful error without awarding completion', async ({
  page,
  request,
}) => {
  await adminLogin(request);
  const id = await create(request, {
    lessons: [
      {
        id: 'blocked',
        title: 'Video yang tidak dapat dimuat',
        type: 'video',
        provider: 'youtube',
        url: 'https://youtu.be/dQw4w9WgXcQ',
        durationSeconds: 3,
        description: 'Hubungi admin jika video tidak dapat dibuka.',
        required: true,
      },
    ],
  });
  await page.route('https://www.youtube.com/iframe_api', (route) =>
    route.abort('failed'),
  );
  await employeeLogin(page);
  await page.goto(base + '/#/course/' + id);
  await page
    .getByRole('button', { name: 'Mulai belajar', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText(
    'Pemutar YouTube tidak dapat dimuat',
  );
  await expect(
    page.getByRole('link', { name: 'Buka di YouTube' }),
  ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  await expect(
    page.getByRole('button', { name: 'Materi berikutnya', exact: true }),
  ).toBeDisabled();
  const state = await (await page.request.get(base + '/api/bootstrap')).json();
  expect(state.summaries.find((s) => s.courseId === id).complete).toBe(false);
});
