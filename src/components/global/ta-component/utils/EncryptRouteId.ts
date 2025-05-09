import { VObject } from '@/lib/vails';

export class EncryptRouteId {
  static encrypt(val: VObject | string) {
    let raw: string;
    if (typeof val === 'object') {
      raw = JSON.stringify(val);
    } else if (typeof val === 'number') {
      raw = String(val);
    } else {
      raw = val;
    }
    return btoa(raw);
  }

  static decrypt(encryptedStr: string): { id?: number; params?: VObject } {
    if (!encryptedStr) return {};
    if (!Number.isNaN(Number(encryptedStr))) return { id: Number(encryptedStr) };

    const decryptResult = atob(encryptedStr);
    let result: VObject;
    if (Number.isNaN(Number(decryptResult))) {
      try {
        result = { params: JSON.parse(decryptResult) };
      } catch (e) {
        result = {};
      }
    } else {
      result = { id: Number(decryptResult) };
    }
    return result;
  }
}
