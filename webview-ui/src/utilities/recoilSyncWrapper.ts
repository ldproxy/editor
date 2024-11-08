import { atom } from "recoil";
import { syncEffect } from "recoil-sync";
import { string, array, number, bool, custom, asType } from "@recoiljs/refine";

export function atomSyncString(
  keyValue: string,
  defaultValue: string,
  storeKey: string = "StoreB"
) {
  console.log("store", storeKey);
  return atom({
    key: keyValue,
    default: defaultValue,
    effects: [syncEffect({ storeKey, refine: string() })],
  });
}

export function atomSyncObject<T extends object>(
  keyValue: string,
  defaultValue: T,
  storeKey: string = "StoreB"
) {
  return atom({
    key: keyValue,
    default: defaultValue,
    effects: [
      syncEffect({
        storeKey,
        refine: asType(
          custom((obj) => obj),
          (obj) => obj as T
        ),
      }),
    ],
  });
}

export function atomSyncNumber(
  keyValue: string,
  defaultValue: number,
  storeKey: string = "StoreB"
) {
  return atom({
    key: keyValue,
    default: defaultValue,
    effects: [syncEffect({ storeKey, refine: number() })],
  });
}

export function atomSyncStringArray(
  keyValue: string,
  defaultValue: any,
  storeKey: string = "StoreB"
) {
  return atom({
    key: keyValue,
    default: defaultValue,
    effects: [syncEffect({ storeKey, refine: array(string()) })],
  });
}

export function atomSyncBoolean(
  keyValue: string,
  defaultValue: boolean,
  storeKey: string = "StoreB"
) {
  return atom({
    key: keyValue,
    default: defaultValue,
    effects: [syncEffect({ storeKey, refine: bool() })],
  });
}
