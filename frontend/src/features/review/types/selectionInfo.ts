export interface SelectionInfo {
  selectedText: string;
  range: { start: number; end: number };
  modalTop: number;
  modalLeft: number;
  lineEndIndex: number;
}
