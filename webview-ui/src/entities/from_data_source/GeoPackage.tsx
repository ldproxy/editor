import React, { useEffect, useState } from "react";
import {
  VSCodeProgressRing,
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, selector, useRecoilValue } from "recoil";

import { BasicData } from "../../utilities/xtracfg";
import Common, { idAtom, featureProviderTypeAtom } from "../../components/Common";
import { atomSyncBoolean, atomSyncString } from "../../utilities/recoilSyncWrapper";
import { vscode } from "../../utilities/vscode";
import { DEV } from "../../utilities/constants";
import { useRef } from "react";
import TypeCheckboxes, { typeObjectAtom } from "../../components/TypeCheckboxes";

export const currentlySelectedGPKGAtom = atomSyncString("currentlySelectedGPKG", "", "StoreB");

export const newGPKGAtom = atomSyncString("newGPKG", "", "StoreB");

export const existingGPKGAtom = atomSyncString("existingGPKG", "", "StoreB");

export const filenameAtom = atomSyncString("filename", "", "StoreB");

export const stateOfGpkgToUploadAtom = atomSyncString("stateOfGpkgToUpload", "", "StoreB");

export const base64StringAtom = atomSyncString("base64String", "", "StoreB");

export const gpkgIsUploadingAtom = atomSyncBoolean("gpkgIsUploading", false, "StoreB");

export const gpkgIsSavingAtom = atomSyncBoolean("gpkgIsSaved", false, "StoreB");

export const gpkgDataSelector = selector({
  key: "gpkgDataSelector",
  get: ({ get }) => {
    const database = get(currentlySelectedGPKGAtom);
    const id = get(idAtom);
    const featureProviderType = get(featureProviderTypeAtom);
    const typeObject = get(typeObjectAtom);
    return {
      database,
      id,
      featureProviderType,
      typeObject,
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
  typeObject?: object;
};

const maxSize = 104857600;

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
  const [selectedGpkgInDropdown, setSelectedGpkgInDropdown] = useState(false);
  const [msg, setMsg] = useState<string>();

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
    setMsg(undefined);
    if (DEV) {
      console.log("isUploading", gpkgIsUploading);
    }
    const file = e.target.files?.[0];
    if (file) {
      if (DEV) {
        console.log("GP", file);
      }
      if (file.size > maxSize) {
        handleReset();
        setMsg(
          `File '${file.name}' is too large. Currently only files smaller than 100MB can be uploaded. You may copy the file directly into the store instead.`
        );
        return;
      }
      setGpkgIsUploading(true);
      setBase64String("");
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
      } else {
        onCancelSaving();
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
      vscode.postMessage({
        command: "geoPackageWasUploaded",
        text: "GPKG was saved in store...",
      });
      if (DEV) {
        console.log("gpkgIsSaving2", gpkgIsSaving);
        console.log("existingGPKG", existingGPKG);
      }
    } else {
      onCancelSaving();
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
    setSelectedGpkgInDropdown(false);
    setFileReader(null);
    setNewGPKG("");
    setFilename("");
    setStateOfGpkgToUpload("");
    setCurrentlySelectedGPKG("");
    setBase64String("");
    setMsg(undefined);
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      const deletedGpkg = event.data.deletedGpkg;
      let deletedGpkgName;
      if (deletedGpkg !== undefined) {
        deletedGpkgName = deletedGpkg.split("\\").pop();
      }
      switch (message.command) {
        case "selectedGeoPackageDeleted":
          if (existingGPKG !== "" && deletedGpkgName === existingGPKG) {
            handleReset();
          }
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [existingGPKG]);

  const onFileSelect = (gpkgName: string) => {
    setExistingGPKG(gpkgName);
    setMsg(undefined);
  };

  if (DEV) {
    console.log("inProgressGPKG", inProgress);
    console.log("existingGPKG", existingGPKG);
    console.log("existingGeopackages", existingGeopackages);
  }

  // necessary for empty dropdown after initialisation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setExistingGPKG("Initialising...");
      setExistingGPKG("");
    }, 1);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <label style={{ display: "block" }} className="vscode-text">
        Choose existing File
      </label>
      <div className="dropdown">
        <VSCodeDropdown
          disabled={inProgress || !!newGPKG || base64String !== ""}
          value={existingGPKG}
          onChange={(e) => {
            onFileSelect((e.target as HTMLInputElement).value);
            setSelectedGpkgInDropdown(true);
          }}>
          {existingGeopackages.length > 0 &&
            existingGeopackages.map((option) => (
              <VSCodeOption key={option} value={option}>
                {option}
              </VSCodeOption>
            ))}
        </VSCodeDropdown>
      </div>
      <div className="button-container">
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
            onChange={onFileChange}
            accept=".gpkg"
            multiple={false}
            disabled={inProgress || !!existingGPKG || gpkgIsUploading || gpkgIsSaving}
          />
        </div>
      </div>
      <div style={{ marginBottom: "-10px", marginTop: "10px", width: "100%" }}>
        <TypeCheckboxes mode="fromData" />
      </div>
      {msg && <div style={{ textAlign: "left" }}>{msg}</div>}
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
      <div className="button-container">
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
