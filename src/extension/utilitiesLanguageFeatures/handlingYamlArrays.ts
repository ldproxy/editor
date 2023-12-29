export function extractIndexFromPath(path: string): number | null {
  const regex = /\[(\d+)\]/;

  const match = path.match(regex);
  console.log("match", match);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  return null;
}

export function getLinesForArrayIndex(
  allYamlKeys: {
    path: string;
    index: number;
    lineOfPath: number | null;
    startOfArray?: number;
    arrayIndex?: number;
  }[],
  index: number,
  path: string
): number | undefined {
  let line: number = 0;
  const pathToUse = path.replace(/\[\d+\]/g, "");

  for (const obj of allYamlKeys) {
    if (obj.startOfArray && obj.arrayIndex === index && obj.path === pathToUse) {
      line = obj.startOfArray;
    }
  }
  console.log("ttt", line);
  console.log("pathiToUse", pathToUse);
  if (line > 0) {
    return line;
  }
}

export function getMaxLine(
  allYamlKeys: {
    path: string;
    index: number;
    lineOfPath: number | undefined;
    startOfArray?: number;
    arrayIndex?: number;
  }[],
  minLine: number
): number | undefined {
  let myItem:
    | {
        path: string;
        index: number;
        lineOfPath: number | undefined;
        startOfArray?: number;
        arrayIndex?: number;
      }
    | undefined = undefined;
  while (!myItem) {
    myItem = allYamlKeys.find((item) => item.lineOfPath === minLine);
    minLine++;
  }
  let startIndex = 0;
  if (myItem) {
    startIndex = allYamlKeys.findIndex((item) => item === myItem);
  }

  if (startIndex > 0) {
    for (let i = startIndex; i < allYamlKeys.length; i++) {
      console.log("startIndex", startIndex, myItem);
      const currentItem = allYamlKeys[i];
      console.log("currentItem", currentItem);
      if (
        (myItem && currentItem.startOfArray !== myItem.startOfArray) ||
        (myItem && !currentItem.hasOwnProperty("arrayIndex")) ||
        (myItem && i === allYamlKeys.length - 1)
      ) {
        console.log("iiii", i);
        if (i === allYamlKeys.length - 1 && currentItem && currentItem.lineOfPath) {
          console.log("landet hier", currentItem.lineOfPath);
          return currentItem.lineOfPath + 2;
        } else if (currentItem.startOfArray) {
          return currentItem.startOfArray;
        } else if (currentItem.lineOfPath) {
          return currentItem.lineOfPath;
        }
      }
    }
  }
}
