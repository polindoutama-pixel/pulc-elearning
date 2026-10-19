// Only canonical provider URLs are embedded; arbitrary iframe HTML is never accepted.
function secureURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === '443')
      ? url
      : null;
  } catch {
    return null;
  }
}
export function youtubeVideoId(value) {
  const url = secureURL(value);
  if (!url) return null;
  let id;
  if (['youtu.be', 'www.youtu.be'].includes(url.hostname))
    id = url.pathname.slice(1);
  else if (
    [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtube-nocookie.com',
      'www.youtube-nocookie.com',
    ].includes(url.hostname)
  ) {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/)?.[1];
  }
  return /^[a-zA-Z0-9_-]{11}$/.test(id || '') ? id : null;
}
export function canvaEmbedURL(value) {
  const url = secureURL(value);
  if (
    !url ||
    !['canva.com', 'www.canva.com'].includes(url.hostname) ||
    !/^\/design\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)?\/view\/?$/.test(
      url.pathname,
    )
  )
    return null;
  return 'https://www.canva.com' + url.pathname.replace(/\/$/, '') + '?embed';
}
export function isTrackedMedia(lesson) {
  return ['video', 'audio'].includes(lesson?.type);
}
export const lessonTypeLabels = {
  text: 'Bacaan',
  video: 'Video',
  audio: 'Audio',
  image: 'Gambar',
  pdf: 'Presentasi / PDF',
  document: 'Dokumen Word',
  canva: 'Presentasi Canva',
};
