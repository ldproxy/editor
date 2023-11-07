import React from "react";
import { RecoilSync } from "recoil-sync";
import { remoteStorage } from "./storage";

export const RecoilSyncApp: React.FC = ({ children }) => {
  const connection = remoteStorage;

  // Diese Funktion wird aufgerufen, wenn ein Subscriber (eine Komponente) aktualisiert werden muss.
  const handleUpdateItem = (key: string, value: any) => {
    const updatedData = { ...connection.get(), [key]: value };
    connection.set(updatedData);
  };

  return (
    <RecoilSync
      storeKey="my-db"
      read={() => {
        connection.get();
        console.log("Read data:", connection.get());
      }}
      write={({ diff }) => {
        console.log("Write diff:", diff);

        for (const [key, value] of diff) {
          connection.set({ ...connection.get(), [key]: value });
        }
      }}
      listen={({ updateItem }) => {
        // Diese Funktion wird aufgerufen, wenn Ihr Backend ein Update sendet.
        // Sie sollten hier handleUpdateItem verwenden, um den Zustand in remoteStorage zu aktualisieren.
        const subscription = connection.subscribe((data: Record<string, any>) => {
          console.log("Received data from subscription:", data);

          for (const key in data) {
            console.log("Updating item with key:", key, "and value:", data[key]);
            updateItem(key, data[key]);
          }
        });
        return () => subscription();
      }}>
      {children}
    </RecoilSync>
  );
};
