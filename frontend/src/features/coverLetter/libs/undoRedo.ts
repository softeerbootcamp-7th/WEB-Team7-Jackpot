import type { RefObject } from 'react';

export interface HistoryEntry {
  text: string;
  caret: number;
}

interface BindUndoRedoShortcutsParams {
  contentRef: RefObject<HTMLDivElement | null>;
  undoStack: { current: HistoryEntry[] };
  redoStack: { current: HistoryEntry[] };
  getCurrentText: () => string;
  getCurrentCaret: () => number;
  setCurrentCaret: (caret: number) => void;
  applyText: (text: string) => void;
}

export const bindUndoRedoShortcuts = ({
  contentRef,
  undoStack,
  redoStack,
  getCurrentText,
  getCurrentCaret,
  setCurrentCaret,
  applyText,
}: BindUndoRedoShortcutsParams) => {
  const performUndo = () => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop()!;
    redoStack.current.push({
      text: getCurrentText(),
      caret: getCurrentCaret(),
    });
    setCurrentCaret(prev.caret);
    applyText(prev.text);
  };

  const performRedo = () => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    undoStack.current.push({
      text: getCurrentText(),
      caret: getCurrentCaret(),
    });
    setCurrentCaret(next.caret);
    applyText(next.text);
  };

  const handleKey = (e: KeyboardEvent) => {
    if (!contentRef.current?.contains(document.activeElement)) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) {
        if (redoStack.current.length === 0) return;
        e.preventDefault();
        performRedo();
      } else {
        if (undoStack.current.length === 0) return;
        e.preventDefault();
        performUndo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      if (redoStack.current.length === 0) return;
      e.preventDefault();
      performRedo();
    }
  };

  document.addEventListener('keydown', handleKey);
  return () => document.removeEventListener('keydown', handleKey);
};
