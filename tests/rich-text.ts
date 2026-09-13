import {fireEvent} from '@testing-library/react'

/**
 * Drives the question and answer fields, which are a ProseMirror
 * contenteditable rather than an <input>. `fireEvent.change` has no value
 * setter to call there and throws.
 *
 * Both steps matter. jsdom's Selection is not wired to ProseMirror's, so
 * building a DOM range over the element does not move the editor's cursor and
 * a bare paste lands at position zero, producing "NEWOLD" instead of "NEW".
 * Ctrl+A goes through ProseMirror's own selectAll keybinding, which it does
 * understand, and the component's handlePaste then replaces that selection.
 * This is the path a person takes: select all, paste.
 */
export function setRichText(element: HTMLElement, text: string): void {
  element.focus()
  fireEvent.keyDown(element, {key: 'a', ctrlKey: true})
  fireEvent.paste(element, {clipboardData: {getData: () => text}})
}

/** What the rich field shows. There is no `.value` on a contenteditable. */
export function richText(element: HTMLElement): string {
  return element.textContent ?? ''
}
