import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Download,
  FileText,
  Headphones,
  PlayCircle,
  RotateCcw,
} from 'lucide-react';
import { Button, ErrorMessage } from './ui.jsx';
import { youtubeVideoId, canvaEmbedURL } from '../shared/media.js';
let youtubeAPI;
function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeAPI) return youtubeAPI;
  youtubeAPI = new Promise((resolve, reject) => {
    const old = window.onYouTubeIframeAPIReady;
    const timer = setTimeout(
      () =>
        reject(
          new Error(
            'Pemutar YouTube belum dapat dimuat. Periksa koneksi atau izin jaringan.',
          ),
        ),
      15000,
    );
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timer);
      old?.();
      resolve(window.YT);
    };
    script.onerror = () => {
      clearTimeout(timer);
      script.remove();
      reject(
        new Error(
          'Pemutar YouTube tidak dapat dimuat. Periksa koneksi atau izin jaringan.',
        ),
      );
    };
    document.head.appendChild(script);
  }).catch((error) => {
    youtubeAPI = undefined;
    throw error;
  });
  return youtubeAPI;
}
// Keep disjoint played ranges. Seeking moves the cursor without awarding skipped time.
function usePlaybackReporter({
  initialPosition = 0,
  preview,
  onSegment,
  onError,
}) {
  const callbacks = useRef({ onSegment, onError });
  callbacks.current = { onSegment, onError };
  const state = useRef({
    last: initialPosition,
    lastAt: performance.now(),
    from: initialPosition,
    queue: [],
    sending: false,
  });
  const flush = async () => {
    const s = state.current;
    if (s.sending || preview) return;
    s.sending = true;
    try {
      while (s.queue.length) {
        const [from, to] = s.queue[0];
        await callbacks.current.onSegment({ from, to });
        s.queue.shift();
      }
    } catch (error) {
      callbacks.current.onError(error.message);
    } finally {
      s.sending = false;
    }
  };
  const reset = (position) => {
    state.current.last = position;
    state.current.lastAt = performance.now();
    state.current.from = position;
  };
  const tick = (position, force = false) => {
    if (preview || !Number.isFinite(position)) return;
    const s = state.current;
    const now = performance.now();
    const elapsed = Math.max(0, (now - s.lastAt) / 1000);
    if (
      position < s.last ||
      position - s.last > Math.max(2.75, elapsed * 2.1 + 0.5)
    ) {
      reset(position);
      return;
    }
    s.last = position;
    s.lastAt = now;
    if (position - s.from >= 5 || (force && position > s.from)) {
      for (let from = s.from; from < position; from += 15)
        s.queue.push([from, Math.min(from + 15, position)]);
      s.from = position;
    }
    if (s.queue.length) void flush();
  };
  return { tick, reset };
}
function NativeMedia({ lesson, initialPosition, preview, onSegment, onError }) {
  const ref = useRef(null);
  const reporter = usePlaybackReporter({
    initialPosition,
    preview,
    onSegment,
    onError,
  });
  const audio = lesson.type === 'audio',
    Tag = audio ? 'audio' : 'video';
  return (
    <div className={audio ? 'audio-lesson' : 'video-lesson'}>
      {audio && (
        <div className="audio-lesson-heading">
          <span>
            <Headphones size={29} />
          </span>
          <div>
            <strong>Dengarkan & pelajari</strong>
            <p>{lesson.title}</p>
          </div>
        </div>
      )}
      <Tag
        ref={ref}
        controls
        preload="metadata"
        aria-label={lesson.title}
        src={lesson.assetId ? '/api/files/' + lesson.assetId : lesson.url}
        onLoadedMetadata={() => {
          const media = ref.current;
          const start = Math.min(
            initialPosition || 0,
            Number.isFinite(media.duration)
              ? Math.max(0, media.duration - 0.1)
              : initialPosition || 0,
          );
          media.currentTime = start;
          reporter.reset(start);
        }}
        onSeeking={() => reporter.reset(ref.current.currentTime)}
        onTimeUpdate={() => reporter.tick(ref.current.currentTime)}
        onPause={() => reporter.tick(ref.current.currentTime, true)}
        onEnded={() => reporter.tick(ref.current.currentTime, true)}
        onError={() =>
          onError(
            'Media tidak dapat diputar. Periksa format file atau akses link, lalu muat ulang materi.',
          )
        }
      />
    </div>
  );
}
function YouTubeMedia({
  lesson,
  initialPosition,
  preview,
  onSegment,
  onError,
}) {
  const host = useRef(null),
    callbacks = useRef(null),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(0);
  const reporter = usePlaybackReporter({
    initialPosition,
    preview,
    onSegment,
    onError,
  });
  callbacks.current = reporter;
  useEffect(() => {
    let cancelled = false,
      player,
      timer;
    const stop = () => {
      clearInterval(timer);
      timer = null;
    };
    const tick = (force) => {
      if (player?.getCurrentTime)
        callbacks.current.tick(player.getCurrentTime(), force);
    };
    setError('');
    loadYouTubeAPI()
      .then((YT) => {
        if (cancelled) return;
        const target = document.createElement('div');
        host.current.replaceChildren(target);
        player = new YT.Player(target, {
          host: 'https://www.youtube-nocookie.com',
          videoId: youtubeVideoId(lesson.url),
          width: '100%',
          height: '100%',
          playerVars: {
            origin: window.location.origin,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              if (initialPosition > 0) player.seekTo(initialPosition, true);
              player.getIframe().setAttribute('title', lesson.title);
            },
            onStateChange: (event) => {
              stop();
              if (event.data === YT.PlayerState.PLAYING)
                timer = setInterval(() => tick(false), 1000);
              else if (
                event.data === YT.PlayerState.PAUSED ||
                event.data === YT.PlayerState.ENDED
              )
                tick(true);
            },
            onError: () => {
              stop();
              setError(
                'Video YouTube tidak tersedia atau tidak mengizinkan embed. Hubungi admin untuk memperbarui materi.',
              );
            },
          },
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
      stop();
      player?.destroy?.();
    };
  }, [lesson.id, lesson.url, retry]);
  return (
    <>
      <div className="youtube-player" ref={host} />
      {error && (
        <div className="embed-error">
          <ErrorMessage message={error} />
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => setRetry((x) => x + 1)}
          >
            Coba muat ulang YouTube
          </Button>
        </div>
      )}
      <a
        className="text-link media-external-link"
        href={lesson.url}
        target="_blank"
        rel="noreferrer"
      >
        Buka di YouTube <ArrowUpRight size={15} />
      </a>
      <small className="media-help">
        Pemutaran di luar PULC tidak mencatat progres. Gunakan pemutar di atas
        untuk menyelesaikan materi.
      </small>
    </>
  );
}
export function LessonContent({
  lesson,
  position = 0,
  preview,
  onSegment,
  onError,
}) {
  const l = lesson;
  if (!l) return null;
  return (
    <>
      {l.type === 'text' && (
        <article
          className="prose"
          dangerouslySetInnerHTML={{ __html: l.body }}
        />
      )}
      {l.type === 'image' && (
        <img
          className="lesson-image"
          src={'/api/files/' + l.assetId}
          alt={l.title}
        />
      )}
      {l.type === 'pdf' && (
        <>
          <iframe
            className="pdf-viewer"
            title={l.title}
            src={'/api/files/' + l.assetId}
          />
          <div className="media-link-row">
            <a
              className="text-link"
              href={'/api/files/' + l.assetId}
              target="_blank"
              rel="noreferrer"
            >
              Buka PDF di tab baru <ArrowUpRight size={15} />
            </a>
            <a
              className="button secondary"
              href={'/api/files/' + l.assetId + '?download=1'}
            >
              <Download size={16} />
              Unduh PDF
            </a>
          </div>
        </>
      )}
      {l.type === 'document' && (
        <div className="document-lesson">
          <span className="document-icon">
            <FileText size={38} />
          </span>
          <h2>Dokumen pembelajaran</h2>
          <p>
            Unduh dokumen ini untuk membacanya melalui Microsoft Word atau
            aplikasi yang kompatibel.
          </p>
          <a
            className="button secondary"
            href={'/api/files/' + l.assetId + '?download=1'}
          >
            <Download size={17} />
            Unduh dokumen
          </a>
        </div>
      )}
      {l.type === 'canva' && (
        <>
          <iframe
            className="canva-viewer"
            title={l.title}
            src={canvaEmbedURL(l.url)}
            allow="fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <a
            className="text-link media-external-link"
            href={l.url.replace('?embed', '')}
            target="_blank"
            rel="noreferrer"
          >
            Buka presentasi di Canva <ArrowUpRight size={15} />
          </a>
          <small className="media-help">
            Jika presentasi meminta akses, hubungi pemilik materi agar izin
            lihat dibuka untuk peserta.
          </small>
        </>
      )}
      {['video', 'audio'].includes(l.type) && (
        <>
          {l.provider === 'youtube' ? (
            <YouTubeMedia
              key={l.id}
              lesson={l}
              initialPosition={position}
              preview={preview}
              onSegment={onSegment}
              onError={onError}
            />
          ) : (
            <NativeMedia
              key={l.id}
              lesson={l}
              initialPosition={position}
              preview={preview}
              onSegment={onSegment}
              onError={onError}
            />
          )}
          <div className="info-note">
            <PlayCircle size={18} />
            {l.type === 'audio' ? 'Dengarkan' : 'Tonton'} minimal 90%{' '}
            {l.type === 'audio' ? 'audio' : 'video'}. Progres disimpan
            berdasarkan bagian yang diputar.
          </div>
        </>
      )}
      {l.type !== 'text' && l.description && (
        <section className="media-description">
          <div className="section-kicker">PENJELASAN & ARAHAN</div>
          <article
            className="prose"
            dangerouslySetInnerHTML={{ __html: l.description }}
          />
        </section>
      )}
    </>
  );
}
