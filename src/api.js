export async function api(url, options = {}) {
  const response = await fetch('/api' + url, {
    credentials: 'same-origin',
    ...options,
    headers:
      options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json', ...options.headers },
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && url !== '/auth/login')
      window.dispatchEvent(new Event('pulc:unauthorized'));
    const error = new Error(
      data.error ||
        data.errors?.map((e) => `Baris ${e.row}: ${e.error}`).join('\n') ||
        'Permintaan gagal.',
    );
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}
export function navigate(route) {
  window.location.hash = route;
  window.scrollTo({ top: 0, behavior: 'instant' });
}
