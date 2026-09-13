/**
 * jsdom is missing two browser APIs this application legitimately uses, and a
 * component that calls either one throws during render rather than degrading.
 * Five test files had each stubbed them separately, and any file that forgot
 * failed with "matchMedia is not a function" on a component that is perfectly
 * correct in a browser. They belong here once.
 *
 * Both are deliberately inert: no media query matches, and observing nothing
 * reports nothing. A test that cares about a breakpoint or a resize should
 * stub its own, and `vi.stubGlobal` still overrides these.
 */
if (typeof window !== 'undefined') {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
  if (typeof window.ResizeObserver !== 'function') {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof window.ResizeObserver
  }
  /* jsdom implements neither, and <dialog> is how every modal in this app opens. */
  if (typeof HTMLDialogElement !== 'undefined') {
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
    }
    if (!HTMLDialogElement.prototype.close) {
      HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
    }
  }
}
