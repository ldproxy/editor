import React, { useEffect, useState } from "react";
import { VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, selector, useRecoilValue } from "recoil";

import { BasicData } from "./utilities/xtracfg";
import Common, { idAtom, featureProviderTypeAtom } from "./Common";
import { atomSyncBoolean, atomSyncString } from "./utilities/recoilSyncWrapper";
import { vscode } from "./utilities/vscode";
import { DEV } from "./utilities/constants";
import { useRef } from "react";
import { set } from "@recoiljs/refine";

export const currentlySelectedGPKGAtom = atomSyncString("currentlySelectedGPKG", "");

export const newGPKGAtom = atomSyncString("newGPKG", "");

export const existingGPKGAtom = atomSyncString("existingGPKG", "");

export const filenameAtom = atomSyncString("filename", "");

export const stateOfGpkgToUploadAtom = atomSyncString("stateOfGpkgToUpload", "");

export const base64StringAtom = atomSyncString("base64String", "");

export const gpkgIsUploadingAtom = atomSyncBoolean("gpkgIsUploading", false);

export const gpkgIsSavingAtom = atomSyncBoolean("gpkgIsSaved", false);

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
  const hasSubmittedDataRef = useRef(false);
  const [gpkgIsUploading, setGpkgIsUploading] = useRecoilState<boolean>(gpkgIsUploadingAtom);
  const [gpkgIsSaving, setGpkgIsSaving] = useRecoilState<boolean>(gpkgIsSavingAtom);
  const [fileReader, setFileReader] = useState<FileReader | null>(null);

  useEffect(() => {
    if (newGPKG !== "") {
      setCurrentlySelectedGPKG(newGPKG);
    }
    if (existingGPKG !== "") {
      setCurrentlySelectedGPKG(existingGPKG);
    }
  }, [existingGPKG, newGPKG]);
  /*
  useEffect(() => {
    return () => {
      hasSubmittedDataRef.current = false;
    };
  }, []);
*/
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGpkgIsUploading(true);
    setBase64String("");
    if (DEV) {
      console.log("isUploading", gpkgIsUploading);
    }
    const file = e.target.files?.[0];
    if (file) {
      if (DEV) {
        console.log("GP", file);
      }
      setFilename(file.name);
      setNewGPKG(file.name);
      setFileReader(null);
      const reader = new FileReader();
      setFileReader(reader);
      reader.onloadend = () => {
        const uint8Array = new Uint8Array(reader.result as ArrayBuffer);
        const charArray = Array.from(uint8Array).map((charCode) => String.fromCharCode(charCode));
        const base64String = btoa(charArray.join(""));
        setBase64String(base64String);
        postUploadMessage(btoa(charArray.join("")), file.name);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const postUploadMessage = (base64String: string, filename: string) => {
    setGpkgIsUploading(false);

    if (existingGPKG === "" && gpkgIsUploading === false) {
      setGpkgIsSaving(true);
      if (DEV) {
        console.log("gpkgIsSaving", gpkgIsSaving);
        console.log("SubmitexistingGPKG", existingGPKG);
        console.log("currentlySelectedGPKG", currentlySelectedGPKG);
      }
      if (filename !== "") {
        if (DEV) {
          console.log("base64String", base64String);
          console.log("isUploading2", gpkgIsUploading);
          console.log("newGPKG", newGPKG);
          console.log("filename", filename);
        }
        vscode.postMessage({
          command: "uploadGpkg",
          text: [base64String, filename],
        });
      }
    }
  };

  // Is called only in case of uploaded GeoPackage
  window.addEventListener("message", (event) => {
    const message = event.data;

    switch (message.command) {
      case "uploadedGpkg":
        const uploadedGpkg = message.uploadedGpkg;
        setStateOfGpkgToUpload(uploadedGpkg);

        if (uploadedGpkg !== "" && !uploadedGpkg.includes("Datei erfolgreich geschrieben:")) {
          console.log("Datei nicht erfolgreich", uploadedGpkg);
          vscode.postMessage({
            command: "error",
            text: uploadedGpkg,
          });
          onCancelSaving();
        } else {
          if (DEV) {
            console.log("uploadedGpkg", uploadedGpkg);
          }
          handleUploaded();
        }
        break;
    }
  });

  const handleUploaded = () => {
    if (
      gpkgData.database !== "" &&
      gpkgData.database === filename /*&& !hasSubmittedDataRef.current*/
    ) {
      if (DEV) {
        console.log("How many times?");
      }
      setExistingGPKG(filename);
      setNewGPKG("");
      setFilename("");
      setStateOfGpkgToUpload("");
      setBase64String("");
      //  hasSubmittedDataRef.current = true;

      vscode.postMessage({
        command: "setExistingGpkg",
        text: "setExistingGpkg",
      });
      setGpkgIsSaving(false);
      if (DEV) {
        console.log("gpkgIsSaving2", gpkgIsSaving);
        console.log("existingGPKG", existingGPKG);
      }
    }
  };

  const submitGeoPackage = () => {
    if (newGPKG === "" /*&& existingGPKG !== ""*/) {
      if (DEV) {
        console.log("SubmitexistingGPKG2", existingGPKG);
        console.log("SubmitnewGPKG", newGPKG);
      }
      submitData(gpkgData);
    } else if (existingGPKG === "" && gpkgIsSaving === false) {
      const fileInput = document.getElementById("geoInput") as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = "";
      }

      submitData(gpkgData);
      setFileReader(null);
    }
  };

  const handleReset = () => {
    setExistingGPKG("");
    setFileReader(null);
    setNewGPKG("");
    setFilename("");
    setStateOfGpkgToUpload("");
    setCurrentlySelectedGPKG("");
    setBase64String("");
    hasSubmittedDataRef.current = false;
    const fileInput = document.getElementById("geoInput") as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onCancelUpload = () => {
    if (gpkgIsUploading && fileReader) {
      fileReader.abort();
      setGpkgIsUploading(false);

      setExistingGPKG("");
      setFileReader(null);
      setNewGPKG("");
      setFilename("");
      setStateOfGpkgToUpload("");
      setCurrentlySelectedGPKG("");
      setBase64String("");
      hasSubmittedDataRef.current = false;
      const fileInput = document.getElementById("geoInput") as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  const onCancelSaving = () => {
    vscode.postMessage({
      command: "cancelSavingGpkg",
    });

    setGpkgIsUploading(false);
    setFileReader(null);
    setExistingGPKG("");
    setNewGPKG("");
    setFilename("");
    setStateOfGpkgToUpload("");
    setCurrentlySelectedGPKG("");
    setBase64String("");
    setGpkgIsSaving(false);
    hasSubmittedDataRef.current = false;
    const fileInput = document.getElementById("geoInput") as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  if (DEV) {
    console.log("inProgressGPKG", inProgress);
  }

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
        {!existingGPKG && !inProgress && !gpkgIsUploading && !gpkgIsSaving ? (
          <label htmlFor="geoInput" className="vscode-button">
            Upload new File
          </label>
        ) : (
          <label htmlFor="geoInput" id="uploadLabelDisabled">
            Upload new File
          </label>
        )}
        <div>
          <input
            id={"geoInput"}
            type="file"
            onChange={(event) => onFileChange(event)}
            accept=".gpkg"
            multiple={false}
            disabled={inProgress || !!existingGPKG || gpkgIsUploading || gpkgIsSaving}
          />
          {gpkgIsUploading ? (
            <div className="progress-container">
              <VSCodeProgressRing className="progressRing" />
              <span id="progressText">Uploading {filename}...</span>
            </div>
          ) : gpkgIsSaving ? (
            <div className="progress-container">
              <VSCodeProgressRing className="progressRing" />
              <span id="progressText">Saving {filename}...</span>
            </div>
          ) : null}
        </div>
        <div className="submitAndReset">
          {gpkgIsUploading ? (
            <VSCodeButton className="resetButton" onClick={onCancelUpload}>
              Cancel
            </VSCodeButton>
          ) : gpkgIsSaving ? (
            <VSCodeButton className="resetButton" disabled={inProgress} onClick={onCancelSaving}>
              Cancel
            </VSCodeButton>
          ) : existingGPKG || newGPKG || filename !== "" ? (
            <VSCodeButton className="resetButton" disabled={inProgress} onClick={handleReset}>
              Reset
            </VSCodeButton>
          ) : null}
          <VSCodeButton
            className="submitButton"
            onClick={submitGeoPackage}
            disabled={
              inProgress ||
              stateOfGpkgToUpload === "Fehler beim Schreiben der Datei" ||
              (!existingGPKG && base64String === "")
            }>
            Next
          </VSCodeButton>
        </div>
      </div>
      {inProgress ? (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">Data is being processed...</span>
        </div>
      ) : null}
    </>
  );
}

export default GeoPackage;
