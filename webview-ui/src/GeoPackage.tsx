import React, { useEffect, useState } from "react";
import { VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, selector, useRecoilValue } from "recoil";

import { BasicData } from "./utilities/xtracfg";
import Common, { idAtom, featureProviderTypeAtom } from "./Common";
import {
  atomSyncBoolean,
  atomSyncNumber,
  atomSyncString,
  atomSyncStringArray,
} from "./utilities/recoilSyncWrapper";
import { vscode } from "./utilities/vscode";
import { DEV, DEVGPKG } from "./utilities/constants";
import { useRef } from "react";
import { set } from "@recoiljs/refine";

export const currentlySelectedGPKGAtom = atomSyncString("currentlySelectedGPKG", "");

export const newGPKGAtom = atomSyncString("newGPKG", "");

export const existingGPKGAtom = atomSyncString("existingGPKG", "");

export const filenameAtom = atomSyncString("filename", "");

export const stateOfGpkgToUploadAtom = atomSyncString("stateOfGpkgToUpload", "");

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

export const filesizeAtom = atomSyncNumber("filesize", 0);

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
  const hasSubmittedDataRef = useRef(false);
  const [gpkgIsUploading, setGpkgIsUploading] = useRecoilState<boolean>(gpkgIsUploadingAtom);
  const [fileReader, setFileReader] = useState<FileReader | null>(null);
  const [filesize, setFilesize] = useRecoilState<number>(filesizeAtom);
  const data = React.useRef(new Uint8Array());
  const firstChunk = React.useRef(true);
  const currentDataSize = React.useRef(0);
  const overallDataSize = React.useRef(0);
  const waitForCurrentWrite = React.useRef(Promise.resolve());
  const waitForCurrentWriteResolver = React.useRef(() => {});

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

  const writableStream = (fileName: string, fileSize: number) =>
    new WritableStream({
      write(chunk) {
        /*if (overallDataSize.current > 0) {
          firstChunk.current = false;
        } else {
          firstChunk.current = true;
        }*/

        // Convert the chunk to a Uint8Array and append it to the data
        const uint8Array = new Uint8Array(chunk);
        const tempData = new Uint8Array(data.current.length + uint8Array.length);
        tempData.set(data.current);
        tempData.set(uint8Array, data.current.length);
        if (DEVGPKG) {
          console.log(
            "chunk",
            chunk,
            data.current.length,
            fileSize,
            uint8Array.length,
            overallDataSize.current
          );
        }

        data.current = tempData;
        const charArray = Array.from(data.current).map((charCode) => String.fromCharCode(charCode));
        currentDataSize.current = data.current.length;
        overallDataSize.current += uint8Array.length;

        if (DEVGPKG) {
          console.log("Größen", currentDataSize.current, overallDataSize.current, fileSize);
        }

        if (currentDataSize.current > 1000000) {
          const action = firstChunk.current ? "create" : "append";
          firstChunk.current = false;
          if (DEVGPKG) {
            console.log(action, btoa(charArray.join("")));
          }
          postUploadMessage(btoa(charArray.join("")), fileName, action);
          data.current = new Uint8Array();
          currentDataSize.current = 0;
          return waitForCurrentWrite.current;
        }

        return Promise.resolve();
      },
      close() {
        if (currentDataSize.current > 0) {
          const action = firstChunk.current ? "create" : "append";
          const charArray = Array.from(data.current).map((charCode) =>
            String.fromCharCode(charCode)
          );
          postUploadMessage(btoa(charArray.join("")), fileName, action);
          if (DEVGPKG) {
            console.log("close", btoa(charArray.join("")));
          }
        }
        currentDataSize.current = 0;
        if (DEVGPKG) {
          console.log("close2");
        }
      },
      abort(e) {
        data.current = new Uint8Array();
        firstChunk.current = true;
        currentDataSize.current = 0;
        overallDataSize.current = 0;
        setFilesize(0);
        onCancelUpload();
        if (DEVGPKG) {
          console.log("Aborted", e);
        }
      },
      // base64String brauchen wir nicht mehr.
      // In write schonmal immer nach einem Chunk data an das Backend schicken.
      // Zusätzlich variable im write für aktuelle Größe. Und noch eine mit Gesamtfortschritt.
      // Wenn bestimme Data Größe erreicht ist, data hier leeren.
      // In Close dann message an den User, dass GPKG hochgeladen wurde.
      // Im close dann nochmal prüfen, ob Zwischengröße === 0 ist. Wenn nicht dann nochmal postUploadMessage.
    });

  let fileStream;
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("onFileChange");
    setGpkgIsUploading(true);

    const file = e.target.files?.[0];
    if (file) {
      if (DEVGPKG) {
        console.log("GP", file);
      }
      setFilename(file.name);
      setNewGPKG(file.name);
      setFilesize(file.size);

      // Pipe the file stream to the writable stream
      fileStream = file.stream(); // Hier sollte sich Cancel aufrufen lassen. Oder nur im writeableStream?
      fileStream.pipeTo(writableStream(file.name, file.size)).catch((error) => {
        console.error("Error reading file:", error);
      });
    }
  };

  const postUploadMessage = (base64String: string, filename: string, action?: string) => {
    if (existingGPKG === "") {
      if (DEVGPKG) {
        console.log("SubmitexistingGPKG", existingGPKG);
        console.log("currentlySelectedGPKG", currentlySelectedGPKG);
      }
      if (filename !== "") {
        if (DEVGPKG) {
          console.log("base64String", base64String);
          console.log("isUploading2", gpkgIsUploading);
          console.log("newGPKG", newGPKG);
          console.log("filename", filename);
          console.log("action?", action);
        }
        waitForCurrentWrite.current = new Promise(
          (resolve, reject) => (waitForCurrentWriteResolver.current = resolve)
        );

        vscode.postMessage({
          command: "uploadGpkg",
          text: [base64String, filename, action],
        });
      } else {
        console.log("aborting instead of saving");
        onCancelUpload();
      }
    }
  };

  // Is called only in case of uploaded GeoPackage
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (DEVGPKG) {
      console.log("overallDataSizeListener", overallDataSize.current, event.data);
      console.log("fileSizeListener", filesize);
    }

    switch (message.command) {
      case "uploadedGpkg":
        const uploadedGpkg = message.uploadedGpkg;
        setStateOfGpkgToUpload(uploadedGpkg);

        if (
          uploadedGpkg !== "" &&
          !uploadedGpkg.includes("Datei erfolgreich geschrieben:") &&
          !uploadedGpkg.includes("Datei erfolgreich erweitert:")
        ) {
          if (DEVGPKG) {
            console.log("Datei nicht erfolgreich", uploadedGpkg);
          }
          vscode.postMessage({
            command: "error",
            text: uploadedGpkg,
          });
          onCancelUpload();
        } else {
          if (DEVGPKG) {
            console.log("uploadedGpkg", uploadedGpkg); // Warum wird das unenldich gelogged obwohl es tatsächlich wie gewollt nur 3 Nachrichten vom Backend gibt?
          }
          waitForCurrentWriteResolver.current();
          if (overallDataSize.current === filesize) {
            handleUploaded();
          }
        }
        break;
    }
  });

  const handleUploaded = () => {
    console.log("gpkgData.database", gpkgData.database);
    console.log("filenamehandleUploaded", filename);

    if (
      gpkgData.database !== "" &&
      gpkgData.database === filename /*&& !hasSubmittedDataRef.current*/
    ) {
      if (DEVGPKG) {
        console.log("How many times?");
      }
      setExistingGPKG(filename);
      setNewGPKG("");
      setFilename("");
      setStateOfGpkgToUpload("");
      data.current = new Uint8Array();
      firstChunk.current = true;
      currentDataSize.current = 0;
      overallDataSize.current = 0;
      setFilesize(0);
      //  hasSubmittedDataRef.current = true;

      /*vscode.postMessage({
        command: "setExistingGpkg",
        text: "setExistingGpkg",
      });*/
      vscode.postMessage({
        command: "geoPackageWasUploaded",
        text: "GPKG was saved in store...",
      });
      if (DEVGPKG) {
        console.log("existingGPKG", existingGPKG);
      }
    } else {
      console.log("canceling instead of saving"); // passiert. CurrentlySelectedGpkg geht verloren irgendwann beim appenden. Liegt aber an keiner der Cancel Funktionen. Liegt an existing oder newGpkg und dem Useeffect.
      onCancelUpload();
      data.current = new Uint8Array();
      firstChunk.current = true;
      currentDataSize.current = 0;
      overallDataSize.current = 0;
      setFilesize(0);
    }
  };

  const handleReset = () => {
    console.log("handleReset");
    setExistingGPKG("");
    setFileReader(null);
    setNewGPKG("");
    setFilename("");
    setStateOfGpkgToUpload("");
    setCurrentlySelectedGPKG("");
    hasSubmittedDataRef.current = false;
    const fileInput = document.getElementById("geoInput") as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onCancelUpload = () => {
    console.log("onCancelUpload");

    if (fileReader) {
      fileReader.abort();
    }
    vscode.postMessage({
      command: "cancelSavingGpkg",
    });

    setGpkgIsUploading(false);
    setExistingGPKG("");
    setFileReader(null);
    setNewGPKG("");
    setFilename("");
    setStateOfGpkgToUpload("");
    setCurrentlySelectedGPKG("");
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

      switch (message.command) {
        case "selectedGeoPackageDeleted":
          const deletedGpkgName = deletedGpkg.split("\\").pop();
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

  if (DEVGPKG) {
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
          disabled={inProgress || !!newGPKG}>
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
        {!existingGPKG && !inProgress && !gpkgIsUploading ? (
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
            disabled={inProgress || !!existingGPKG || gpkgIsUploading}
          />
          {gpkgIsUploading ? (
            <div className="progress-container">
              <VSCodeProgressRing className="progressRing" />
              <span id="progressText">Uploading {filename}...</span>
            </div>
          ) : null}
        </div>
        <div className="submitAndReset">
          {gpkgIsUploading ? (
            <VSCodeButton className="resetButton" onClick={onCancelUpload}>
              Cancel
            </VSCodeButton>
          ) : existingGPKG || newGPKG || filename !== "" ? (
            <VSCodeButton className="resetButton" disabled={inProgress} onClick={handleReset}>
              Reset
            </VSCodeButton>
          ) : null}
          <VSCodeButton
            className="submitButton"
            onClick={submitData}
            disabled={
              inProgress ||
              stateOfGpkgToUpload === "Fehler beim Schreiben der Datei" ||
              !existingGPKG
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
