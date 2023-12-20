interface SpecifiedDef {
  ref: string;
  finalPath: string;
  // Weitere Eigenschaften
}

export function removeDuplicates(specifiedDefs: SpecifiedDef[]): SpecifiedDef[] {
  const uniqueSet = new Set<string>();

  const filteredDefs = specifiedDefs.filter((def) => {
    const key = `${def.ref}-${def.finalPath}`;
    if (uniqueSet.has(key)) {
      return false;
    }
    uniqueSet.add(key);
    return true;
  });

  return filteredDefs;
}
