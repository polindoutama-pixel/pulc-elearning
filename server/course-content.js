import sanitizeHtml from 'sanitize-html';
import { randomBytes } from 'node:crypto';
import { youtubeVideoId, canvaEmbedURL } from '../shared/media.js';
const id = () => randomBytes(12).toString('hex');
const text = (value, max) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';
function invalid(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}
export function cleanHTML(value) {
  if (typeof value !== 'string') return '';
  return sanitizeHtml(value.slice(0, 100000), {
    allowedTags: [
      'h2',
      'h3',
      'h4',
      'p',
      'br',
      'strong',
      'em',
      'ul',
      'ol',
      'li',
      'blockquote',
      'a',
    ],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['https', 'mailto'],
  });
}
export function validateLessons(input, db) {
  if (!Array.isArray(input) || input.length > 100)
    invalid('Daftar materi tidak valid (maksimal 100).');
  const ids = new Set();
  return input.map((l) => {
    if (!l || typeof l !== 'object') invalid('Data materi tidak valid.');
    const lesson = {
      id: text(l.id, 80) || id(),
      title: text(l.title, 150),
      type: l.type,
      required: l.required !== false,
    };
    if (ids.has(lesson.id) || ['pre-test', 'quiz'].includes(lesson.id))
      invalid('ID materi duplikat atau digunakan untuk evaluasi.');
    ids.add(lesson.id);
    if (
      !lesson.title ||
      !['text', 'video', 'audio', 'image', 'pdf', 'document', 'canva'].includes(
        l.type,
      )
    )
      invalid('Judul dan format setiap materi wajib diisi.');
    if (text(l.module, 100)) lesson.module = text(l.module, 100);
    if (l.type === 'text') {
      lesson.body = cleanHTML(l.body);
      if (
        !sanitizeHtml(lesson.body, {
          allowedTags: [],
          allowedAttributes: {},
        }).trim()
      )
        invalid('Materi teks tidak boleh kosong.');
    } else {
      if (l.description) {
        const description = cleanHTML(l.description);
        if (description.trim()) lesson.description = description;
      }
      if (l.type === 'canva') {
        lesson.url = canvaEmbedURL(l.url);
        if (!lesson.url)
          invalid(
            'Gunakan link lihat/sematkan Canva HTTPS dengan akhiran /view, bukan link edit.',
          );
      } else if (
        l.type === 'video' &&
        (l.provider === 'youtube' || (!l.assetId && youtubeVideoId(l.url)))
      ) {
        const videoId = youtubeVideoId(l.url);
        if (!videoId)
          invalid(
            'Link YouTube tidak valid. Gunakan youtube.com/watch, shorts, embed, atau youtu.be.',
          );
        lesson.provider = 'youtube';
        lesson.url = 'https://www.youtube.com/watch?v=' + videoId;
      } else if (l.assetId) {
        const file = db
          .prepare('SELECT * FROM files WHERE id=?')
          .get(l.assetId);
        const types = {
          video: ['video/mp4', 'video/webm'],
          audio: [
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/mp4',
            'audio/webm',
            'audio/flac',
          ],
          image: ['image/png', 'image/jpeg', 'image/webp'],
          pdf: ['application/pdf'],
          document: [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
        };
        if (!file || !types[l.type]?.includes(file.mime))
          invalid('File materi tidak ditemukan atau format tidak sesuai.');
        lesson.assetId = l.assetId;
      } else if (l.type === 'video' && typeof l.url === 'string') {
        let url;
        try {
          url = new URL(l.url);
        } catch {
          invalid('URL video tidak valid.');
        }
        if (url.protocol !== 'https:' || url.username || url.password)
          invalid(
            'Gunakan URL video HTTPS langsung atau link YouTube yang valid.',
          );
        // Provider-looking links must not silently become an unplayable native video.
        if (/(?:youtube|youtu\.be)/i.test(url.hostname))
          invalid('Link YouTube tidak valid.');
        lesson.url = l.url;
      } else invalid('Unggah file materi terlebih dahulu.');
      if (['video', 'audio'].includes(l.type)) {
        lesson.durationSeconds = Number(l.durationSeconds);
        if (
          !Number.isFinite(lesson.durationSeconds) ||
          lesson.durationSeconds < 1 ||
          lesson.durationSeconds > 86400
        )
          invalid(
            'Isi durasi video/audio yang benar dalam detik (maksimal 24 jam).',
          );
      }
    }
    return lesson;
  });
}
export function validateQuiz(value, phase = 'post') {
  if (value == null) return null;
  if (!value || typeof value !== 'object')
    invalid('Konfigurasi kuis tidak valid.');
  const pre = phase === 'pre',
    q = value;
  if (
    (!pre &&
      (!Number.isInteger(Number(q.passScore)) ||
        Number(q.passScore) < 1 ||
        Number(q.passScore) > 100 ||
        !Number.isInteger(Number(q.maxAttempts)) ||
        Number(q.maxAttempts) < 1 ||
        Number(q.maxAttempts) > 20)) ||
    !Array.isArray(q.questions) ||
    !q.questions.length ||
    q.questions.length > 100
  )
    invalid('Nilai kelulusan, batas percobaan, atau soal kuis tidak valid.');
  const seen = new Set();
  return {
    passScore: pre ? 0 : Number(q.passScore),
    maxAttempts: pre ? 1 : Number(q.maxAttempts),
    questions: q.questions.map((question) => {
      if (
        !question ||
        !text(question.text, 1000) ||
        !Array.isArray(question.options) ||
        question.options.length < 2 ||
        question.options.length > 6 ||
        question.options.some((o) => !text(o, 500)) ||
        !Number.isInteger(Number(question.answer)) ||
        Number(question.answer) < 0 ||
        Number(question.answer) >= question.options.length
      )
        invalid('Lengkapi pertanyaan, pilihan, dan kunci jawaban kuis.');
      const questionId = text(question.id, 80) || id();
      if (seen.has(questionId)) invalid('ID pertanyaan kuis duplikat.');
      seen.add(questionId);
      return {
        id: questionId,
        text: text(question.text, 1000),
        options: question.options.map((o) => text(o, 500)),
        answer: Number(question.answer),
      };
    }),
  };
}
export function redactQuiz(quiz) {
  return quiz
    ? { ...quiz, questions: quiz.questions.map(({ answer, ...q }) => q) }
    : null;
}
