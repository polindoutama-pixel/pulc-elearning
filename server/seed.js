import { hashPassword } from './db.js';
import { randomBytes } from 'node:crypto';
export function seed(db, { demo = true } = {}) {
  if (db.prepare('SELECT COUNT(*) AS n FROM users').get().n) {
    const seeded =
      db.prepare("SELECT value FROM app_meta WHERE key='demo_seeded'").get()
        ?.value === 'true' ||
      !!db
        .prepare("SELECT id FROM users WHERE id='employee' AND nik='PU2026001'")
        .get();
    if (!demo && seeded)
      throw new Error(
        'Database demo tidak boleh dipakai dalam produksi. Pilih DATA_DIR baru untuk data nyata.',
      );
    return;
  }
  db.prepare('INSERT OR REPLACE INTO app_meta(key,value) VALUES(?,?)').run(
    'demo_seeded',
    String(demo),
  );
  if (!demo) {
    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12)
      throw new Error(
        'Set ADMIN_PASSWORD (minimal 12 karakter) untuk database produksi baru.',
      );
    db.prepare(
      'INSERT INTO users(id,nik,name,department,role,password) VALUES(?,?,?,?,?,?)',
    ).run(
      'admin',
      process.env.ADMIN_NIK || 'ADMIN',
      'Administrator',
      'Human Resources',
      'admin',
      hashPassword(process.env.ADMIN_PASSWORD),
    );
    return;
  }
  const users = [
    ['admin', 'ADMIN001', 'Nadia Putri', 'Human Resources', 'admin'],
    ['employee', 'PU2026001', 'Andi Pratama', 'Produksi', 'employee'],
    ['user2', 'PU2026002', 'Siti Rahmawati', 'Quality Control', 'employee'],
    ['user3', 'PU2026003', 'Budi Santoso', 'Produksi', 'employee'],
    ['user4', 'PU2026004', 'Dewi Lestari', 'Human Resources', 'employee'],
  ];
  const demoPassword = hashPassword('BelajarPULC!2026');
  for (const user of users)
    db.prepare(
      'INSERT INTO users(id,nik,name,department,role,password,must_change_password) VALUES(?,?,?,?,?,?,0)',
    ).run(...user, demoPassword);
  const text = (id, title, body) => ({
    id,
    title,
    type: 'text',
    body,
    required: true,
  });
  const lessons = {
    company: [
      text(
        'company-1',
        'Selamat datang di Polindo Utama',
        '<h2>Langkah pertama, perjalanan yang berarti.</h2><p>Selamat datang di Polindo Utama. Di sini, setiap orang memiliki peran dalam menghasilkan pekerjaan yang berkualitas dan membangun lingkungan kerja yang aman.</p><p>Program ini membantu Anda mengenal perusahaan, memahami cara kita bekerja, dan mempersiapkan diri sebelum bergabung dengan tim.</p><h3>Yang akan Anda pelajari</h3><ul><li>Mengenal lingkungan dan budaya kerja.</li><li>Memahami komunikasi dan koordinasi antar tim.</li><li>Mengetahui tempat mencari bantuan.</li></ul><blockquote>Materi ini adalah contoh untuk demonstrasi. HR perlu menggantinya dengan profil dan kebijakan resmi perusahaan sebelum digunakan.</blockquote>',
      ),
      text(
        'company-2',
        'Budaya kerja & kolaborasi',
        '<h2>Tumbuh bersama, bekerja bersama.</h2><p>Kualitas kerja dibangun melalui komunikasi yang jelas, tanggung jawab, dan kemauan untuk terus belajar.</p><h3>Kebiasaan yang mendukung tim</h3><ul><li>Konfirmasikan instruksi yang belum dipahami.</li><li>Sampaikan kendala kepada atasan atau penanggung jawab.</li><li>Hormati rekan kerja dan jaga area kerja bersama.</li></ul>',
      ),
      text(
        'company-3',
        'Mengenal tim & kontak penting',
        '<h2>Anda tidak harus mencari jawaban sendiri.</h2><p>Hubungi HR untuk administrasi karyawan, supervisor untuk arahan pekerjaan, dan tim HSE untuk pertanyaan keselamatan.</p><p>Daftar nama dan kontak resmi akan dilengkapi oleh pengelola sebelum peluncuran.</p>',
      ),
    ],
    safety: [
      text(
        'safety-1',
        'Keselamatan dimulai dari diri sendiri',
        '<h2>Utamakan keselamatan dalam setiap langkah.</h2><p>Sebelum memasuki area kerja, ikuti orientasi keselamatan dan instruksi petugas yang berwenang. Kenali jalur evakuasi dan titik kumpul di lokasi Anda.</p><p>Jangan mengoperasikan peralatan tanpa pelatihan dan izin yang sesuai.</p><blockquote>Materi contoh ini harus ditinjau HSE. Kelulusan digital tidak menggantikan pelatihan praktik atau izin kerja.</blockquote>',
      ),
      text(
        'safety-2',
        'Alat Pelindung Diri (APD)',
        '<h2>Gunakan APD sesuai area dan pekerjaan.</h2><p>Ikuti ketentuan APD resmi pada area kerja. Periksa kondisinya sebelum digunakan dan laporkan kerusakan kepada petugas.</p><ul><li>Kenali tanda dan persyaratan pada pintu masuk area.</li><li>Gunakan APD dengan cara yang telah dilatihkan.</li><li>Jangan mengganti APD tanpa arahan petugas.</li></ul>',
      ),
      text(
        'safety-3',
        'Pelaporan kondisi tidak aman',
        '<h2>Lihat, hentikan jika aman, dan laporkan.</h2><p>Jika menemukan kondisi berbahaya, jauhi area tersebut dan hubungi supervisor atau tim HSE. Ikuti prosedur darurat resmi perusahaan.</p><p>Pastikan Anda mengetahui nomor darurat dan titik kumpul aktual sebelum memulai pekerjaan.</p>',
      ),
    ],
    factory: [
      text(
        'factory-1',
        'Gambaran alur produksi',
        '<h2>Memahami proses dari awal hingga akhir.</h2><p>Setiap bagian proses memiliki keterkaitan. Orientasi ini memperkenalkan penerimaan bahan, proses produksi, pemeriksaan kualitas, dan penyimpanan hasil.</p><p>Urutan aktual serta SOP setiap area akan dilengkapi oleh departemen Produksi.</p>',
      ),
      text(
        'factory-2',
        'Standar area & koordinasi shift',
        '<h2>Serah terima yang jelas membantu pekerjaan berjalan baik.</h2><p>Pelajari mekanisme briefing, pembagian tanggung jawab, dan pencatatan pekerjaan bersama supervisor Anda.</p>',
      ),
    ],
    quality: [
      text(
        'quality-1',
        'Kualitas adalah tanggung jawab bersama',
        '<h2>Kenali standar sebelum memulai.</h2><p>Gunakan dokumen kerja yang berlaku. Jika hasil tidak sesuai atau ada keraguan, hubungi penanggung jawab sebelum meneruskan proses.</p>',
      ),
      text(
        'quality-2',
        'Pencatatan & perbaikan',
        '<h2>Catatan yang baik membantu perbaikan.</h2><p>Catat temuan dengan jelas, ikuti prosedur pelaporan, dan gunakan hasil evaluasi untuk memperbaiki proses.</p>',
      ),
    ],
    teamwork: [
      text(
        'team-1',
        'Komunikasi yang efektif',
        '<h2>Sampaikan dengan jelas, dengarkan dengan baik.</h2><p>Mulai dengan konteks, sampaikan kebutuhan, dan konfirmasikan pemahaman. Pilih kanal komunikasi sesuai urgensi pekerjaan.</p>',
      ),
      text(
        'team-2',
        'Memberi umpan balik',
        '<h2>Fokus pada perilaku dan perbaikan.</h2><p>Gunakan contoh yang spesifik, jelaskan dampaknya, dan sepakati langkah perbaikan bersama.</p>',
      ),
    ],
    digital: [
      text(
        'digital-1',
        'Menjaga akun dan data kerja',
        '<h2>Akun Anda adalah tanggung jawab Anda.</h2><p>Gunakan kata sandi yang unik, jangan bagikan akses, dan laporkan pesan mencurigakan kepada tim yang bertanggung jawab.</p>',
      ),
    ],
  };
  const quiz = {
    passScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'q1',
        text: 'Apa yang perlu dilakukan jika instruksi kerja belum jelas?',
        options: [
          'Melanjutkan berdasarkan perkiraan',
          'Mengonfirmasi kepada penanggung jawab',
          'Mengabaikan instruksi',
        ],
        answer: 1,
      },
      {
        id: 'q2',
        text: 'Kapan peralatan boleh dioperasikan?',
        options: [
          'Setelah memperoleh pelatihan dan izin yang sesuai',
          'Ketika tidak ada orang lain',
          'Setelah membaca judul materi',
        ],
        answer: 0,
      },
    ],
  };
  const courses = [
    [
      'company',
      'Mengenal Polindo Utama',
      'Kenali cerita, nilai, dan orang-orang di balik perjalanan kita. Awali langkah Anda dengan mengenal tempat kita tumbuh bersama.',
      'Orientasi',
      25,
      'company',
      lessons.company,
    ],
    [
      'safety',
      'Safety First: Dasar Keselamatan Kerja',
      'Bangun kebiasaan kerja yang aman. Pelajari prinsip keselamatan, APD, dan cara melaporkan kondisi tidak aman.',
      'Keselamatan',
      40,
      'safety',
      lessons.safety,
    ],
    [
      'factory',
      'Mengenal Alur Kerja Pabrik',
      'Dari bahan hingga hasil akhir. Temukan bagaimana setiap bagian bekerja dan saling terhubung.',
      'Produksi',
      35,
      'factory',
      lessons.factory,
    ],
    [
      'quality',
      'Dasar Quality Control',
      'Pahami peran kualitas dalam setiap proses dan bangun kebiasaan kerja yang teliti.',
      'Kualitas',
      30,
      'quality',
      lessons.quality,
    ],
    [
      'teamwork',
      'Komunikasi & Kolaborasi Tim',
      'Bekerja lebih baik bersama. Pelajari cara berkomunikasi, berkoordinasi, dan memberi umpan balik.',
      'Pengembangan Diri',
      20,
      'teamwork',
      lessons.teamwork,
    ],
    [
      'digital',
      'Literasi Digital di Tempat Kerja',
      'Mulai kebiasaan digital yang baik untuk menjaga keamanan akun dan informasi perusahaan.',
      'Teknologi',
      15,
      'digital',
      lessons.digital,
    ],
  ];
  const insert = db.prepare(
    "INSERT INTO courses(id,title,description,category,duration,cover,status,sequential,lessons,quiz) VALUES(?,?,?,?,?,?,'published',1,?,?)",
  );
  for (const [
    id,
    title,
    description,
    category,
    duration,
    cover,
    items,
  ] of courses)
    insert.run(
      id,
      title,
      description,
      category,
      duration,
      cover,
      JSON.stringify(items),
      JSON.stringify(quiz),
    );
  db.prepare('INSERT INTO programs VALUES(?,?,?,?)').run(
    'onboarding',
    'Langkah Pertama di Polindo Utama',
    'Program pengenalan untuk membantu Anda siap, aman, dan percaya diri memulai perjalanan bersama kami.',
    JSON.stringify(['company', 'safety', 'factory']),
  );
  const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  for (const user of users.filter((u) => u[4] === 'employee')) {
    db.prepare('INSERT INTO program_assignments VALUES(?,?,?,?)').run(
      randomBytes(8).toString('hex'),
      user[0],
      'onboarding',
      due,
    );
    for (const id of ['company', 'safety', 'factory'])
      db.prepare(
        'INSERT INTO enrollments(id,user_id,course_id,required,due) VALUES(?,?,?,1,?)',
      ).run(randomBytes(8).toString('hex'), user[0], id, due);
  }
  db.prepare(
    'INSERT INTO progress(user_id,course_id,lesson_id,complete) VALUES(?,?,?,1)',
  ).run('employee', 'company', 'company-1');
}
