export function shouldShowCompletionsProv2(
  pathAtCursor: string | undefined,
  textBeforeCursor: string,
  column: number,
  indentationOfpathAtCursor: number,
  indentationUsedInYaml: number,
  textBeforeCursorLength: number
): boolean {
  // For explanation of if-statement see ./completionsProv1.ts/isCompletionValid

  return (
    (pathAtCursor &&
      pathAtCursor.trim() !== "" &&
      textBeforeCursor.trim() === "" &&
      (column === indentationOfpathAtCursor + indentationUsedInYaml * 1 ||
        column === indentationOfpathAtCursor + indentationUsedInYaml * 2)) ||
    (pathAtCursor &&
      pathAtCursor.trim() !== "" &&
      textBeforeCursor.trim() !== "" &&
      !textBeforeCursor.trim().includes("-") &&
      (column === indentationOfpathAtCursor + indentationUsedInYaml * 1 + textBeforeCursorLength ||
        column ===
          indentationOfpathAtCursor + indentationUsedInYaml * 2 + textBeforeCursorLength)) ||
    (textBeforeCursor.trim() !== "" &&
      textBeforeCursor.trim() === "-" &&
      column === indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength + 1) ||
    (textBeforeCursor.trim() !== "" &&
      textBeforeCursor.trim() !== "-" &&
      textBeforeCursor.trim().includes("-") &&
      column === indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength)
  );
}
