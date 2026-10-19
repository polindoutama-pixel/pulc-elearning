import React from 'react';
const RichTextEditor = React.lazy(() =>
  import('./rich-text-editor.jsx').then((module) => ({
    default: module.RichTextEditor,
  })),
);
import {
  Plus,
  Trash2,
  X,
  CheckCircle2,
  ArrowUpRight,
  ListChecks,
} from 'lucide-react';
import { Button, Field } from './ui.jsx';
import {
  youtubeVideoId,
  canvaEmbedURL,
  isTrackedMedia,
} from '../shared/media.js';
const accepts = {
  video: '.mp4,.webm',
  audio: '.mp3,.wav,.ogg,.m4a,.flac,.weba',
  image: '.png,.jpg,.jpeg,.webp',
  pdf: '.pdf',
  document: '.doc,.docx',
};
export function LessonFields({
  lesson: l,
  onChange,
  onUpload,
  uploading,
  uploadActive,
}) {
  const source =
    l.provider === 'youtube' || youtubeVideoId(l.url)
      ? 'youtube'
      : l.source || (!l.assetId && l.url ? 'url' : 'upload');
  const changeType = (type) =>
    onChange({
      type,
      assetId: undefined,
      fileName: undefined,
      url: undefined,
      provider: undefined,
      source: undefined,
      durationSeconds: undefined,
      body: l.body || '',
    });
  return (
    <>
      <Field label="Modul / bagian (opsional)">
        <input
          value={l.module || ''}
          onChange={(e) => onChange({ module: e.target.value })}
          placeholder="Misalnya: Pengenalan Perusahaan"
        />
      </Field>
      <div className="form-grid">
        <Field label="Judul materi">
          <input
            data-lesson-title
            value={l.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </Field>
        <Field label="Format">
          <select value={l.type} onChange={(e) => changeType(e.target.value)}>
            <option value="text">Teks / artikel</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="image">Gambar</option>
            <option value="pdf">Presentasi / PDF</option>
            <option value="document">Dokumen Word (DOC/DOCX)</option>
            <option value="canva">Presentasi Canva</option>
          </select>
        </Field>
      </div>
      {l.type === 'text' ? (
        <React.Suspense
          fallback={
            <div className="loading" role="status">
              Menyiapkan editor artikel…
            </div>
          }
        >
          <RichTextEditor
            label="Isi materi"
            value={l.body || ''}
            onChange={(body) => onChange({ body })}
          />
        </React.Suspense>
      ) : (
        <>
          {l.type === 'video' && (
            <Field label="Sumber video">
              <select
                value={source}
                disabled={uploading}
                onChange={(e) =>
                  onChange({
                    source: e.target.value,
                    provider:
                      e.target.value === 'youtube' ? 'youtube' : undefined,
                    assetId: undefined,
                    fileName: undefined,
                    url: '',
                  })
                }
              >
                <option value="upload">Upload video</option>
                <option value="youtube">Link YouTube</option>
                <option value="url">Link langsung MP4/WebM</option>
              </select>
            </Field>
          )}
          {l.type === 'canva' ? (
            <Field
              label="Link presentasi Canva"
              hint="Tempel link lihat atau embed yang berakhiran /view. Aktifkan akses lihat untuk peserta di Canva; link edit tidak didukung."
            >
              <input
                type="url"
                value={l.url || ''}
                placeholder="https://www.canva.com/design/…/view"
                onChange={(e) => onChange({ url: e.target.value })}
              />
              {l.url && (
                <small>
                  {canvaEmbedURL(l.url)
                    ? 'Link Canva siap disematkan.'
                    : 'Gunakan link lihat/sematkan Canva, bukan kode iframe atau link edit.'}
                </small>
              )}
            </Field>
          ) : l.type === 'video' && source !== 'upload' ? (
            <Field
              label={
                source === 'youtube' ? 'Link video YouTube' : 'URL video HTTPS'
              }
              hint={
                source === 'youtube'
                  ? 'Mendukung link watch, youtu.be, shorts, dan embed. Video harus mengizinkan penyematan.'
                  : 'Gunakan URL langsung ke video MP4/WebM.'
              }
            >
              <input
                type="url"
                value={l.url || ''}
                placeholder={
                  source === 'youtube'
                    ? 'https://www.youtube.com/watch?v=…'
                    : 'https://…/video.mp4'
                }
                onChange={(e) => onChange({ url: e.target.value })}
              />
              {source === 'youtube' && l.url && (
                <small>
                  {youtubeVideoId(l.url)
                    ? 'Link YouTube valid.'
                    : 'ID video YouTube belum valid.'}
                </small>
              )}
            </Field>
          ) : (
            <>
              <Field
                label={
                  l.assetId
                    ? 'File sudah diunggah · pilih untuk mengganti'
                    : 'Unggah file materi'
                }
                hint={
                  l.type === 'audio'
                    ? 'MP3, WAV, OGG, M4A, FLAC, atau WebM audio.'
                    : l.type === 'document'
                      ? 'DOC/DOCX dibaca dengan aplikasi Word setelah diunduh.'
                      : 'Maksimal 100 MB per file.'
                }
              >
                <input
                  type="file"
                  disabled={uploading}
                  accept={accepts[l.type]}
                  onChange={(e) => onUpload(e.target.files[0])}
                />
              </Field>
              {l.assetId && (
                <a
                  className="text-link"
                  href={'/api/files/' + l.assetId}
                  target="_blank"
                  rel="noreferrer"
                >
                  <CheckCircle2 size={15} />
                  {l.fileName || 'Lihat file tersimpan'}
                  <ArrowUpRight size={14} />
                </a>
              )}
              {uploadActive && <p className="muted">Mengunggah file…</p>}
            </>
          )}
          {isTrackedMedia(l) && (
            <Field
              label={
                l.type === 'audio'
                  ? 'Durasi audio (detik)'
                  : 'Durasi video (detik)'
              }
              hint="Isi sesuai durasi sebenarnya. Penyelesaian membutuhkan 90% bagian yang diputar."
            >
              <input
                type="number"
                min={1}
                max={86400}
                value={l.durationSeconds || ''}
                onChange={(e) =>
                  onChange({ durationSeconds: Number(e.target.value) })
                }
              />
            </Field>
          )}
          <Field
            label="Deskripsi / arahan materi (opsional)"
            hint="Teks ini tampil di bawah multimedia. Tulis penjelasan, transkrip, atau arahan yang perlu diikuti peserta."
          >
            <textarea
              rows={5}
              value={l.description || ''}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Jelaskan hal yang perlu diperhatikan dari materi ini…"
            />
          </Field>
        </>
      )}
    </>
  );
}
export function QuizEditor({ phase, quiz, onChange }) {
  const pre = phase === 'pre',
    title = pre ? 'Pre-test · Evaluasi awal' : 'Post-test · Evaluasi akhir';
  const update = (key, value) => onChange({ ...quiz, [key]: value });
  const question = (i, patch) =>
    update(
      'questions',
      quiz.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)),
    );
  const fresh = () => ({
    id: crypto.randomUUID(),
    text: '',
    options: ['', ''],
    answer: 0,
  });
  return (
    <section
      className="assessment-editor"
      aria-label={pre ? 'Pengaturan pre-test' : 'Pengaturan post-test'}
    >
      <div className="assessment-editor-heading">
        <ListChecks size={21} />
        <div>
          <h3>{title}</h3>
          <p>
            {pre
              ? 'Mengukur pemahaman awal sebelum materi dibuka. Dikerjakan sekali; tidak menentukan kelulusan.'
              : 'Mengukur pemahaman setelah semua materi wajib selesai. Menentukan kelulusan kelas.'}
          </p>
        </div>
      </div>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={!!quiz}
          onChange={(e) =>
            onChange(
              e.target.checked
                ? {
                    passScore: pre ? 0 : 80,
                    maxAttempts: pre ? 1 : 3,
                    questions: [fresh()],
                  }
                : null,
            )
          }
        />
        {pre ? 'Aktifkan pre-test' : 'Tambahkan evaluasi akhir kelas'}
      </label>
      {quiz && (
        <>
          {!pre && (
            <div className="form-grid">
              <Field label="Nilai minimum kelulusan">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quiz.passScore}
                  onChange={(e) => update('passScore', Number(e.target.value))}
                />
              </Field>
              <Field label="Batas percobaan">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={quiz.maxAttempts}
                  onChange={(e) =>
                    update('maxAttempts', Number(e.target.value))
                  }
                />
              </Field>
            </div>
          )}
          {quiz.questions.map((q, i) => (
            <div className="lesson-editor" key={q.id}>
              <div className="lesson-editor-heading">
                <strong>Pertanyaan {i + 1}</strong>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Hapus pertanyaan"
                  onClick={() =>
                    update(
                      'questions',
                      quiz.questions.filter((_, j) => j !== i),
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <Field label="Pertanyaan">
                <textarea
                  rows={2}
                  value={q.text}
                  onChange={(e) => question(i, { text: e.target.value })}
                />
              </Field>
              <span className="field-inline-label">
                Pilihan jawaban · tandai jawaban yang benar
              </span>
              {q.options.map((option, j) => (
                <div className="option-editor" key={j}>
                  <input
                    type="radio"
                    aria-label={'Kunci jawaban ' + (j + 1)}
                    checked={q.answer === j}
                    onChange={() => question(i, { answer: j })}
                  />
                  <input
                    aria-label={'Pilihan jawaban ' + (j + 1)}
                    value={option}
                    onChange={(e) =>
                      question(i, {
                        options: q.options.map((o, k) =>
                          j === k ? e.target.value : o,
                        ),
                      })
                    }
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Hapus pilihan"
                      onClick={() =>
                        question(i, {
                          options: q.options.filter((_, k) => k !== j),
                          answer:
                            q.answer === j
                              ? 0
                              : q.answer > j
                                ? q.answer - 1
                                : q.answer,
                        })
                      }
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && (
                <Button
                  type="button"
                  variant="ghost"
                  icon={Plus}
                  onClick={() => question(i, { options: [...q.options, ''] })}
                >
                  Tambah pilihan
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            icon={Plus}
            onClick={() => update('questions', [...quiz.questions, fresh()])}
          >
            Tambah pertanyaan
          </Button>
        </>
      )}
    </section>
  );
}

export function readMediaDuration(file, type) {
  return new Promise((resolve) => {
    const media = document.createElement(type === 'audio' ? 'audio' : 'video');
    const url = URL.createObjectURL(file);
    const finish = (value) => {
      clearTimeout(timer);
      media.onloadedmetadata = null;
      media.onerror = null;
      media.removeAttribute('src');
      media.load();
      URL.revokeObjectURL(url);
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), 4000);
    media.preload = 'metadata';
    media.onloadedmetadata = () =>
      finish(
        Number.isFinite(media.duration) && media.duration > 0
          ? Math.ceil(media.duration)
          : null,
      );
    media.onerror = () => finish(null);
    media.src = url;
  });
}
