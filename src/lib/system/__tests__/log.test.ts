import { describe, it, expect, vi, beforeEach } from 'vitest';
import { log } from '../log';

describe('Log System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset to debug level for testing
    log.configure({ minLevel: 'debug', consoleOutput: true, collapseNoisy: false });
  });

  it('calls console.info for info level', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    log.info('TEST', 'hello world');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain('[INFO]');
    expect(spy.mock.calls[0][0]).toContain('[TEST]');
    expect(spy.mock.calls[0][0]).toContain('hello world');
  });

  it('calls console.error for error level', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    log.error('ERR', 'something broke');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain('[ERROR]');
  });

  it('calls console.warn for warn level', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    log.warn('WARN', 'caution');
    expect(spy).toHaveBeenCalledOnce();
  });

  it('calls console.debug for debug level', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    log.debug('DBG', 'verbose');
    expect(spy).toHaveBeenCalledOnce();
  });

  it('suppresses logs below minLevel', () => {
    log.configure({ minLevel: 'warn' });
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    log.info('TEST', 'should not appear');
    log.debug('TEST', 'also hidden');
    expect(infoSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('includes trace_id when provided', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    log.info('MOD', 'traced', undefined, 'trace-123');
    expect(spy.mock.calls[0][0]).toContain('(trace-123)');
  });

  describe('forModule', () => {
    it('creates scoped logger that prefixes module name', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const nexusLog = log.forModule('NEXUS');
      nexusLog.info('routing request');
      expect(spy.mock.calls[0][0]).toContain('[NEXUS]');
    });
  });

  describe('log collapsing', () => {
    it('collapses repeated identical logs when enabled', () => {
      log.configure({ collapseNoisy: true });
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      // Send same log many times — some should be collapsed
      for (let i = 0; i < 10; i++) {
        log.info('NOISY', 'repeated message');
      }
      // Should have fewer than 10 calls due to collapsing
      expect(spy.mock.calls.length).toBeLessThan(10);
    });
  });
});
