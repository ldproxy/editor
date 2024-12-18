interface YamlKey {
  path: string;
  index: number;
  lineOfPath: number;
  startOfArray?: number;
  arrayIndex?: number;
}

export function getPathAtCursor(allYamlKeys: YamlKey[], line: number, column: number): string {
  // Wenn textBeforeCursor existiert, muss in getPathAtCursor nicht von der Einrückung des Cursors,
  // sondern vom ersten Buchstaben des Wortes ausgegangen werden. AUßerdem muss line - 1 gerechnet werden.
  // Also werden einfach andere parameter reingegeben.

  if (allYamlKeys.length === 0) {
    return "";
  }

  let indexToUse = Math.min(line, allYamlKeys.length - 1);

  function getPathAtCursorString(
    indexToUse: number,
    column: number,
    allYamlKeys: YamlKey[]
  ): string {
    let foundObj = allYamlKeys.find((obj) => obj.lineOfPath === line);
    while (!foundObj && line > 0) {
      line--;
      foundObj = allYamlKeys.find((obj) => obj.lineOfPath === line);
    }

    if (foundObj) {
      indexToUse = allYamlKeys.indexOf(foundObj);
    }

    for (let i = indexToUse; i >= 0; i--) {
      const obj = allYamlKeys[i];
      if (obj.index !== null && obj.index < column) {
        return obj.path;
      }
    }
    return "";
  }

  return column > 0 ? getPathAtCursorString(indexToUse, column, allYamlKeys) : "";
}
