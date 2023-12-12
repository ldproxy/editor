import { atom } from "recoil";
import { syncEffect } from "recoil-sync";
import { string, array, number, bool, custom, asType } from "@recoiljs/refine";

export function atomSyncString(keyValue: string, defaultValue: string) {
  return atom({
    key: keyValue,
    default: defaultValue,
    effects: [syncEffect({ storeKey: "StoreA", refine: string() })],
  });
}

export function atomSyncObject<T extends object>(keyValue: string, defaultValue: T) {
  return atom({
    key: keyValue,
    default: defaultValue,
    effects: [
      syncEffect({
        storeKey: "StoreA",
        refine: asType(
          custom((obj) => obj),
          (obj) => obj as T
        ),
      }),
    ],
  });
}

export function atomSyncNumber(keyValue: string, defaultValue: number) {
  return atom({
    key: keyValue,
    default: defaultValue,
    effects: [syncEffect({ storeKey: "StoreA", refine: number() })],
  });
}

export function atomSyncStringArray(keyValue: string, defaultValue: any) {
  return atom({
    key: keyValue,
    default: defaultValue,
    effects: [syncEffect({ storeKey: "StoreA", refine: array(string()) })],
  });
}

export function atomSyncBoolean(keyValue: string, defaultValue: boolean) {
  return atom({
    key: keyValue,
    default: defaultValue,
    effects: [syncEffect({ storeKey: "StoreA", refine: bool() })],
  });
}
