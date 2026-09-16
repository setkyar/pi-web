import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createScratchpadEvents } from './scratchpad-events.js';

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

describe('createScratchpadEvents', () => {
  beforeEach(() => {
    FakeEventSource.instances = [];
  });

  it('forwards scratchpad events', () => {
    const onChange = vi.fn();
    const sub = createScratchpadEvents({ EventSourceImpl: FakeEventSource, onChange });
    sub.connect();
    FakeEventSource.instances[0].emit(
      'scratchpad',
      JSON.stringify({ project: '/p', content: 'hi' }),
    );
    expect(onChange).toHaveBeenCalledWith({ project: '/p', content: 'hi' });
    sub.cleanup();
  });
});
