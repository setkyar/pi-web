function parseJSON(data) {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function createSchedulesEvents({
  topic = '__all__',
  EventSourceImpl = globalThis.EventSource,
  windowImpl = globalThis.window,
  onChange = () => {},
} = {}) {
  let stream = null;
  let pagehideHandler = null;
  let pageshowHandler = null;

  function closeStream() {
    if (stream) {
      stream.close();
      stream = null;
    }
  }

  function cleanup() {
    closeStream();
    if (pagehideHandler && windowImpl?.removeEventListener) {
      windowImpl.removeEventListener('pagehide', pagehideHandler);
      pagehideHandler = null;
    }
    if (pageshowHandler && windowImpl?.removeEventListener) {
      windowImpl.removeEventListener('pageshow', pageshowHandler);
      pageshowHandler = null;
    }
  }

  function connect() {
    if (!EventSourceImpl) return;
    cleanup();
    const es = new EventSourceImpl(`/events?id=${encodeURIComponent(topic)}`);
    stream = es;
    es.addEventListener('schedules', (event) => {
      onChange(parseJSON(event.data));
    });
    if (windowImpl?.addEventListener) {
      pagehideHandler = () => closeStream();
      pageshowHandler = () => {
        if (!stream) connect();
      };
      windowImpl.addEventListener('pagehide', pagehideHandler);
      windowImpl.addEventListener('pageshow', pageshowHandler);
    }
  }

  return { connect, cleanup };
}
