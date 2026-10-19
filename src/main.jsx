import { api, navigate } from './api.js';
import {
  Button,
  Badge,
  Progress,
  Empty,
  Loading,
  Modal,
  Field,
  ErrorMessage,
} from './ui.jsx';
import {
  LessonFields,
  QuizEditor,
  readMediaDuration,
} from './editor-fields.jsx';
import { LessonContent } from './lesson-content.jsx';
import { isTrackedMedia, lessonTypeLabels } from '../shared/media.js';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Play,
  PlayCircle,
  Check,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Factory,
  Building2,
  Sparkles,
  Award,
  LogOut,
  Menu,
  X,
  Plus,
  Download,
  Upload,
  FileText,
  Image,
  Presentation,
  LockKeyhole,
  Pencil,
  Copy,
  Trash2,
  AlertCircle,
  LoaderCircle,
  Monitor,
  ListChecks,
  Eye,
  RotateCcw,
  CheckCheck,
  CircleHelp,
} from 'lucide-react';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/manrope';
import './styles.css';
const icons = {
  text: FileText,
  video: PlayCircle,
  image: Image,
  pdf: Presentation,
  document: FileText,
  canva: Presentation,
  audio: PlayCircle,
};
const coverIcons = {
  company: Building2,
  safety: ShieldCheck,
  factory: Factory,
  quality: Award,
  teamwork: Users,
  digital: Monitor,
};
const coverLabels = {
  company: 'OUR PEOPLE. OUR PURPOSE.',
  safety: 'SAFETY STARTS WITH YOU.',
  factory: 'BEHIND EVERY PROCESS.',
  quality: 'QUALITY IN EVERY DETAIL.',
  teamwork: 'BETTER TOGETHER.',
  digital: 'WORK SMARTER.',
};
const categories = [
  'Semua',
  'Orientasi',
  'Keselamatan',
  'Produksi',
  'Kualitas',
  'Pengembangan Diri',
  'Teknologi',
];
const date = (value) =>
  value
    ? new Date(
        value.includes('T') ? value : value + 'T00:00:00',
      ).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Tanpa tenggat';
const initials = (name) =>
  name
    ?.split(' ')
    .slice(0, 2)
    .map((x) => x[0])
    .join('') || 'PU';
function useRoute() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
  useEffect(() => {
    const f = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return route;
}
function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? 'light' : ''}`}>
      <div className="brand-mark">
        P<span />
      </div>
      <div>
        <strong>
          PULC<span className="brand-dot">.</span>
        </strong>
        <small>
          POLINDO UTAMA
          <br />
          E-LEARNING CENTER
        </small>
      </div>
    </div>
  );
}
function FactoryArt() {
  return (
    <svg viewBox="0 0 430 280" className="factory-art" aria-hidden="true">
      <defs>
        <linearGradient id="building" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f8e8c5" />
          <stop offset="1" stopColor="#ddc69e" />
        </linearGradient>
      </defs>
      <circle cx="250" cy="140" r="120" fill="#ffffff" opacity=".045" />
      <circle
        cx="250"
        cy="140"
        r="91"
        fill="none"
        stroke="#fff"
        opacity=".12"
      />
      <path d="M35 218l207-104 159 84-208 108z" fill="#0b433b" />
      <path d="M63 157l155-78 141 71-157 79z" fill="#eee5cd" />
      <path d="M63 157v60l139 70v-58z" fill="#d4bf98" />
      <path d="M202 229v58l157-79v-58z" fill="#f5e8cd" />
      <path
        d="M97 149l37-19 30 15 37-18 32 17 37-19 51 26-119 61z"
        fill="#436b5a"
      />
      <path d="M97 149v41l105 53v-31z" fill="#849f87" />
      <path d="M202 212v31l119-60v-32z" fill="#b9c8a8" />
      <path d="M113 142v-35l15-8 15 8v21l-15 8z" fill="#e7d6ad" />
      <path d="M113 107l15 8 15-8-15-8z" fill="#fff0d0" />
      <path d="M128 115v21l15-8v-21z" fill="#c9b58c" />
      <path d="M244 123V52l19-9 17 9v70l-17 9z" fill="#e9d7ad" />
      <path d="M263 61v70l17-9V52z" fill="#c1ae88" />
      <path d="M244 52l19 9 17-9-17-9z" fill="#fff1d5" />
      <path
        d="M264 35c-14-17 17-19 8-33"
        fill="none"
        stroke="#c1d1b8"
        strokeWidth="9"
        strokeLinecap="round"
        opacity=".5"
      />
      <g fill="#214e45">
        <path d="M221 223l15-7v21l-15 7zM245 211l15-7v21l-15 7zM269 199l15-7v21l-15 7zM293 187l15-7v21l-15 7z" />
      </g>
      <path d="M97 203v-26l22 11v26zM133 220v-25l22 11v25z" fill="#365d50" />
      <path d="M332 187v-36" stroke="#a3b28b" strokeWidth="7" />
      <circle cx="332" cy="145" r="16" fill="#b7c495" />
      <path d="M65 208v-31" stroke="#a3b28b" strokeWidth="6" />
      <circle cx="65" cy="169" r="13" fill="#c1cd9f" />
      <g fill="#efc37c">
        <circle cx="350" cy="86" r="5" />
        <path d="M94 74v16m-8-8h16" stroke="#efc37c" strokeWidth="2" />
      </g>
      <g transform="translate(301 42)">
        <rect width="81" height="42" rx="10" fill="#fff" />
        <circle cx="21" cy="21" r="10" fill="#e6eee5" />
        <path d="M16 21l4 4 7-8" fill="none" stroke="#42745c" strokeWidth="2" />
        <rect x="39" y="15" width="28" height="4" rx="2" fill="#42745c" />
        <rect x="39" y="24" width="19" height="3" rx="1.5" fill="#c4d2c5" />
      </g>
    </svg>
  );
}
function Cover({ type = 'company', small = false }) {
  const Icon = coverIcons[type] || Building2;
  return (
    <div className={`course-cover ${type} ${small ? 'small' : ''}`}>
      <span className="cover-orbit" />
      <span className="cover-grid" />
      <div className="cover-brand">
        POLINDO UTAMA <span>LEARNING SERIES</span>
      </div>
      <div className="cover-main">
        <div className="cover-icon">
          <Icon strokeWidth={1.3} />
        </div>
        <strong>{coverLabels[type] || coverLabels.company}</strong>
      </div>
      <span className="cover-number">
        PULC / 0{Object.keys(coverIcons).indexOf(type) + 1}
      </span>
      <span className="cover-play">
        <Play size={15} fill="currentColor" />
      </span>
    </div>
  );
}
function CourseCard({ course, summary, enrollment, onOpen }) {
  return (
    <button className="course-card" onClick={() => onOpen(course.id)}>
      <Cover type={course.cover} />
      <div className="course-card-body">
        <div className="course-card-label">
          <span className={`category-dot ${course.cover}`} />
          {course.category}
          {enrollment?.required ? <Badge tone="amber">Wajib</Badge> : null}
        </div>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-meta">
          <span>
            <Clock3 size={14} />
            {course.duration} menit
          </span>
          <span>
            <BookOpen size={14} />
            {course.lessons.length} materi
          </span>
        </div>
        {enrollment ? (
          <div className="course-progress">
            <Progress value={summary?.percent} />
            <div>
              <span>
                {summary?.complete
                  ? 'Selesai dipelajari'
                  : summary?.started
                    ? 'Sedang dipelajari'
                    : 'Belum dimulai'}
              </span>
              <strong>{summary?.percent || 0}%</strong>
            </div>
          </div>
        ) : (
          <div className="course-card-footer">
            <span>Pelajari kelas</span>
            <ArrowUpRight size={17} />
          </div>
        )}
      </div>
    </button>
  );
}
function Login({ onLogin }) {
  const [nik, setNik] = useState(''),
    [password, setPassword] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [demo, setDemo] = useState(false);
  useEffect(() => {
    api('/health')
      .then((d) => setDemo(d.demo))
      .catch(() => {});
  }, []);
  const submit = async (e, values) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/auth/login', {
        method: 'POST',
        body: values || { nik, password },
      });
      await onLogin();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="login-page">
      <div className="login-story">
        <Brand light />
        <div>
          <div className="eyebrow">A PLACE TO LEARN. A SPACE TO GROW.</div>
          <h1>
            Langkah kecil hari ini.
            <br />
            <em>
              Masa depan yang
              <br />
              lebih berarti.
            </em>
          </h1>
          <p>
            Kenali perusahaan, kembangkan kemampuan, dan tumbuh bersama Polindo
            Utama.
          </p>
          <FactoryArt />
        </div>
        <small>
          © {new Date().getFullYear()} Polindo Utama · Belajar untuk tumbuh
          bersama.
        </small>
      </div>
      <div className="login-form-wrap">
        <div className="login-form">
          <Badge tone="green">
            <Sparkles size={13} /> Selamat datang di PULC
          </Badge>
          <h2>
            Perjalanan belajar
            <br />
            dimulai di sini.
          </h2>
          <p>Masuk untuk melanjutkan pembelajaran Anda.</p>
          <form onSubmit={submit}>
            <Field label="NIK / ID Karyawan">
              <input
                name="username"
                autoComplete="username"
                placeholder="Masukkan NIK Anda"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                required
              />
            </Field>
            <Field label="Kata sandi">
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <ErrorMessage message={error} />
            <Button type="submit" disabled={busy} className="full">
              {busy ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <>
                  Masuk ke PULC <ArrowRight size={17} />
                </>
              )}
            </Button>
          </form>
          {demo && (
            <div className="demo-box">
              <div>
                <strong>Coba ruang belajar PULC</strong>
                <Badge>DEMO</Badge>
              </div>
              <p>
                Jelajahi aplikasi dengan akun contoh. Data contoh dapat berubah
                saat dicoba.
              </p>
              <div className="demo-actions">
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() =>
                    submit(null, {
                      nik: 'PU2026001',
                      password: 'BelajarPULC!2026',
                    })
                  }
                  icon={GraduationCap}
                >
                  Sebagai karyawan
                </Button>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() =>
                    submit(null, {
                      nik: 'ADMIN001',
                      password: 'BelajarPULC!2026',
                    })
                  }
                  icon={LayoutDashboard}
                >
                  Sebagai admin
                </Button>
              </div>
            </div>
          )}
          <div className="login-help">
            <CircleHelp size={16} /> Belum punya akun atau lupa kata sandi?
            Hubungi HR untuk bantuan akses.
          </div>
        </div>
      </div>
    </main>
  );
}
function App() {
  const route = useRoute(),
    [data, setData] = useState(null),
    [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [fatal, setFatal] = useState(''),
    [toast, setToast] = useState(''),
    [mobile, setMobile] = useState(false),
    [notifications, setNotifications] = useState(false),
    [search, setSearch] = useState('');
  const notify = (msg) => {
    setToast(msg);
  };
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const reload = async () => {
    const session = await api('/me');
    setUser(session.user);
    if (!session.user.must_change_password) {
      const d = await api('/bootstrap');
      setData(d);
    }
    return session;
  };
  useEffect(() => {
    const expired = () => {
      setUser(null);
      setData(null);
      navigate('/');
    };
    window.addEventListener('pulc:unauthorized', expired);
    return () => window.removeEventListener('pulc:unauthorized', expired);
  }, []);
  useEffect(() => {
    reload()
      .catch((e) => {
        if (e.status !== 401) setFatal(e.message);
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    setMobile(false);
    setNotifications(false);
  }, [route]);
  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST', body: {} });
      setUser(null);
      setData(null);
      navigate('/');
    } catch (e) {
      notify(e.message);
    }
  };
  const run = async (fn, message) => {
    try {
      const result = await fn();
      await reload();
      if (message) notify(message);
      return result;
    } catch (e) {
      notify(e.message);
      throw e;
    }
  };
  if (loading) return <Loading />;
  if (fatal)
    return (
      <div className="fatal">
        <ErrorMessage message={fatal} />
        <Button onClick={() => location.reload()}>Coba lagi</Button>
      </div>
    );
  if (!user)
    return (
      <Login
        onLogin={async () => {
          const session = await reload();
          navigate(session.user.role === 'admin' ? '/admin' : '/');
        }}
      />
    );
  if (user.must_change_password)
    return (
      <div className="password-gate">
        <Brand />
        <Profile user={user} required onSaved={reload} notify={notify} />
        <Button variant="ghost" onClick={logout}>
          Keluar
        </Button>
      </div>
    );
  if (!data) return <Loading />;
  const adminMode = route.startsWith('/admin') && user.role === 'admin';
  const nav = adminMode
    ? [
        ['/admin', LayoutDashboard, 'Ringkasan'],
        ['/admin/courses', BookOpen, 'Kelola Kelas'],
        ['/admin/programs', GraduationCap, 'Program Onboarding'],
        ['/admin/assignments', ClipboardList, 'Penugasan'],
        ['/admin/users', Users, 'Karyawan'],
        ['/admin/reports', BarChart3, 'Laporan'],
      ]
    : [
        ['/', LayoutDashboard, 'Beranda'],
        ['/onboarding', GraduationCap, 'Onboarding Saya'],
        ['/catalog', BookOpen, 'Katalog Kelas'],
        ['/learning', ClipboardList, 'Pembelajaran Saya'],
        ['/history', Award, 'Riwayat Belajar'],
      ];
  const current =
    nav.find((n) => n[0] === route)?.[2] ||
    (route.startsWith('/course/')
      ? 'Detail Kelas'
      : route.startsWith('/learn/')
        ? 'Ruang Belajar'
        : route === '/profile'
          ? 'Profil Saya'
          : 'PULC');
  const sFor = (id) => data.summaries.find((s) => s.courseId === id),
    eFor = (id) => data.enrollments.find((e) => e.course_id === id);
  const outstanding = data.enrollments.filter(
    (e) => e.required && !sFor(e.course_id)?.complete,
  );
  const render = () => {
    if (route === '/profile')
      return <Profile user={user} onSaved={reload} notify={notify} />;
    if (adminMode)
      return <Admin route={route} data={data} run={run} notify={notify} />;
    if (route.startsWith('/preview/') && user.role === 'admin')
      return (
        <Player
          key={'preview-' + route.split('/')[2]}
          id={route.split('/')[2]}
          data={data}
          reload={reload}
          notify={notify}
          preview
        />
      );
    if (route.startsWith('/learn/'))
      return (
        <Player
          key={route.split('/')[2]}
          id={route.split('/')[2]}
          data={data}
          reload={reload}
          notify={notify}
        />
      );
    if (route.startsWith('/course/'))
      return <CourseDetail id={route.split('/')[2]} data={data} run={run} />;
    if (route === '/onboarding') return <Onboarding data={data} />;
    if (route === '/catalog')
      return <Catalog data={data} search={search} setSearch={setSearch} />;
    if (route === '/learning' || route === '/history')
      return <MyLearning data={data} history={route === '/history'} />;
    return <Home data={data} />;
  };
  return (
    <div className="app-shell">
      {mobile && (
        <div className="mobile-overlay" onClick={() => setMobile(false)} />
      )}
      <aside className={`sidebar ${mobile ? 'open' : ''}`}>
        <Brand />
        <div className="sidebar-section-label">
          {adminMode ? 'RUANG PENGELOLA' : 'RUANG BELAJAR'}
        </div>
        <nav>
          {nav.map(([url, Icon, label]) => (
            <a
              href={'#' + url}
              key={url}
              className={route === url ? 'active' : ''}
            >
              <Icon size={19} />
              <span>{label}</span>
              {url === '/onboarding' && outstanding.length > 0 && (
                <span className="nav-count">{outstanding.length}</span>
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {user.role === 'admin' && (
            <a href={adminMode ? '#/' : '#/admin'} className="mode-switch">
              <span className="mode-icon">
                {adminMode ? (
                  <GraduationCap size={19} />
                ) : (
                  <LayoutDashboard size={19} />
                )}
              </span>
              <span>
                <strong>
                  {adminMode ? 'Portal Karyawan' : 'Dashboard Admin'}
                </strong>
                <small>Beralih ruang kerja</small>
              </span>
              <ArrowUpRight size={16} />
            </a>
          )}
          <div className="sidebar-note">
            <span className="tiny-leaf">✦</span>
            <strong>
              Belajar hari ini,
              <br />
              bertumbuh setiap hari.
            </strong>
            <small>
              Setiap langkah membawa
              <br />
              Anda lebih jauh.
            </small>
          </div>
          <a
            href="#/profile"
            className={`settings-link ${route === '/profile' ? 'active' : ''}`}
          >
            <Settings size={18} /> Pengaturan Akun
          </a>
          <button className="logout-button" onClick={logout}>
            <LogOut size={17} /> Keluar
          </button>
          <div className="sidebar-copyright">
            © {new Date().getFullYear()} Polindo Utama
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Buka menu"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>
            <span className="breadcrumb">
              {adminMode ? 'Dashboard Admin' : 'Ruang Belajar'}
            </span>
            <ChevronRight size={14} />
            <strong>{current}</strong>
          </div>
          <div className="topbar-right">
            <form
              className="top-search"
              onSubmit={(e) => {
                e.preventDefault();
                navigate('/catalog');
              }}
            >
              <Search size={16} />
              <input
                aria-label="Cari kelas"
                placeholder="Cari kelas atau materi…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>↵</kbd>
            </form>
            <div className="notification-anchor">
              <button
                className="icon-button notification-button"
                aria-label="Notifikasi"
                aria-expanded={notifications}
                onClick={() => setNotifications(!notifications)}
              >
                <Bell size={20} />
                {outstanding.length > 0 && <i />}
              </button>
              {notifications && (
                <div className="notification-popover">
                  <strong>Pembelajaran Anda</strong>
                  {outstanding.length ? (
                    outstanding.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => navigate('/course/' + e.course_id)}
                      >
                        <span className="notification-icon">
                          <BookOpen size={17} />
                        </span>
                        <span>
                          <b>
                            {
                              data.courses.find((c) => c.id === e.course_id)
                                ?.title
                            }
                          </b>
                          <small>Tenggat: {date(e.due)}</small>
                        </span>
                        <ChevronRight size={15} />
                      </button>
                    ))
                  ) : (
                    <p>Semua pembelajaran wajib sudah selesai. Kerja bagus!</p>
                  )}
                </div>
              )}
            </div>
            <span className="topbar-divider" />
            <a className="profile-button" href="#/profile">
              <span className="avatar">{initials(user.name)}</span>
              <span>
                <strong>{user.name}</strong>
                <small>
                  {user.role === 'admin' ? 'Administrator' : user.department}
                </small>
              </span>
              <ChevronDown size={14} />
            </a>
          </div>
        </header>
        <main
          className={`page-content ${route.startsWith('/learn/') ? 'player-page' : ''}`}
        >
          {render()}
          <footer className="page-footer">
            <span>Polindo Utama e-Learning Center</span>
            <span>
              Belajar. Berkembang. Bersama.{' '}
              <span className="footer-star">✦</span>
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          <span>{toast}</span>
          <button onClick={() => setToast('')} aria-label="Tutup notifikasi">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function PageTitle({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
function Home({ data }) {
  const order = data.programs.flatMap((p) => p.courseIds);
  const required = data.enrollments
      .filter((e) => e.required)
      .sort((a, b) => {
        const x = order.indexOf(a.course_id),
          y = order.indexOf(b.course_id);
        return (x < 0 ? 999 : x) - (y < 0 ? 999 : y);
      }),
    finished = data.enrollments.filter(
      (e) => data.summaries.find((s) => s.courseId === e.course_id)?.complete,
    ),
    active = data.enrollments.filter(
      (e) => !data.summaries.find((s) => s.courseId === e.course_id)?.complete,
    ),
    courses = active
      .map((e) => data.courses.find((c) => c.id === e.course_id))
      .filter(Boolean),
    completedRequired = required.filter(
      (e) => data.summaries.find((s) => s.courseId === e.course_id)?.complete,
    ).length;
  const first =
    courses.find(
      (c) => data.summaries.find((s) => s.courseId === c.id)?.started,
    ) || courses[0];
  return (
    <>
      <PageTitle
        eyebrow="YOUR LEARNING JOURNEY"
        title={
          <>
            Selamat datang, {data.user.name.split(' ')[0]}{' '}
            <span className="wave">☀</span>
          </>
        }
        subtitle="Hari yang baik untuk belajar hal baru dan melangkah lebih jauh."
        action={
          <span className="today">
            <span className="today-dot" />
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'Asia/Jakarta',
            })}
          </span>
        }
      />
      <section className="welcome-hero">
        <div className="hero-copy">
          <div className="hero-label">
            <span /> TUMBUH BERSAMA POLINDO UTAMA
          </div>
          <h2>
            Awal yang baik untuk
            <br />
            <em>perjalanan yang hebat.</em>
          </h2>
          <p>
            Kenali lingkungan kerja, bangun kemampuan baru,
            <br className="desktop-br" /> dan siapkan diri untuk memberi yang
            terbaik.
          </p>
          <Button
            variant="cream"
            onClick={() => navigate(first ? '/learn/' + first.id : '/catalog')}
          >
            {first ? 'Lanjutkan pembelajaran' : 'Jelajahi kelas'}
            <ArrowRight size={17} />
          </Button>
          <div className="hero-bottom">
            <span className="avatar-stack">
              <i>AP</i>
              <i>SR</i>
              <i>BS</i>
            </span>
            <span>Ruang untuk belajar & berkembang bersama</span>
          </div>
        </div>
        <FactoryArt />
        <div className="hero-caption">
          <span>✦</span> Setiap proses dimulai dari satu langkah.
        </div>
      </section>
      <div className="stat-grid learner-stats">
        {[
          [
            BookOpen,
            'Kelas Diikuti',
            data.enrollments.length,
            'Total pembelajaran Anda',
            'sage',
          ],
          [
            PlayCircle,
            'Sedang Dipelajari',
            active.filter(
              (e) =>
                data.summaries.find((s) => s.courseId === e.course_id)?.started,
            ).length,
            'Lanjutkan langkah Anda',
            'amber',
          ],
          [
            CheckCircle2,
            'Kelas Selesai',
            finished.length,
            'Pencapaian yang berarti',
            'blue',
          ],
          [
            GraduationCap,
            'Onboarding',
            `${required.length ? Math.round((completedRequired / required.length) * 100) : 0}%`,
            `${completedRequired} dari ${required.length} kelas wajib selesai`,
            'lavender',
          ],
        ].map(([Icon, label, value, hint, tone]) => (
          <div className="stat-card" key={label}>
            <span className={`stat-icon ${tone}`}>
              <Icon size={21} />
            </span>
            <div>
              <span className="stat-label">{label}</span>
              <strong>{value}</strong>
              <small>{hint}</small>
            </div>
          </div>
        ))}
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">
              <span /> LANGKAH PERTAMA ANDA
            </div>
            <h2>
              Onboarding untuk Anda <Badge tone="amber">Wajib diikuti</Badge>
            </h2>
            <p>Bekal penting untuk memulai perjalanan bersama Polindo Utama.</p>
          </div>
          <a href="#/onboarding" className="text-link">
            Lihat program <ArrowRight size={16} />
          </a>
        </div>
        {required.length ? (
          <div className="onboarding-strip">
            <div className="onboarding-strip-top">
              <span>
                <GraduationCap size={18} /> Program Onboarding Karyawan Baru
              </span>
              <strong>
                {completedRequired}/{required.length} kelas selesai
              </strong>
            </div>
            <div className="onboarding-grid">
              {required.slice(0, 3).map((e, i) => {
                const c = data.courses.find((c) => c.id === e.course_id),
                  s = data.summaries.find((s) => s.courseId === e.course_id),
                  Icon = coverIcons[c?.cover] || BookOpen;
                return (
                  c && (
                    <button
                      key={e.id}
                      className="onboarding-item"
                      onClick={() => navigate('/course/' + c.id)}
                    >
                      <span className={`onboarding-icon ${c.cover}`}>
                        <Icon size={24} />
                      </span>
                      <div>
                        <span className="onboarding-step">
                          LANGKAH 0{i + 1}
                        </span>
                        <h3>{c.title}</h3>
                        <span className="onboarding-duration">
                          <Clock3 size={12} />
                          {c.duration} menit <i>·</i> {s?.percent || 0}% selesai
                        </span>
                        <Progress value={s?.percent} />
                      </div>
                      <span className="onboarding-arrow">
                        {s?.complete ? (
                          <Check size={16} />
                        ) : (
                          <ChevronRight size={17} />
                        )}
                      </span>
                    </button>
                  )
                );
              })}
            </div>
          </div>
        ) : (
          <Empty
            title="Belum ada penugasan onboarding"
            text="HR akan menambahkan program onboarding Anda di sini."
          />
        )}
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">
              <span /> TERUS KEMBANGKAN DIRI
            </div>
            <h2>Temukan hal baru untuk dipelajari</h2>
            <p>Perluas pengetahuan, satu kelas pada satu waktu.</p>
          </div>
          <a href="#/catalog" className="text-link">
            Jelajahi katalog <ArrowRight size={16} />
          </a>
        </div>
        <div className="course-grid">
          {data.courses
            .filter(
              (c) =>
                c.status === 'published' &&
                !required.some((e) => e.course_id === c.id),
            )
            .slice(0, 3)
            .map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                summary={data.summaries.find((s) => s.courseId === c.id)}
                enrollment={data.enrollments.find((e) => e.course_id === c.id)}
                onOpen={(id) => navigate('/course/' + id)}
              />
            ))}
        </div>
      </section>
      <div className="learning-note">
        <div className="learning-note-icon">
          <Sparkles size={24} />
        </div>
        <div>
          <h3>Investasi terbaik dimulai dari diri sendiri.</h3>
          <p>
            Luangkan waktu untuk belajar. Pengetahuan kecil hari ini bisa
            membawa perubahan besar esok hari.
          </p>
        </div>
        <span>
          KEEP GROWING <ArrowUpRight size={16} />
        </span>
      </div>
    </>
  );
}
function Catalog({ data, search, setSearch }) {
  const [category, setCategory] = useState('Semua');
  const courses = data.courses.filter(
    (c) =>
      c.status === 'published' &&
      (category === 'Semua' || c.category === category) &&
      `${c.title} ${c.description} ${c.category}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="EXPLORE & GROW"
        title="Katalog Kelas"
        subtitle="Temukan pengetahuan dan kemampuan baru untuk mendukung perjalanan Anda."
      />
      <div className="catalog-toolbar">
        <div className="search-input">
          <Search size={18} />
          <input
            aria-label="Cari dalam katalog"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kelas, topik, atau kemampuan…"
          />
          {search && (
            <button aria-label="Hapus pencarian" onClick={() => setSearch('')}>
              <X size={17} />
            </button>
          )}
        </div>
        <span>{courses.length} kelas tersedia</span>
      </div>
      <div className="category-tabs">
        {[
          ...new Set([...categories, ...data.courses.map((c) => c.category)]),
        ].map((c) => (
          <button
            key={c}
            className={category === c ? 'active' : ''}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {courses.length ? (
        <div className="course-grid">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              summary={data.summaries.find((s) => s.courseId === c.id)}
              enrollment={data.enrollments.find((e) => e.course_id === c.id)}
              onOpen={(id) => navigate('/course/' + id)}
            />
          ))}
        </div>
      ) : (
        <Empty
          title="Kelas belum ditemukan"
          text="Coba kata kunci lain atau pilih kategori berbeda."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setCategory('Semua');
              }}
            >
              Reset pencarian
            </Button>
          }
        />
      )}
    </>
  );
}
function MyLearning({ data, history }) {
  const [filter, setFilter] = useState('Semua');
  const courses = data.enrollments
    .map((e) => ({
      e,
      c: data.courses.find((c) => c.id === e.course_id),
      s: data.summaries.find((s) => s.courseId === e.course_id),
    }))
    .filter(
      ({ c, s }) =>
        c &&
        (history
          ? s?.complete
          : filter === 'Semua' ||
            (filter === 'Selesai' ? s?.complete : !s?.complete)),
    );
  return (
    <>
      <PageTitle
        eyebrow={history ? 'YOUR ACHIEVEMENTS' : 'ONE STEP AT A TIME'}
        title={history ? 'Riwayat Belajar' : 'Pembelajaran Saya'}
        subtitle={
          history
            ? 'Setiap kelas yang selesai adalah langkah maju. Lihat pencapaian Anda.'
            : 'Semua pembelajaran Anda, dalam satu tempat.'
        }
      />
      {!history && (
        <div className="category-tabs">
          {['Semua', 'Belum Selesai', 'Selesai'].map((f) => (
            <button
              key={f}
              className={f === filter ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}
      {courses.length ? (
        <div className="course-grid">
          {courses.map(({ c, s, e }) => (
            <CourseCard
              key={c.id}
              course={c}
              summary={s}
              enrollment={e}
              onOpen={(id) => navigate('/course/' + id)}
            />
          ))}
        </div>
      ) : (
        <Empty
          title={
            history
              ? 'Pencapaian Anda dimulai di sini'
              : 'Belum ada kelas di daftar ini'
          }
          text={
            history
              ? 'Selesaikan kelas pertama Anda untuk melihat riwayat belajar.'
              : 'Jelajahi katalog dan mulai kelas yang menarik untuk Anda.'
          }
          action={
            <Button onClick={() => navigate('/catalog')}>
              Jelajahi kelas <ArrowRight size={16} />
            </Button>
          }
        />
      )}
    </>
  );
}
function Onboarding({ data }) {
  return (
    <>
      <PageTitle
        eyebrow="A GREAT START"
        title="Onboarding Saya"
        subtitle="Bekal untuk memulai perjalanan Anda dengan siap, aman, dan percaya diri."
      />
      {data.programs.length ? (
        data.programs.map((p) => {
          const assignment = data.assignedPrograms.find(
              (a) => a.program_id === p.id,
            ),
            done = p.courseIds.filter(
              (id) => data.summaries.find((s) => s.courseId === id)?.complete,
            ).length;
          return (
            <section className="program-panel" key={p.id}>
              <div className="program-panel-heading">
                <span className="program-icon">
                  <GraduationCap size={30} />
                </span>
                <div>
                  <Badge tone="green">PROGRAM ONBOARDING</Badge>
                  <h2>{p.title}</h2>
                  <p>{p.description}</p>
                </div>
                <div className="program-overall">
                  <strong>
                    {Math.round((done / p.courseIds.length) * 100)}
                    <small>%</small>
                  </strong>
                  <span>
                    {done}/{p.courseIds.length} kelas selesai
                  </span>
                </div>
              </div>
              <Progress value={(done / p.courseIds.length) * 100} />
              <div className="program-deadline">
                <Clock3 size={15} /> Tenggat program: {date(assignment?.due)}
              </div>
              <div className="program-steps">
                {p.courseIds.map((id, i) => {
                  const c = data.courses.find((c) => c.id === id),
                    s = data.summaries.find((s) => s.courseId === id);
                  return (
                    c && (
                      <button
                        key={id}
                        className="program-step"
                        onClick={() => navigate('/course/' + id)}
                      >
                        <span
                          className={`step-number ${s?.complete ? 'done' : ''}`}
                        >
                          {s?.complete ? (
                            <Check size={20} />
                          ) : (
                            String(i + 1).padStart(2, '0')
                          )}
                        </span>
                        <div>
                          <h3>{c.title}</h3>
                          <p>
                            {c.lessons.length} materi <span>·</span>{' '}
                            {c.duration} menit
                          </p>
                          <Progress value={s?.percent} />
                        </div>
                        <Badge
                          tone={
                            s?.complete ? 'green' : s?.started ? 'amber' : ''
                          }
                        >
                          {s?.complete
                            ? 'Selesai'
                            : s?.started
                              ? 'Sedang dipelajari'
                              : 'Belum dimulai'}
                        </Badge>
                        <ChevronRight size={20} />
                      </button>
                    )
                  );
                })}
              </div>
            </section>
          );
        })
      ) : (
        <Empty
          title="Program onboarding belum ditugaskan"
          text="Hubungi HR jika Anda belum menerima program onboarding."
        />
      )}
    </>
  );
}
function CourseDetail({ id, data, run }) {
  const [busy, setBusy] = useState(false),
    c = data.courses.find((c) => c.id === id);
  if (!c) return <Empty title="Kelas tidak tersedia" />;
  const e = data.enrollments.find((e) => e.course_id === id),
    s = data.summaries.find((s) => s.courseId === id);
  const start = async () => {
    setBusy(true);
    try {
      if (!e)
        await run(() =>
          api('/courses/' + id + '/enroll', { method: 'POST', body: {} }),
        );
      navigate('/learn/' + id);
    } catch {
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button className="back-link" onClick={() => history.back()}>
        <ArrowLeft size={16} /> Kembali
      </button>
      <div className="detail-layout">
        <div>
          <Badge tone="green">{c.category}</Badge>
          <h1 className="detail-title">{c.title}</h1>
          <p className="detail-description">{c.description}</p>
          <div className="detail-meta">
            <span>
              <Building2 size={16} /> Polindo Utama
            </span>
            <span>
              <Clock3 size={16} /> {c.duration} menit
            </span>
            <span>
              <BookOpen size={16} /> {c.lessons.length} materi
            </span>
          </div>
          {c.status !== 'published' && (
            <div className="info-note">
              <AlertCircle size={18} /> Kelas ini{' '}
              {c.status === 'draft'
                ? 'masih berupa draft.'
                : 'telah diarsipkan. Riwayat pembelajaran tetap tersedia.'}
            </div>
          )}
          <section className="panel curriculum">
            <h2>Perjalanan belajar Anda</h2>
            <p>
              {c.sequential
                ? 'Materi dipelajari secara berurutan.'
                : 'Pelajari materi dengan urutan pilihan Anda.'}
            </p>
            {c.preQuiz && (
              <div className="curriculum-row">
                <span className="curriculum-number">
                  <ListChecks size={18} />
                </span>
                <span>
                  <strong>Pre-test · Evaluasi awal</strong>
                  <small>
                    {c.preQuiz.questions.length} soal · Sekali sebelum materi,
                    tanpa syarat nilai lulus
                  </small>
                </span>
              </div>
            )}
            {c.lessons.map((l, i) => {
              const Icon = icons[l.type];
              return (
                <div className="curriculum-row" key={l.id}>
                  <span className="curriculum-number">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Icon size={18} />
                  <span>
                    <strong>{l.title}</strong>
                    <small>
                      {l.module ? l.module + ' · ' : ''}
                      {lessonTypeLabels[l.type] || 'Materi'}
                      {l.required !== false ? ' · Wajib' : ' · Opsional'}
                    </small>
                  </span>
                  {s?.progress.some(
                    (p) => p.lesson_id === l.id && p.complete,
                  ) && <CheckCircle2 className="text-green" size={19} />}
                </div>
              );
            })}
            {c.quiz && (
              <div className="curriculum-row">
                <span className="curriculum-number">
                  <ListChecks size={18} />
                </span>
                <span>
                  <strong>Post-test · Evaluasi akhir</strong>
                  <small>
                    {c.quiz.questions.length} soal · Nilai minimum{' '}
                    {c.quiz.passScore}
                  </small>
                </span>
              </div>
            )}
          </section>
        </div>
        <aside className="detail-aside">
          <Cover type={c.cover} />
          <div className="detail-aside-body">
            {e && (
              <>
                <div className="progress-label">
                  <span>Progres Anda</span>
                  <strong>{s?.percent || 0}%</strong>
                </div>
                <Progress value={s?.percent} />
              </>
            )}
            <Button
              className="full"
              disabled={
                busy || c.status === 'draft' || (!e && c.status !== 'published')
              }
              onClick={start}
              icon={s?.complete ? CheckCircle2 : Play}
            >
              {busy
                ? 'Menyiapkan…'
                : s?.complete
                  ? 'Pelajari kembali'
                  : e
                    ? 'Lanjutkan belajar'
                    : 'Mulai belajar'}
            </Button>
            {data.user.role === 'admin' && (
              <Button
                className="full preview-button"
                variant="secondary"
                onClick={() => navigate('/preview/' + id)}
                icon={Eye}
              >
                Pratinjau materi
              </Button>
            )}
            {e?.required && (
              <div className="required-note">
                <ShieldCheck size={16} />
                <span>
                  Pembelajaran wajib
                  <br />
                  <strong>{date(e.due)}</strong>
                </span>
              </div>
            )}
            <ul className="course-benefits">
              <li>
                <Check size={15} /> Belajar sesuai waktu Anda
              </li>
              <li>
                <Check size={15} /> Progres tersimpan otomatis
              </li>
              <li>
                <Check size={15} /> Akses melalui komputer & ponsel
              </li>
            </ul>
            <div className="internal-note">
              <LockKeyhole size={14} /> Khusus karyawan Polindo Utama
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
function Player({ id, data, reload, notify, preview = false }) {
  const c = data.courses.find((c) => c.id === id),
    s = data.summaries.find((s) => s.courseId === id);
  const [selected, setSelected] = useState(() =>
    c?.preQuiz && (preview || !s?.preTest?.submitted)
      ? 'pre-test'
      : c?.lessons.find(
          (l) => !s?.progress.some((p) => p.lesson_id === l.id && p.complete),
        )?.id || (c?.quiz ? 'quiz' : c?.lessons[0]?.id),
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  if (!c) return <Empty title="Kelas tidak ditemukan" />;
  if (!preview && !data.enrollments.some((e) => e.course_id === id))
    return (
      <Empty
        title="Ikuti kelas terlebih dahulu"
        action={
          <Button onClick={() => navigate('/course/' + id)}>Lihat kelas</Button>
        }
      />
    );
  const isPre = selected === 'pre-test',
    isPost = selected === 'quiz',
    assessment = isPre || isPost,
    lesson = c.lessons.find((l) => l.id === selected);
  const preDone = !c.preQuiz || s.preTest.submitted;
  const allDone = c.lessons
    .filter((l) => l.required !== false)
    .every((l) => s.progress.some((p) => p.lesson_id === l.id && p.complete));
  const isLocked = (l) =>
    !preview &&
    (!preDone ||
      (c.sequential &&
        c.lessons
          .slice(0, c.lessons.indexOf(l))
          .some(
            (x) =>
              x.required !== false &&
              !s.progress.some((p) => p.lesson_id === x.id && p.complete),
          )));
  const next = () => {
    const after = c.lessons[c.lessons.indexOf(lesson) + 1];
    if (after) setSelected(after.id);
    else if (c.quiz) setSelected('quiz');
    else if (preview) navigate('/admin/courses');
    else {
      notify('Selamat! Kelas berhasil diselesaikan.');
    }
  };
  const complete = async () => {
    setBusy(true);
    setError('');
    try {
      await api('/courses/' + id + '/progress', {
        method: 'POST',
        body: { lessonId: lesson.id },
      });
      await reload();
      next();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const saveSegment = async (segment) => {
    await api('/courses/' + id + '/progress', {
      method: 'POST',
      body: { lessonId: lesson.id, ...segment },
    });
    setError('');
    await reload();
  };
  const change = (id) => {
    setSelected(id);
    setError('');
  };
  const lessonDone = s.progress.some(
    (p) => p.lesson_id === lesson?.id && p.complete,
  );
  return (
    <>
      <div className="player-top">
        <button className="back-link" onClick={() => navigate('/course/' + id)}>
          <ArrowLeft size={16} />
          Detail kelas
        </button>
        <span>{c.title}</span>
        <Badge tone="green">
          {preview
            ? 'Pratinjau · progres tidak dicatat'
            : s.percent + '% selesai'}
        </Badge>
      </div>
      <div className="player-layout">
        <section className="lesson-panel">
          <div className="lesson-panel-header">
            <Badge tone="green">
              {isPre
                ? 'PRE-TEST'
                : isPost
                  ? 'POST-TEST'
                  : `MATERI ${c.lessons.indexOf(lesson) + 1} / ${c.lessons.length}`}
            </Badge>
            <h1>
              {isPre
                ? 'Kenali pemahaman awal Anda'
                : isPost
                  ? 'Uji pemahaman Anda'
                  : lesson?.title}
            </h1>
          </div>
          <ErrorMessage message={error} />
          {assessment ? (
            <Assessment
              key={selected}
              phase={isPre ? 'pre' : 'post'}
              course={c}
              summary={s}
              preview={preview}
              available={isPre || (preDone && allDone)}
              reload={reload}
              onContinue={() => change(c.lessons[0]?.id)}
            />
          ) : !preview && isLocked(lesson) ? (
            <Empty
              title="Selesaikan tahap sebelumnya"
              text="Kerjakan pre-test dan materi wajib sebelumnya untuk melanjutkan."
            />
          ) : (
            <>
              <div className="lesson-content">
                <LessonContent
                  key={lesson?.id}
                  lesson={lesson}
                  preview={preview}
                  position={
                    s.progress.find((p) => p.lesson_id === lesson?.id)
                      ?.position || 0
                  }
                  onSegment={saveSegment}
                  onError={setError}
                />
              </div>
              <div className="lesson-actions">
                <span>
                  <ShieldCheck size={16} />
                  {preview
                    ? 'Mode pratinjau admin'
                    : 'Progres disimpan di akun Anda'}
                </span>
                {preview ? (
                  <Button onClick={next}>
                    Lanjutkan pratinjau <ArrowRight size={17} />
                  </Button>
                ) : isTrackedMedia(lesson) ? (
                  <Button disabled={!lessonDone} onClick={next}>
                    Materi berikutnya <ArrowRight size={17} />
                  </Button>
                ) : (
                  <Button disabled={busy} onClick={complete}>
                    {busy ? 'Menyimpan…' : 'Selesai & lanjutkan'}
                    <Check size={17} />
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
        <aside className="lesson-sidebar">
          <div className="lesson-sidebar-title">
            <h3>Isi pembelajaran</h3>
            <span>{s.percent}%</span>
          </div>
          <Progress value={s.percent} />
          {c.preQuiz && (
            <button
              className={`lesson-nav ${isPre ? 'active' : ''}`}
              onClick={() => change('pre-test')}
            >
              <span
                className={
                  'lesson-status ' + (s.preTest.attempts.length ? 'done' : '')
                }
              >
                {s.preTest.attempts.length ? (
                  <Check size={16} />
                ) : (
                  <ListChecks size={17} />
                )}
              </span>
              <span>
                <small>EVALUASI AWAL</small>
                <strong>Pre-test</strong>
              </span>
            </button>
          )}
          {c.lessons.map((l, i) => {
            const done = s.progress.some(
                (p) => p.lesson_id === l.id && p.complete,
              ),
              locked = isLocked(l),
              Icon = icons[l.type] || FileText;
            return (
              <button
                key={l.id}
                disabled={locked}
                className={`lesson-nav ${selected === l.id ? 'active' : ''}`}
                onClick={() => change(l.id)}
              >
                <span className={'lesson-status ' + (done ? 'done' : '')}>
                  {locked ? (
                    <LockKeyhole size={15} />
                  ) : done ? (
                    <Check size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </span>
                <span>
                  <small>
                    {l.module ? l.module + ' · ' : ''}MATERI{' '}
                    {String(i + 1).padStart(2, '0')}
                  </small>
                  <strong>{l.title}</strong>
                </span>
              </button>
            );
          })}
          {c.quiz && (
            <button
              disabled={!preview && (!preDone || !allDone)}
              className={`lesson-nav ${isPost ? 'active' : ''}`}
              onClick={() => change('quiz')}
            >
              <span
                className={
                  'lesson-status ' +
                  (s.attempts.some((a) => a.passed) ? 'done' : '')
                }
              >
                {preDone && allDone ? (
                  <ListChecks size={17} />
                ) : (
                  <LockKeyhole size={15} />
                )}
              </span>
              <span>
                <small>EVALUASI AKHIR</small>
                <strong>Post-test · Kuis pembelajaran</strong>
              </span>
            </button>
          )}
          <div className="lesson-sidebar-tip">
            <Sparkles size={21} />
            <p>Ambil waktu Anda. Pahami setiap materi sebelum melanjutkan.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
function Assessment({
  phase,
  course: c,
  summary: s,
  preview,
  available,
  reload,
  onContinue,
}) {
  const pre = phase === 'pre',
    quiz = pre ? c.preQuiz : c.quiz,
    attempts = pre ? s.preTest.attempts : s.attempts;
  const [answers, setAnswers] = useState({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [result, setResult] = useState(null);
  if (!quiz) return <Empty title="Evaluasi tidak tersedia" />;
  if (preview)
    return (
      <div className="quiz-content">
        <div className="info-note">
          <Eye size={18} />
          Pratinjau admin. Jawaban benar ditampilkan dan tidak dinilai.
        </div>
        {quiz.questions.map((q, i) => (
          <div className="quiz-question" key={q.id}>
            <h3>
              {i + 1}. {q.text}
            </h3>
            {q.options.map((o, j) => (
              <div
                key={j}
                className={'quiz-option ' + (q.answer === j ? 'selected' : '')}
              >
                {q.answer === j ? <CheckCircle2 size={17} /> : <span>○</span>}
                {o}
              </div>
            ))}
          </div>
        ))}
        {pre && (
          <Button onClick={onContinue}>
            Lanjutkan pratinjau <ArrowRight size={16} />
          </Button>
        )}
      </div>
    );
  if (!available)
    return (
      <Empty
        title="Selesaikan materi terlebih dahulu"
        text="Post-test terbuka setelah pre-test dan seluruh materi wajib selesai."
      />
    );
  if (pre && attempts.length)
    return (
      <div className="quiz-success pre-test-result">
        <div>
          <ListChecks size={45} />
        </div>
        <Badge tone="green">PRE-TEST TERSIMPAN</Badge>
        <h2>Pemahaman awal Anda sudah tercatat</h2>
        <p>
          Nilai ini menjadi gambaran awal, bukan syarat kelulusan. Sekarang,
          pelajari materi untuk meningkatkan pemahaman Anda.
        </p>
        <strong>
          {s.preTest.score}
          <small>/100</small>
        </strong>
        <Button onClick={onContinue}>
          Lanjutkan ke materi <ArrowRight size={16} />
        </Button>
      </div>
    );
  if (!pre && attempts.some((a) => a.passed))
    return (
      <div className="quiz-success">
        <div>
          <Award size={48} />
        </div>
        <Badge tone="green">KELAS SELESAI</Badge>
        <h2>Selamat, Anda berhasil!</h2>
        <p>
          Anda telah menyelesaikan seluruh materi dan lulus post-test kelas ini.
        </p>
        <strong>
          {Math.max(...attempts.map((a) => a.score))}
          <small>/100</small>
        </strong>
        {c.preQuiz && (
          <p>
            Nilai pre-test: <b>{s.preTest.score}</b> · Nilai post-test terbaik:{' '}
            <b>{Math.max(...attempts.map((a) => a.score))}</b>
          </p>
        )}
        <Button onClick={() => navigate('/history')}>
          Lihat pencapaian saya <ArrowRight size={16} />
        </Button>
      </div>
    );
  const remaining = pre ? 1 : s.remainingAttempts;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api('/courses/' + c.id + '/quiz', {
        method: 'POST',
        body: { phase, answers: quiz.questions.map((q) => answers[q.id]) },
      });
      setResult(r);
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="quiz-content">
      <div className="quiz-info">
        <span>
          <ListChecks size={17} />
          {quiz.questions.length} pertanyaan
        </span>
        {pre ? (
          <span>Sekali · Tanpa syarat nilai lulus</span>
        ) : (
          <>
            <span>Nilai minimum: {quiz.passScore}</span>
            <span>Sisa percobaan: {remaining}</span>
          </>
        )}
      </div>
      {pre && (
        <div className="info-note">
          <AlertCircle size={18} />
          Jawab sesuai pemahaman Anda saat ini. Setelah dikumpulkan, nilai awal
          disimpan dan materi terbuka.
        </div>
      )}
      <ErrorMessage message={error} />
      {result && !pre && (
        <div className="info-note">
          <AlertCircle size={20} />
          <span>
            Nilai Anda <strong>{result.score}</strong>. Nilai minimum kelulusan{' '}
            {quiz.passScore}. Pelajari kembali materi sebelum mencoba lagi.
          </span>
        </div>
      )}
      {remaining > 0 ? (
        <form onSubmit={submit}>
          {quiz.questions.map((q, i) => (
            <fieldset className="quiz-question" key={q.id}>
              <legend>
                <span>{i + 1}.</span> {q.text}
              </legend>
              {q.options.map((option, j) => (
                <label
                  key={j}
                  className={
                    'quiz-option ' + (answers[q.id] === j ? 'selected' : '')
                  }
                >
                  <input
                    type="radio"
                    required
                    name={q.id}
                    checked={answers[q.id] === j}
                    onChange={() => setAnswers({ ...answers, [q.id]: j })}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
          ))}
          <Button
            disabled={
              busy || quiz.questions.some((q) => answers[q.id] === undefined)
            }
            type="submit"
            icon={CheckCheck}
          >
            {busy ? 'Menilai…' : 'Kumpulkan jawaban'}
          </Button>
        </form>
      ) : (
        <Empty
          title="Kesempatan kuis habis"
          text="Hubungi admin HR untuk meminta kesempatan tambahan."
        />
      )}
    </div>
  );
}
function Profile({ user, onSaved, notify, required = false }) {
  const [current, setCurrent] = useState(''),
    [password, setPassword] = useState(''),
    [confirm, setConfirm] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Konfirmasi kata sandi tidak sama.');
      return;
    }
    setBusy(true);
    try {
      await api('/auth/password', {
        method: 'POST',
        body: { currentPassword: current, newPassword: password },
      });
      await onSaved();
      setCurrent('');
      setPassword('');
      setConfirm('');
      notify('Kata sandi berhasil diperbarui.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="YOUR PERSONAL SPACE"
        title={required ? 'Amankan akun Anda' : 'Profil & Pengaturan Akun'}
        subtitle={
          required
            ? 'Ganti kata sandi awal sebelum mulai belajar.'
            : 'Kelola informasi akun dan keamanan akses Anda.'
        }
      />
      <div className="profile-layout">
        <section className="panel profile-info">
          <span className="avatar large">{initials(user.name)}</span>
          <h2>{user.name}</h2>
          <Badge tone="green">
            {user.role === 'admin' ? 'Administrator' : 'Karyawan'}
          </Badge>
          <dl>
            <div>
              <dt>NIK</dt>
              <dd>{user.nik}</dd>
            </div>
            <div>
              <dt>Departemen</dt>
              <dd>{user.department}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email || 'Belum ditambahkan'}</dd>
            </div>
          </dl>
          <p>Hubungi HR untuk memperbarui identitas akun Anda.</p>
        </section>
        <section className="panel password-panel">
          <h2>Ubah kata sandi</h2>
          <p>Gunakan minimal 12 karakter dan kata sandi yang unik.</p>
          <form onSubmit={submit}>
            <Field label="Kata sandi saat ini">
              <input
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </Field>
            <Field label="Kata sandi baru">
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={256}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <Field label="Konfirmasi kata sandi baru">
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </Field>
            <ErrorMessage message={error} />
            <Button disabled={busy} icon={ShieldCheck}>
              {busy ? 'Menyimpan…' : 'Simpan kata sandi'}
            </Button>
          </form>
        </section>
      </div>
    </>
  );
}
function Admin({ route, data, run, notify }) {
  const [reports, setReports] = useState(null),
    [reportError, setReportError] = useState(''),
    [modal, setModal] = useState(null),
    [search, setSearch] = useState(''),
    [status, setStatus] = useState('Semua');
  useEffect(() => {
    setSearch('');
    setStatus('Semua');
  }, [route]);
  const loadReports = () =>
    api('/admin/reports')
      .then(setReports)
      .catch((e) => setReportError(e.message));
  useEffect(() => {
    loadReports();
  }, [data]);
  const mutate = async (fn, message) => {
    const r = await run(fn, message);
    setModal(null);
    return r;
  };
  const userList = data.users.filter((u) =>
    `${u.name} ${u.nik} ${u.department}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const courseList = data.courses.filter(
    (c) =>
      `${c.title} ${c.category}`.toLowerCase().includes(search.toLowerCase()) &&
      (status === 'Semua' || c.status === status),
  );
  const rows = reports?.rows || [],
    employees = data.users.filter((u) => u.role === 'employee'),
    completed = rows.filter((r) => r.complete).length,
    late = rows.filter((r) => r.late).length;
  const overview = route === '/admin';
  const titles = {
    '/admin': [
      'ADMIN WORKSPACE',
      'Ringkasan Pembelajaran',
      'Gambaran perjalanan belajar seluruh tim Polindo Utama.',
    ],
    '/admin/courses': [
      'LEARNING MANAGEMENT',
      'Kelola Kelas',
      'Susun pengetahuan yang membantu setiap karyawan berkembang.',
    ],
    '/admin/users': [
      'PEOPLE MANAGEMENT',
      'Karyawan',
      'Kelola akun dan akses pembelajaran tim Anda.',
    ],
    '/admin/programs': [
      'A STRUCTURED JOURNEY',
      'Program Onboarding',
      'Rangkai kelas menjadi perjalanan belajar yang terarah.',
    ],
    '/admin/assignments': [
      'LEARNING ASSIGNMENTS',
      'Penugasan',
      'Berikan pembelajaran yang tepat kepada orang yang tepat.',
    ],
    '/admin/reports': [
      'LEARNING INSIGHTS',
      'Laporan Pembelajaran',
      'Pantau progres, hasil evaluasi, dan penyelesaian pembelajaran.',
    ],
  };
  const [eyebrow, title, subtitle] = titles[route] || titles['/admin'];
  const action =
    route === '/admin/courses' ? (
      <Button icon={Plus} onClick={() => setModal({ type: 'course' })}>
        Buat kelas
      </Button>
    ) : route === '/admin/users' ? (
      <div className="button-row">
        <Button
          variant="secondary"
          icon={Upload}
          onClick={() => setModal({ type: 'import' })}
        >
          Impor CSV
        </Button>
        <Button icon={Plus} onClick={() => setModal({ type: 'user' })}>
          Tambah karyawan
        </Button>
      </div>
    ) : route === '/admin/programs' ? (
      <Button icon={Plus} onClick={() => setModal({ type: 'program' })}>
        Buat program
      </Button>
    ) : route === '/admin/assignments' ? (
      <Button icon={Plus} onClick={() => setModal({ type: 'assignment' })}>
        Buat penugasan
      </Button>
    ) : route === '/admin/reports' ? (
      <a className="button secondary" href="/api/admin/reports.csv">
        <Download size={17} /> Ekspor CSV
      </a>
    ) : (
      <Button icon={Plus} onClick={() => setModal({ type: 'assignment' })}>
        Buat penugasan
      </Button>
    );
  return (
    <>
      <PageTitle
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        action={action}
      />
      <ErrorMessage message={reportError} />
      {overview && (
        <>
          <div className="admin-banner">
            <div>
              <Badge tone="green">LEARNING THAT MAKES A DIFFERENCE</Badge>
              <h2>
                Bersama, bangun tim yang
                <br />
                <em>siap untuk berkembang.</em>
              </h2>
              <p>Mulai dari onboarding yang terarah hingga kemampuan baru.</p>
              <Button
                variant="secondary"
                onClick={() => navigate('/admin/courses')}
              >
                Kelola pembelajaran <ArrowRight size={16} />
              </Button>
            </div>
            <div className="admin-banner-art">
              <GraduationCap size={110} strokeWidth={0.8} />
              <span>
                GROW
                <br />
                TOGETHER.
              </span>
              <Sparkles size={30} />
            </div>
          </div>
          <div className="stat-grid">
            {[
              [
                Users,
                'Karyawan Aktif',
                employees.filter((u) => u.active).length,
                'Akses pembelajaran aktif',
                'sage',
              ],
              [
                BookOpen,
                'Kelas Diterbitkan',
                data.courses.filter((c) => c.status === 'published').length,
                'Siap untuk dipelajari',
                'blue',
              ],
              [
                CheckCircle2,
                'Penugasan Selesai',
                completed,
                `${rows.length} total penugasan kelas`,
                'lavender',
              ],
              [
                Clock3,
                'Perlu Tindak Lanjut',
                late,
                'Penugasan melewati tenggat',
                'amber',
              ],
            ].map(([Icon, label, value, hint, tone]) => (
              <div className="stat-card" key={label}>
                <span className={`stat-icon ${tone}`}>
                  <Icon size={21} />
                </span>
                <div>
                  <span className="stat-label">{label}</span>
                  <strong>{reports ? value : '—'}</strong>
                  <small>{hint}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="admin-dashboard-grid">
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Progres per departemen</h2>
                  <p>Rata-rata progres penugasan kelas</p>
                </div>
                <BarChart3 size={21} />
              </div>
              {[...new Set(employees.map((u) => u.department))].map((d) => {
                const items = rows.filter((r) => r.department === d),
                  percent = items.length
                    ? Math.round(
                        items.reduce((n, r) => n + r.percent, 0) / items.length,
                      )
                    : 0;
                return (
                  <div className="department-progress" key={d}>
                    <div>
                      <strong>{d}</strong>
                      <span>{percent}%</span>
                    </div>
                    <Progress value={percent} />
                    <small>
                      {items.filter((r) => r.complete).length} dari{' '}
                      {items.length} penugasan selesai
                    </small>
                  </div>
                );
              })}
            </section>
            <section className="panel quick-actions">
              <div className="panel-heading">
                <div>
                  <h2>Mulai dari sini</h2>
                  <p>Langkah kecil, dampak yang berarti.</p>
                </div>
                <Sparkles size={21} />
              </div>
              {[
                [
                  BookOpen,
                  'Buat kelas baru',
                  'Bagikan pengetahuan untuk tim',
                  'course',
                ],
                [
                  Users,
                  'Tambahkan karyawan',
                  'Siapkan akses belajar karyawan',
                  'user',
                ],
                [
                  ClipboardList,
                  'Tugaskan pembelajaran',
                  'Susun langkah berikutnya',
                  'assignment',
                ],
              ].map(([Icon, t, d, type]) => (
                <button key={type} onClick={() => setModal({ type })}>
                  <span>
                    <Icon size={20} />
                  </span>
                  <div>
                    <strong>{t}</strong>
                    <small>{d}</small>
                  </div>
                  <ArrowUpRight size={18} />
                </button>
              ))}
            </section>
          </div>
          <div className="section-heading">
            <div>
              <h2>Aktivitas pembelajaran</h2>
              <p>Penugasan dan perkembangan terbaru.</p>
            </div>
            <a className="text-link" href="#/admin/reports">
              Lihat laporan <ArrowRight size={16} />
            </a>
          </div>
          <ReportTable rows={rows.slice(0, 6)} loading={!reports} />
        </>
      )}
      {route === '/admin/courses' && (
        <>
          <div className="table-toolbar">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Cari kelas…"
            />
            <select
              aria-label="Filter status kelas"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Semua</option>
              <option value="published">Diterbitkan</option>
              <option value="draft">Draft</option>
              <option value="archived">Diarsipkan</option>
            </select>
            <span>{courseList.length} kelas</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kelas</th>
                  <th>Kategori</th>
                  <th>Materi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {courseList.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="table-course">
                        <span className={`table-course-icon ${c.cover}`}>
                          {React.createElement(
                            coverIcons[c.cover] || BookOpen,
                            { size: 21 },
                          )}
                        </span>
                        <div>
                          <strong>{c.title}</strong>
                          <small>{c.duration} menit</small>
                        </div>
                      </div>
                    </td>
                    <td>{c.category}</td>
                    <td>
                      {c.lessons.length} materi
                      {c.quiz && <small>Dengan kuis</small>}
                    </td>
                    <td>
                      <Badge
                        tone={
                          c.status === 'published'
                            ? 'green'
                            : c.status === 'draft'
                              ? 'amber'
                              : ''
                        }
                      >
                        {c.status === 'published'
                          ? 'Diterbitkan'
                          : c.status === 'draft'
                            ? 'Draft'
                            : 'Diarsipkan'}
                      </Badge>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          title="Lihat kelas"
                          aria-label={'Lihat ' + c.title}
                          onClick={() => navigate('/course/' + c.id)}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          title="Edit kelas"
                          aria-label={'Edit ' + c.title}
                          onClick={() =>
                            setModal({ type: 'course', course: c })
                          }
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          title="Duplikasikan ke draft"
                          aria-label={'Duplikasikan ' + c.title}
                          onClick={() =>
                            run(
                              () =>
                                api('/admin/courses/' + c.id + '/duplicate', {
                                  method: 'POST',
                                  body: {},
                                }),
                              'Salinan kelas tersimpan sebagai draft.',
                            ).catch(() => {})
                          }
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!courseList.length && (
              <Empty
                title="Belum ada kelas yang sesuai"
                action={
                  <Button onClick={() => setModal({ type: 'course' })}>
                    Buat kelas pertama
                  </Button>
                }
              />
            )}
          </div>
        </>
      )}
      {route === '/admin/users' && (
        <>
          <div className="table-toolbar">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Cari nama, NIK, atau departemen…"
            />
            <span>{userList.length} akun</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>NIK</th>
                  <th>Departemen</th>
                  <th>Peran</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="table-person">
                        <span className="avatar">{initials(u.name)}</span>
                        <div>
                          <strong>{u.name}</strong>
                          <small>{u.email || 'Email belum diisi'}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="mono">{u.nik}</span>
                    </td>
                    <td>{u.department}</td>
                    <td>{u.role === 'admin' ? 'Admin' : 'Karyawan'}</td>
                    <td>
                      <Badge tone={u.active ? 'green' : ''}>
                        {u.active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={'Edit ' + u.name}
                        onClick={() => setModal({ type: 'user', user: u })}
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!userList.length && <Empty title="Karyawan tidak ditemukan" />}
          </div>
          <div className="info-note">
            <ShieldCheck size={18} /> Akun baru wajib mengganti kata sandi awal
            saat pertama masuk. Penonaktifan akun mempertahankan riwayat
            belajar.
          </div>
        </>
      )}
      {route === '/admin/programs' && (
        <div className="admin-program-grid">
          {data.programs.map((p) => (
            <section className="panel admin-program-card" key={p.id}>
              <span className="program-icon">
                <GraduationCap size={27} />
              </span>
              <Badge tone="green">PROGRAM ONBOARDING</Badge>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <div className="program-class-list">
                {p.courseIds.map((id, i) => (
                  <div key={id}>
                    <span>{i + 1}</span>
                    {data.courses.find((c) => c.id === id)?.title ||
                      'Kelas diarsipkan'}
                  </div>
                ))}
              </div>
              <Button
                variant="secondary"
                onClick={() =>
                  setModal({ type: 'assignment', programId: p.id })
                }
              >
                Tugaskan program <ArrowRight size={16} />
              </Button>
            </section>
          ))}
          {!data.programs.length && (
            <Empty
              title="Buat perjalanan belajar pertama"
              text="Gabungkan beberapa kelas menjadi program onboarding."
            />
          )}
        </div>
      )}
      {(route === '/admin/assignments' || route === '/admin/reports') && (
        <>
          <div className="table-toolbar">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Cari karyawan, departemen, atau kelas…"
            />
            <select
              aria-label="Filter status pembelajaran"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {['Semua', 'Selesai', 'Belum Selesai', 'Terlambat'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <ReportTable
            rows={rows.filter(
              (r) =>
                `${r.name} ${r.nik} ${r.courseTitle} ${r.department}`
                  .toLowerCase()
                  .includes(search.toLowerCase()) &&
                (status === 'Semua' ||
                  (status === 'Selesai'
                    ? r.complete
                    : status === 'Terlambat'
                      ? r.late
                      : !r.complete)),
            )}
            loading={!reports}
            onExtra={(r) => setModal({ type: 'attempt', row: r })}
          />
          {route === '/admin/reports' && (
            <section className="panel audit-panel">
              <div className="panel-heading">
                <div>
                  <h2>Catatan aktivitas pengelola</h2>
                  <p>100 aktivitas terakhir untuk keterlacakan perubahan.</p>
                </div>
                <ShieldCheck size={20} />
              </div>
              {reports?.audit.length ? (
                reports.audit.slice(0, 20).map((a) => (
                  <div className="audit-row" key={a.id}>
                    <span className="audit-dot" />
                    <div>
                      <strong>{a.actor || 'Sistem'}</strong>
                      <span>{a.action}</span>
                    </div>
                    <small>
                      {new Date(a.created_at + 'Z').toLocaleString('id-ID')}
                    </small>
                  </div>
                ))
              ) : (
                <p className="muted">Belum ada aktivitas tercatat.</p>
              )}
            </section>
          )}
        </>
      )}
      {modal?.type === 'course' && (
        <CourseEditor
          departments={[...new Set(data.users.map((u) => u.department))]}
          course={modal.course}
          onClose={() => setModal(null)}
          onSave={(body) =>
            mutate(
              () =>
                api(
                  '/admin/courses' +
                    (modal.course ? '/' + modal.course.id : ''),
                  { method: modal.course ? 'PUT' : 'POST', body },
                ),
              'Kelas berhasil disimpan.',
            )
          }
        />
      )}
      {modal?.type === 'user' && (
        <UserEditor
          user={modal.user}
          departments={[...new Set(data.users.map((u) => u.department))]}
          onClose={() => setModal(null)}
          onSave={(body) =>
            mutate(
              () =>
                api('/admin/users' + (modal.user ? '/' + modal.user.id : ''), {
                  method: modal.user ? 'PUT' : 'POST',
                  body,
                }),
              'Akun karyawan berhasil disimpan.',
            )
          }
        />
      )}
      {modal?.type === 'program' && (
        <ProgramEditor
          courses={data.courses}
          onClose={() => setModal(null)}
          onSave={(body) =>
            mutate(
              () => api('/admin/programs', { method: 'POST', body }),
              'Program onboarding berhasil dibuat.',
            )
          }
        />
      )}
      {modal?.type === 'assignment' && (
        <AssignmentEditor
          data={data}
          programId={modal.programId}
          onClose={() => setModal(null)}
          onSave={(body) =>
            mutate(
              () => api('/admin/assignments', { method: 'POST', body }),
              'Pembelajaran berhasil ditugaskan.',
            )
          }
        />
      )}
      {modal?.type === 'import' && (
        <ImportUsers
          onClose={() => setModal(null)}
          onSave={(body) =>
            mutate(
              () => api('/admin/users/import', { method: 'POST', body }),
              'Karyawan berhasil diimpor.',
            )
          }
        />
      )}
      {modal?.type === 'attempt' && (
        <ExtraAttempt
          row={modal.row}
          onClose={() => setModal(null)}
          onSave={(body) =>
            mutate(
              () => api('/admin/extra-attempts', { method: 'POST', body }),
              'Satu kesempatan tambahan berhasil diberikan.',
            )
          }
        />
      )}
    </>
  );
}
function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="search-input">
      <Search size={17} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
        placeholder={placeholder}
      />
    </div>
  );
}
function ReportTable({ rows, loading, onExtra }) {
  if (loading) return <Loading />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Karyawan</th>
            <th>Kelas</th>
            <th>Progres</th>
            <th>Status</th>
            <th>Tenggat</th>
            <th>Pre-test</th>
            <th>Post-test</th>
            {onExtra && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <strong>{r.name}</strong>
                <small>
                  {r.department} · {r.nik}
                </small>
              </td>
              <td className="report-course">{r.courseTitle}</td>
              <td>
                <div className="table-progress">
                  <Progress value={r.percent} />
                  <span>{r.percent}%</span>
                </div>
              </td>
              <td>
                <Badge
                  tone={
                    r.complete
                      ? 'green'
                      : r.late
                        ? 'red'
                        : r.started
                          ? 'amber'
                          : ''
                  }
                >
                  {r.complete
                    ? 'Selesai'
                    : r.late
                      ? 'Terlambat'
                      : r.started
                        ? 'Sedang dipelajari'
                        : 'Belum dimulai'}
                </Badge>
              </td>
              <td className="nowrap">{date(r.due)}</td>
              <td>
                <strong>{r.preScore ?? '—'}</strong>
                <small>{r.preSubmitted ? 'Evaluasi awal' : ''}</small>
              </td>
              <td>
                <strong>{r.score ?? '—'}</strong>
                <small>
                  {r.attemptCount ? r.attemptCount + ' percobaan' : ''}
                </small>
              </td>
              {onExtra && (
                <td>
                  {r.hasQuiz && !r.complete && r.remainingAttempts === 0 && (
                    <button className="text-link" onClick={() => onExtra(r)}>
                      <RotateCcw size={15} /> +1 percobaan
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <Empty
          title="Belum ada penugasan yang sesuai"
          text="Penugasan dan hasil belajar karyawan akan ditampilkan di sini."
        />
      )}
    </div>
  );
}
function UserEditor({ user, departments, onClose, onSave }) {
  const [form, setForm] = useState(
      user
        ? { ...user, password: '', active: !!user.active }
        : {
            nik: '',
            name: '',
            email: '',
            department: '',
            role: 'employee',
            password: '',
            active: true,
          },
    ),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const set = (key, value) => setForm({ ...form, [key]: value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave(form);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title={user ? 'Edit karyawan' : 'Tambah karyawan'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <Field label="Nama lengkap">
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </Field>
          <Field label="NIK / ID Karyawan">
            <input
              required
              value={form.nik}
              onChange={(e) => set('nik', e.target.value)}
            />
          </Field>
          <Field label="Departemen">
            <input
              required
              list="departments"
              value={form.department}
              onChange={(e) => set('department', e.target.value)}
            />
            <datalist id="departments">
              {departments.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </Field>
          <Field label="Email (opsional)">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </Field>
          <Field label="Peran">
            <select
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
            >
              <option value="employee">Karyawan</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="Status akun">
            <select
              value={form.active ? 'active' : 'inactive'}
              onChange={(e) => set('active', e.target.value === 'active')}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </Field>
        </div>
        <Field
          label={user ? 'Reset kata sandi (opsional)' : 'Kata sandi awal'}
          hint="Minimal 12 karakter. Karyawan wajib menggantinya pada login pertama."
        >
          <input
            type="password"
            minLength={12}
            maxLength={256}
            required={!user}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
          />
        </Field>
        <ErrorMessage message={error} />
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={busy} type="submit">
            {busy ? 'Menyimpan…' : 'Simpan karyawan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function CourseEditor({ course, departments, onClose, onSave }) {
  const [form, setForm] = useState(
      course
        ? structuredClone(course)
        : {
            title: '',
            description: '',
            category: 'Orientasi',
            duration: 20,
            cover: 'company',
            status: 'draft',
            sequential: true,
            audience: [],
            lessons: [],
            quiz: null,
            preQuiz: null,
          },
    ),
    [tab, setTab] = useState('Informasi'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(null);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const upload = async (i, file) => {
    if (!file) return;
    const target = form.lessons[i];
    setUploading(i);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const [r, duration] = await Promise.all([
        api('/admin/uploads', { method: 'POST', body: fd }),
        isTrackedMedia(target)
          ? readMediaDuration(file, target.type)
          : Promise.resolve(null),
      ]);
      setForm((f) => ({
        ...f,
        lessons: f.lessons.map((l, j) =>
          l.id === target.id && l.type === target.type
            ? {
                ...l,
                assetId: r.id,
                fileName: r.name,
                url: '',
                provider: undefined,
                source: 'upload',
                ...(duration ? { durationSeconds: duration } : {}),
              }
            : l,
        ),
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(null);
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body = {
        ...form,
        lessons: form.lessons.map(({ fileName, ...l }) => ({
          ...l,
          body:
            l.type === 'text' && !/<[a-z][\s\S]*>/i.test(l.body || '')
              ? '<p>' +
                (l.body || '')
                  .replaceAll('&', '&amp;')
                  .replaceAll('<', '&lt;')
                  .replaceAll('>', '&gt;')
                  .replaceAll('\n', '</p><p>') +
                '</p>'
              : l.body,
        })),
      };
      await onSave(body);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={course ? 'Edit kelas' : 'Buat kelas baru'}
      wide
      onClose={onClose}
    >
      <div className="editor-tabs">
        {['Informasi', 'Materi', 'Kuis'].map((t) => (
          <button
            key={t}
            className={tab === t ? 'active' : ''}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Materi' && <span>{form.lessons.length}</span>}
          </button>
        ))}
      </div>
      <form onSubmit={submit}>
        {course && (
          <div className="info-note">
            <ShieldCheck size={18} />
            <span>
              Jika kelas sudah memiliki peserta, perubahan materi dan kuis
              memerlukan salinan draft baru untuk menjaga riwayat belajar.
            </span>
          </div>
        )}
        {tab === 'Informasi' && (
          <>
            <Field label="Judul kelas">
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                maxLength={150}
              />
            </Field>
            <Field label="Deskripsi">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </Field>
            <div className="form-grid">
              <Field label="Kategori">
                <input
                  list="categories"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                />
                <datalist id="categories">
                  {categories.slice(1).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </datalist>
              </Field>
              <Field label="Estimasi durasi (menit)">
                <input
                  type="number"
                  min={1}
                  max={6000}
                  value={form.duration}
                  onChange={(e) => set('duration', Number(e.target.value))}
                />
              </Field>
              <Field label="Tema sampul">
                <select
                  value={form.cover}
                  onChange={(e) => set('cover', e.target.value)}
                >
                  {Object.keys(coverIcons).map((k) => (
                    <option key={k} value={k}>
                      {
                        {
                          company: 'Perusahaan',
                          safety: 'Keselamatan',
                          factory: 'Pabrik',
                          quality: 'Kualitas',
                          teamwork: 'Kolaborasi',
                          digital: 'Teknologi',
                        }[k]
                      }
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status publikasi">
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Diterbitkan</option>
                  <option value="archived">Diarsipkan</option>
                </select>
              </Field>
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={!!form.sequential}
                onChange={(e) => set('sequential', e.target.checked)}
              />{' '}
              Materi harus dipelajari secara berurutan
            </label>
            <Field label="Akses kelas">
              <select
                value={form.audience?.length ? 'restricted' : 'all'}
                onChange={(e) =>
                  set(
                    'audience',
                    e.target.value === 'all'
                      ? []
                      : [departments[0] || 'Produksi'],
                  )
                }
              >
                <option value="all">Seluruh karyawan</option>
                <option value="restricted">Departemen tertentu</option>
              </select>
            </Field>
            {form.audience?.length > 0 && (
              <div className="selection-list">
                {departments.map((d) => (
                  <label key={d}>
                    <input
                      type="checkbox"
                      checked={form.audience.includes(d)}
                      onChange={(e) => {
                        const a = e.target.checked
                          ? [...form.audience, d]
                          : form.audience.filter((x) => x !== d);
                        if (a.length) set('audience', a);
                      }}
                    />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
            )}
            <Cover type={form.cover} small />
          </>
        )}
        {tab === 'Materi' && (
          <>
            <div className="editor-section-intro">
              <p>
                Tambahkan bacaan, video, gambar, atau presentasi PDF. Unggahan
                maksimal 100 MB per file.
              </p>
              <Button
                type="button"
                variant="secondary"
                icon={Plus}
                onClick={() =>
                  set('lessons', [
                    ...form.lessons,
                    {
                      id: crypto.randomUUID(),
                      title: '',
                      type: 'text',
                      body: '',
                      required: true,
                    },
                  ])
                }
              >
                Tambah materi
              </Button>
            </div>
            {!form.lessons.length && (
              <Empty
                title="Susun materi pertama Anda"
                text="Klik Tambah materi untuk memulai."
              />
            )}
            {form.lessons.map((l, i) => (
              <div className="lesson-editor" key={l.id}>
                <div className="lesson-editor-heading">
                  <strong>Materi {String(i + 1).padStart(2, '0')}</strong>
                  <div className="row-actions">
                    <button
                      type="button"
                      disabled={i === 0}
                      aria-label="Pindahkan materi ke atas"
                      onClick={() => {
                        const a = [...form.lessons];
                        [a[i - 1], a[i]] = [a[i], a[i - 1]];
                        set('lessons', a);
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={i === form.lessons.length - 1}
                      aria-label="Pindahkan materi ke bawah"
                      onClick={() => {
                        const a = [...form.lessons];
                        [a[i + 1], a[i]] = [a[i], a[i + 1]];
                        set('lessons', a);
                      }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      aria-label="Hapus materi"
                      onClick={() =>
                        set(
                          'lessons',
                          form.lessons.filter((_, j) => j !== i),
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <LessonFields
                  lesson={l}
                  uploading={uploading !== null}
                  uploadActive={uploading === i}
                  onUpload={(file) => upload(i, file)}
                  onChange={(patch) =>
                    setForm((f) => ({
                      ...f,
                      lessons: f.lessons.map((item, j) =>
                        j === i ? { ...item, ...patch } : item,
                      ),
                    }))
                  }
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={l.required !== false}
                    onChange={(e) =>
                      updateLesson(i, 'required', e.target.checked)
                    }
                  />{' '}
                  Materi wajib untuk kelulusan
                </label>
              </div>
            ))}
          </>
        )}
        {tab === 'Kuis' && (
          <>
            <QuizEditor
              phase="pre"
              quiz={form.preQuiz}
              onChange={(quiz) => set('preQuiz', quiz)}
            />
            <QuizEditor
              phase="post"
              quiz={form.quiz}
              onChange={(quiz) => set('quiz', quiz)}
            />
          </>
        )}
        <ErrorMessage message={error} />
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={busy || uploading !== null}>
            {busy ? 'Menyimpan…' : 'Simpan kelas'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function ProgramEditor({ courses, onClose, onSave }) {
  const [form, setForm] = useState({
      title: '',
      description: '',
      courseIds: [],
    }),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <Modal title="Buat program onboarding" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            await onSave(form);
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Nama program">
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </Field>
        <Field label="Deskripsi">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <p className="field-inline-label">
          Pilih kelas sesuai urutan pembelajaran
        </p>
        <div className="selection-list">
          {courses
            .filter((c) => c.status === 'published')
            .map((c) => (
              <label key={c.id}>
                <input
                  type="checkbox"
                  checked={form.courseIds.includes(c.id)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      courseIds: e.target.checked
                        ? [...form.courseIds, c.id]
                        : form.courseIds.filter((id) => id !== c.id),
                    })
                  }
                />
                <span>{c.title}</span>
                {form.courseIds.includes(c.id) && (
                  <Badge tone="green">{form.courseIds.indexOf(c.id) + 1}</Badge>
                )}
              </label>
            ))}
        </div>
        <ErrorMessage message={error} />
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={busy || !form.courseIds.length}>
            {busy ? 'Menyimpan…' : 'Buat program'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function AssignmentEditor({ data, programId, onClose, onSave }) {
  const [type, setType] = useState(programId ? 'program' : 'course'),
    [target, setTarget] = useState('department'),
    [item, setItem] = useState(programId || ''),
    [department, setDepartment] = useState(''),
    [userIds, setUserIds] = useState([]),
    [due, setDue] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const users = data.users.filter((u) => u.active && u.role === 'employee'),
    items =
      type === 'course'
        ? data.courses.filter((c) => c.status === 'published')
        : data.programs;
  return (
    <Modal title="Tugaskan pembelajaran" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            await onSave({
              [type === 'course' ? 'courseId' : 'programId']: item,
              department: target === 'department' ? department : undefined,
              userIds: target === 'users' ? userIds : undefined,
              due: due || null,
            });
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          <Field label="Jenis pembelajaran">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setItem('');
              }}
            >
              <option value="course">Kelas</option>
              <option value="program">Program onboarding</option>
            </select>
          </Field>
          <Field label="Pilih pembelajaran">
            <select
              required
              value={item}
              onChange={(e) => setItem(e.target.value)}
            >
              <option value="">
                Pilih {type === 'course' ? 'kelas' : 'program'}
              </option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Penerima">
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="department">Berdasarkan departemen</option>
            <option value="users">Pilih karyawan</option>
          </select>
        </Field>
        {target === 'department' ? (
          <Field label="Departemen">
            <select
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Pilih departemen</option>
              {[...new Set(users.map((u) => u.department))].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
        ) : (
          <div className="selection-list">
            {users.map((u) => (
              <label key={u.id}>
                <input
                  type="checkbox"
                  checked={userIds.includes(u.id)}
                  onChange={(e) =>
                    setUserIds(
                      e.target.checked
                        ? [...userIds, u.id]
                        : userIds.filter((id) => id !== u.id),
                    )
                  }
                />
                <span>
                  {u.name}
                  <small>
                    {u.nik} · {u.department}
                  </small>
                </span>
              </label>
            ))}
          </div>
        )}
        <Field label="Tenggat (opsional)">
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </Field>
        <div className="info-note">
          <CircleHelp size={18} />
          <span>
            Penugasan berlaku bagi karyawan aktif saat ini. Progres yang sudah
            ada dipertahankan. Jika kelas sudah ditugaskan, tenggat terdekat
            tetap berlaku.
          </span>
        </div>
        <ErrorMessage message={error} />
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={busy}>
            {busy ? 'Menugaskan…' : 'Tugaskan pembelajaran'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function parseCSV(text) {
  const rows = [];
  let row = [],
    cell = '',
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (quoted) throw new Error('CSV tidak valid: tanda kutip belum ditutup.');
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  if (rows.length < 2)
    throw new Error('CSV harus berisi header dan minimal satu karyawan.');
  const headers = rows.shift().map((h) =>
    h
      .replace(/^\uFEFF/, '')
      .trim()
      .toLowerCase(),
  );
  if (
    !['nik', 'name', 'department', 'password'].every((k) => headers.includes(k))
  )
    throw new Error(
      'Header wajib: nik,name,department,password. Email bersifat opsional.',
    );
  return rows.map((r) =>
    Object.fromEntries(headers.map((h, i) => [h, r[i]?.trim() || ''])),
  );
}
function ImportUsers({ onClose, onSave }) {
  const [rows, setRows] = useState([]),
    [preview, setPreview] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const read = async (file) => {
    setPreview(null);
    setRows([]);
    setError('');
    if (!file) return;
    setBusy(true);
    try {
      const parsed = parseCSV(await file.text());
      const p = await api('/admin/users/import', {
        method: 'POST',
        body: { rows: parsed, preview: true },
      });
      setRows(parsed);
      setPreview(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Impor karyawan melalui CSV" wide onClose={onClose}>
      <p className="muted">
        Unggah maksimal 500 akun. Seluruh baris divalidasi sebelum disimpan.
        Akun duplikat tidak akan ditimpa.
      </p>
      <a
        className="text-link"
        href={
          'data:text/csv;charset=utf-8,' +
          encodeURIComponent(
            'nik,name,department,email,password\nPU2026010,Nama Karyawan,Produksi,,GantiAwal!2026\n',
          )
        }
        download="template-karyawan-pulc.csv"
      >
        <Download size={16} /> Unduh template CSV
      </a>
      <Field label="Pilih file CSV">
        <input
          type="file"
          accept=".csv,text/csv"
          disabled={busy}
          onChange={(e) => read(e.target.files[0])}
        />
      </Field>
      <ErrorMessage message={error} />
      {preview && (
        <>
          <div className="info-note">
            <CheckCircle2 size={18} />
            {preview.count} karyawan lolos validasi. Tinjau data sebelum impor.
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>NIK</th>
                  <th>Nama</th>
                  <th>Departemen</th>
                </tr>
              </thead>
              <tbody>
                {preview.preview.map((r) => (
                  <tr key={r.nik}>
                    <td>{r.nik}</td>
                    <td>{r.name}</td>
                    <td>{r.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <div className="modal-actions">
        <Button variant="secondary" onClick={onClose}>
          Batal
        </Button>
        <Button
          disabled={busy || !preview}
          onClick={async () => {
            setBusy(true);
            try {
              await onSave({ rows });
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? 'Memproses…' : 'Impor ' + rows.length + ' karyawan'}
        </Button>
      </div>
    </Modal>
  );
}
function ExtraAttempt({ row, onClose, onSave }) {
  const [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <Modal title="Berikan kesempatan kuis tambahan" onClose={onClose}>
      <p>
        {row.name} · {row.courseTitle}
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await onSave({
              userId: row.user_id,
              courseId: row.course_id,
              reason,
            });
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Alasan pemberian kesempatan">
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        <p className="muted">
          Satu percobaan akan ditambahkan. Tindakan dan alasan dicatat dalam
          audit log.
        </p>
        <ErrorMessage message={error} />
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={busy}>Berikan kesempatan</Button>
        </div>
      </form>
    </Modal>
  );
}
createRoot(document.getElementById('root')).render(<App />);
