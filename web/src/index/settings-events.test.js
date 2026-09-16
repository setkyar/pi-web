import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createSettingsEvents } from './settings-events.js';

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

describe('createSettingsEvents', () => {
  beforeEach(() => {
    FakeEventSource.instances = [];
  });

  it('forwards settings events', () => {
    const onChange = vi.fn();
    const sub = createSettingsEvents({ EventSourceImpl: FakeEventSource, onChange });
    sub.connect();
    FakeEventSource.instances[0].emit(
      'settings',
      JSON.stringify({ settings: { 'pi-web-theme': 'nord' } }),
    );
    expect(onChange).toHaveBeenCalledWith({ settings: { 'pi-web-theme': 'nord' } });
    sub.cleanup();
  });
});
