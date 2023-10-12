import "./App.css";
import React, { useState, useEffect } from "react";

function GeoPackage(selectedDataSource: any) {
  const [GPKG, setGPKG] = useState<File | null | Blob>(null);
  const [filename, setFilename] = useState<string>("");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGPKG(file);
      setFilename(file.name);
      console.log("GP", file);

      file.arrayBuffer().then((buffer: ArrayBuffer) => {
        const uint8Array = new Uint8Array(buffer);
        const charArray = Array.from(uint8Array).map((charCode) => String.fromCharCode(charCode));
        const base64String = btoa(charArray.join(""));
        console.log(base64String);
      });
    }
  };

  useEffect(() => {
    if (selectedDataSource !== "GeoPackage") {
      setGPKG(null);
      setFilename("");
    }
  }, [selectedDataSource]);

  console.log("filename", filename);

  return (
    <div className="button-container">
      <label htmlFor="geoInput" id="uploadLabel">
        Choose File
      </label>
      <input
        id="geoInput"
        type="file"
        onChange={(event) => onFileChange(event)}
        accept=".gpkg"
        multiple={false}
        style={{ display: "none" }}
      />
      {filename !== "" && <span id="GpkgName">{filename}</span>}
    </div>
  );
}

export default GeoPackage;
