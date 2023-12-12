import "./App.css";
import React, { useEffect } from "react";
import { VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { BasicData } from "./utilities/xtracfg";
import { useRecoilState, selector, useRecoilValue } from "recoil";
import Common, { idAtom, featureProviderTypeAtom } from "./Common";
import { atomSyncString } from "./utilities/recoilSyncWrapper";
import { vscode } from "./utilities/vscode";

export const currentlySelectedGPKGAtom = atomSyncString("currentlySelectedGPKG", "");

export const newGPKGAtom = atomSyncString("newGPKG", "");

export const existingGPKGAtom = atomSyncString("existingGPKG", "");

export const filenameAtom = atomSyncString("filename", "");

export const stateOfGpkgToUploadAtom = atomSyncString("stateOfGpkgToUpload", "");

export const base64StringAtom = atomSyncString("base64String", "");

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

function GeoPackage({ submitData, inProgress, error, existingGeopackages }: GeoPackageProps) {
  const gpkgData = useRecoilValue(gpkgDataSelector);

  const [currentlySelectedGPKG, setCurrentlySelectedGPKG] =
    useRecoilState<string>(currentlySelectedGPKGAtom);
  const [newGPKG, setNewGPKG] = useRecoilState<string>(newGPKGAtom);
  const [existingGPKG, setExistingGPKG] = useRecoilState<string>(existingGPKGAtom);
  const [filename, setFilename] = useRecoilState<string>(filenameAtom);
  const [stateOfGpkgToUpload, setStateOfGpkgToUpload] =
    useRecoilState<string>(stateOfGpkgToUploadAtom);
  const [base64String, setBase64String] = useRecoilState<string>(base64StringAtom);

  useEffect(() => {
    if (newGPKG !== "") {
      setCurrentlySelectedGPKG(newGPKG);
    }
    if (existingGPKG !== "") {
      setCurrentlySelectedGPKG(existingGPKG);
    }
  }, [existingGPKG, newGPKG]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("GP", file);
      setFilename(file.name);
      setNewGPKG(file.name);

      file.arrayBuffer().then((buffer: ArrayBuffer) => {
        const uint8Array = new Uint8Array(buffer);
        const charArray = Array.from(uint8Array).map((charCode) => String.fromCharCode(charCode));
        const base64String = btoa(charArray.join(""));
        setBase64String(base64String);
      });
    }
  };

  const submitGeoPackage = () => {
    if (existingGPKG === "") {
      if (filename !== "") {
        vscode.postMessage({
          command: "uploadGpkg",
          text: [base64String, filename],
        });
      }
    } else if (newGPKG === "") {
      submitData(gpkgData);
    }
  };

  window.addEventListener("message", (event) => {
    const message = event.data;

    switch (message.command) {
      case "uploadedGpkg":
        const uploadedGpkg = message.uploadedGpkg;
        setStateOfGpkgToUpload(uploadedGpkg);

        if (!uploadedGpkg.includes("Datei erfolgreich geschrieben:")) {
          vscode.postMessage({
            command: "error",
            text: uploadedGpkg,
          });
        } else {
          console.log(uploadedGpkg);
          if (gpkgData.database !== "") {
            submitData(gpkgData);
          }
        }
        break;
      default:
        console.log("Upload failed.");
    }
  });

  const handleReset = () => {
    setExistingGPKG("");
    setNewGPKG("");
    setFilename("");
    setStateOfGpkgToUpload("");
    setCurrentlySelectedGPKG("");
    setBase64String("");
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
          disabled={inProgress || !!newGPKG || base64String !== ""}>
          <option value="" hidden>
            Choose existing File...
          </option>
          {existingGeopackages.length > 0 &&
            existingGeopackages.map((option) => (
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
          {existingGPKG || newGPKG || filename !== "" ? (
            <VSCodeButton className="resetButton" disabled={inProgress} onClick={handleReset}>
              Reset
            </VSCodeButton>
          ) : null}
          <VSCodeButton
            className="submitButton"
            onClick={submitGeoPackage}
            disabled={
              inProgress ||
              stateOfGpkgToUpload.includes("Fehler beim Schreiben der Datei") ||
              (!existingGPKG && base64String === "")
            }>
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
