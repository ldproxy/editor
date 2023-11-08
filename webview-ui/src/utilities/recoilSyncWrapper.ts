import { atom } from "recoil";
import { syncEffect } from "recoil-sync";
import { string, object, array, number, bool } from "@recoiljs/refine";

export function atomSyncString(keyValue: string, defaultValue: string) {
  return atom({
    key: keyValue,
    default: defaultValue,
    effects: [syncEffect({ storeKey: "StoreA", refine: string() })],
  });
}

export function atomSyncObject(keyValue: string, defaultValue: object) {
  return atom({
    key: keyValue,
    default: defaultValue,
    effects: [syncEffect({ storeKey: "StoreA", refine: object({}) })],
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
