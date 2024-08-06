import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { vscode } from "../utilities/vscode";
import { BasicData, Response, Error, xtracfg } from "../utilities/xtracfg";
import { DEV } from "../utilities/constants";

import {
  atomSyncString,
  atomSyncObject,
  atomSyncStringArray,
} from "../utilities/recoilSyncWrapper";

import "./App.css";

type FieldErrors = {
  [key: string]: string;
};

export const dataProcessingAtom = atomSyncString("dataProcessing", "");

export const existingGeopackageAtom = atomSyncStringArray("existingGeopackage", [""]);

export const workspaceAtom = atomSyncString("workspace", "");

export const errorAtom = atomSyncObject<FieldErrors>("error", {});

export const generateProgressAtom = atomSyncString("generateProgress", "");

function App() {
  const [existingGeopackages, setExistingGeopackages] =
    useRecoilState<string[]>(existingGeopackageAtom);
  const [dataProcessing, setDataProcessing] = useRecoilState<string>(dataProcessingAtom);
  const [workspace, setWorkspace] = useRecoilState(workspaceAtom);
  const [generateProgress, setGenerateProgress] = useRecoilState<string>(generateProgressAtom);

  const [error, setError] = useRecoilState<FieldErrors>(errorAtom);

  return (
    <>
      {dataProcessing === "" || dataProcessing === "inProgress" ? (
        <main>Huuuuuhuuuuuuu</main>
      ) : (
        "An Error Occurred"
      )}
    </>
  );
}

export default App;
