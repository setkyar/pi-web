import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createSchedulesEvents } from './schedules-events.js';

class FakeEventSource {
  constructor(url) {
    this.url = url;
    this.listeners = {};
    this.close = vi.fn();
    FakeEventSource.instances.push(this);
  }
  addEventListener(name, fn) {
    (this.listeners[name] ||= []).push(fn);
  }
  emit(name, data) {
    for (const fn of this.listeners[name] || []) fn({ data });
  }
}
FakeEventSource.instances = [];

describe('createSchedulesEvents', () => {
  beforeEach(() => {
    FakeEventSource.instances = [];
  });

  it('subscribes to __all__ and forwards schedules events', () => {
    const onChange = vi.fn();
    const sub = createSchedulesEvents({
      EventSourceImpl: FakeEventSource,
      onChange,
    });
    sub.connect();

    const es = FakeEventSource.instances[0];
    expect(es.url).toBe('/events?id=__all__');

    es.emit('schedules', JSON.stringify({ action: 'created', id: 'abc' }));
    expect(onChange).toHaveBeenCalledWith({ action: 'created', id: 'abc' });

    es.emit('schedules', 'not-json');
    expect(onChange).toHaveBeenLastCalledWith(null);

    sub.cleanup();
    expect(es.close).toHaveBeenCalled();
  });
});
