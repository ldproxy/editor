import "./App.css";
import React, { useEffect } from "react";
import { VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { BasicData } from "./utilities/xtracfg";
import { atom, useRecoilState } from "recoil";

export const newGPKGAtom = atom({
  key: "newGPKG",
});

export const existingGPKGAtom = atom({
  key: "existingGPKG",
  default: "",
});

export const filenameAtom = atom({
  key: "filename",
  default: "",
});

export const gpkgDataAtom = atom({
  key: "gpkgData",
  default: {},
});

export const existingGeopackageAtom = atom({
  key: "existingGeopackage",
  default: [""],
});

export type GpkgData = BasicData & {};

type GeoPackageProps = {
  submitData: (data: Object) => void;
  selectedDataSource: any;
  inProgress: boolean;
  existingGeopackages: string[];
};

function GeoPackage(props: GeoPackageProps) {
  const [gpkgData, setGpkgData] = useRecoilState<GpkgData>(gpkgDataAtom);
  const [newGPKG, setNewGPKG] = useRecoilState<any>(newGPKGAtom);
  const [existingGPKG, setExistingGPKG] = useRecoilState<string>(existingGPKGAtom);
  const [filename, setFilename] = useRecoilState<string>(filenameAtom);

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
        //   props.handleUpdateData(file.name, base64String);
      });
    }
  };

  useEffect(() => {
    if (props.selectedDataSource !== "GPKG") {
      setNewGPKG("");
      setExistingGPKG("");
      setFilename("");
    }
  }, [props.selectedDataSource]);

  const handleReset = () => {
    setExistingGPKG("");
    setNewGPKG("");
    setFilename("");
    const fileInput = document.getElementById("geoInput") as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
    setGpkgData({});
  };

  return (
    <>
      <div className="button-container">
        {/* TODO: use VSCodeDropdown */}
        <select
          className="dropdown"
          placeholder="Choose existing File..."
          value={existingGPKG}
          onChange={(event) => {
            setExistingGPKG(event.target.value);
            //  props.handleUpdateData("Geopackage", event.target.value);
          }}
          disabled={props.inProgress || !!newGPKG}>
          <option value="" hidden>
            Choose existing File...
          </option>
          {props.existingGeopackages.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span>or</span>
        {!existingGPKG && !props.inProgress ? (
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
          disabled={props.inProgress || !!existingGPKG}
        />
        {filename !== "" && <span id="GpkgName">{filename}</span>}
        <div className="submitAndReset">
          <VSCodeButton
            className="submitButton"
            onClick={() => props.submitData(gpkgData)}
            disabled={props.inProgress}>
            Next
          </VSCodeButton>
          {existingGPKG || newGPKG ? (
            <VSCodeButton className="resetButton" onClick={handleReset}>
              Reset
            </VSCodeButton>
          ) : null}
        </div>
      </div>
      {props.inProgress && (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">Data is being processed...</span>
        </div>
      )}
    </>
  );
}

export default GeoPackage;
