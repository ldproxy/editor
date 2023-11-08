import "./App.css";
import React, { useEffect } from "react";
import { VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { BasicData } from "./utilities/xtracfg";
import { atom, useRecoilState, selector, useRecoilValue } from "recoil";
import Common, { idAtom, featureProviderTypeAtom } from "./Common";
import { atomSyncObject, atomSyncString } from "./utilities/recoilSyncWrapper";

export const currentlySelectedGPKGAtom = atomSyncString("currentlySelectedGPKG", "");

export const newGPKGAtom = atomSyncString("newGPKG", "");

export const existingGPKGAtom = atomSyncString("existingGPKG", "");

export const filenameAtom = atomSyncString("filename", "");

export const gpkgDataAtom = atomSyncObject("gpkgData", {});

export const gpkgDataSelector = selector({
  key: "gpkgDataSelector",
  get: ({ get }) => {
    const database = get(currentlySelectedGPKGAtom);
    const id = get(idAtom);
    const featureProviderType = get(featureProviderTypeAtom);
    return {
      database,
      id,
      featureProviderType,
    };
  },
});

export type GpkgData = BasicData & {
  database?: string;
  id?: string;
  featureProviderType?: string;
};

// export type GpkgData = BasicData & {};

type GeoPackageProps = {
  submitData: (data: Object) => void;
  selectedDataSource: any;
  inProgress: boolean;
  existingGeopackages: string[];
  error: {
    id?: string;
    host?: string;
    database?: string;
    user?: string;
    password?: string;
  };
};

function GeoPackage({
  submitData,
  selectedDataSource,
  inProgress,
  error,
  existingGeopackages,
}: GeoPackageProps) {
  const gpkgData = useRecoilValue(gpkgDataSelector);

  const [currentlySelectedGPKG, setCurrentlySelectedGPKG] =
    useRecoilState<string>(currentlySelectedGPKGAtom);
  const [newGPKG, setNewGPKG] = useRecoilState<string>(newGPKGAtom);
  const [existingGPKG, setExistingGPKG] = useRecoilState<string>(existingGPKGAtom);
  const [filename, setFilename] = useRecoilState<string>(filenameAtom);

  useEffect(() => {
    if (newGPKG !== "") {
      setCurrentlySelectedGPKG(newGPKG);
    } else if (existingGPKG !== "") {
      setCurrentlySelectedGPKG(existingGPKG);
    }
  }, [newGPKG, existingGPKG]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewGPKG(file.name);
      setFilename(file.name);
      console.log("GP", file);

      file.arrayBuffer().then((buffer: ArrayBuffer) => {
        const uint8Array = new Uint8Array(buffer);
        const charArray = Array.from(uint8Array).map((charCode) => String.fromCharCode(charCode));
        const base64String = btoa(charArray.join(""));
      });
    }
  };

  useEffect(() => {
    if (selectedDataSource !== "GPKG") {
      setNewGPKG("");
      setExistingGPKG("");
      setFilename("");
      setCurrentlySelectedGPKG("");
    }
  }, [selectedDataSource]);

  const handleReset = () => {
    setExistingGPKG("");
    setNewGPKG("");
    setFilename("");
    setCurrentlySelectedGPKG("");
    const fileInput = document.getElementById("geoInput") as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <>
      <Common error={error} disabled={inProgress} />
      <div className="button-container">
        {/* TODO: use VSCodeDropdown */}
        <select
          className="dropdown"
          placeholder="Choose existing File..."
          value={existingGPKG}
          onChange={(event) => {
            setExistingGPKG(event.target.value);
          }}
          disabled={inProgress || !!newGPKG}>
          <option value="" hidden>
            Choose existing File...
          </option>
          {existingGeopackages.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span>or</span>
        {!existingGPKG && !inProgress ? (
          <label htmlFor="geoInput" className="vscode-button">
            Upload new File
          </label>
        ) : (
          <label htmlFor="geoInput" id="uploadLabelDisabled">
            Upload new File
          </label>
        )}
        <input
          id={"geoInput"}
          type="file"
          onChange={(event) => onFileChange(event)}
          accept=".gpkg"
          multiple={false}
          disabled={inProgress || !!existingGPKG}
        />
        {filename !== "" && <span id="GpkgName">{filename}</span>}
        <div className="submitAndReset">
          {existingGPKG || newGPKG ? (
            <VSCodeButton className="resetButton" disabled={inProgress} onClick={handleReset}>
              Reset
            </VSCodeButton>
          ) : null}
          <VSCodeButton
            className="submitButton"
            onClick={() => submitData(gpkgData)}
            disabled={inProgress}>
            Next
          </VSCodeButton>
        </div>
      </div>
      {inProgress && (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">Data is being processed...</span>
        </div>
      )}
    </>
  );
}

export default GeoPackage;
