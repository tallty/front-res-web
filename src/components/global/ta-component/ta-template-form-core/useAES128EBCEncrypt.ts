import * as crypto from 'crypto-js';

export const useAES128EBCEncrypt = () => {
  const buf2hex = (buffer) => {
    // buffer is an ArrayBuffer
    return Array.prototype.map
      .call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2))
      .join('');
  };

  const convertUint8ArrayToBinaryString = (u8Array) => {
    const len = u8Array.length;
    let b_str = '';
    for (let i = 0; i < len; i++) {
      b_str += String.fromCharCode(u8Array[i]);
    }
    return b_str;
  };

  const convertBinaryStringToUint8Array = (bStr) => {
    const len = bStr.length;
    const u8_array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      u8_array[i] = bStr.charCodeAt(i);
    }
    return u8_array;
  };

  const CryptJsWordArrayToUint8Array = (wordArray): Uint8Array => {
    const l = wordArray.sigBytes;
    const words = wordArray.words;
    const result = new Uint8Array(l);
    let i = 0 /*dst*/,
      j = 0; /*src*/
    while (true) {
      // here i is a multiple of 4
      if (i == l) break;
      const w = words[j++];
      result[i++] = (w & 0xff000000) >>> 24;
      if (i == l) break;
      result[i++] = (w & 0x00ff0000) >>> 16;
      if (i == l) break;
      result[i++] = (w & 0x0000ff00) >>> 8;
      if (i == l) break;
      result[i++] = w & 0x000000ff;
    }
    return result;
  };

  // algorithm = 'aes-128-ecb'
  const decryptBuffer = (
    buffer: ArrayBuffer,
    keyStringOrBuffer: string | Uint8Array,
    algorithm = 'aes-128-ecb'
  ) => {
    let key = null;
    if (typeof keyStringOrBuffer === 'string') {
      key = crypto.enc.Utf8.parse(keyStringOrBuffer);
    } else {
      key = crypto.enc.Hex.parse(buf2hex(keyStringOrBuffer));
    }

    let decrypted: any = null;
    if (algorithm === 'des') {
      decrypted = crypto.TripleDES.decrypt(
        { ciphertext: crypto.enc.Hex.parse(buf2hex(buffer)) },
        key,
        { mode: crypto.mode.ECB, padding: crypto.pad.ZeroPadding }
      );
    } else {
      decrypted = crypto.AES.decrypt(
        { ciphertext: crypto.enc.Hex.parse(buf2hex(buffer)) },
        key,
        { mode: crypto.mode.ECB, padding: crypto.pad.ZeroPadding }
      );
    }
    return CryptJsWordArrayToUint8Array(decrypted);
  };

  const encryptToBuffer = (
    contentStringOrBuffer: string | Uint8Array,
    keyStringOrBuffer: string | Uint8Array,
    algorithm = 'aes-128-ecb'
  ) => {
    let content = null;
    let key = null;

    if (typeof contentStringOrBuffer === 'string') {
      content = crypto.enc.Utf8.parse(contentStringOrBuffer);
    } else {
      content = crypto.enc.Hex.parse(buf2hex(contentStringOrBuffer));
    }

    if (typeof keyStringOrBuffer === 'string') {
      key = crypto.enc.Utf8.parse(keyStringOrBuffer);
    } else {
      key = crypto.enc.Hex.parse(buf2hex(keyStringOrBuffer));
    }

    let encrypted: any = null;
    // console.log(algorithm, 'algorithm ===');

    if (algorithm === 'des') {
      encrypted = crypto.TripleDES.encrypt(content, key, {
        mode: crypto.mode.ECB,
        padding: crypto.pad.ZeroPadding,
      });
    } else {
      encrypted = crypto.AES.encrypt(content, key, {
        mode: crypto.mode.ECB,
        padding: crypto.pad.ZeroPadding,
      });
    }
    return CryptJsWordArrayToUint8Array(encrypted.ciphertext);
  };

  const numToUint8Array = (num, length = 8) => {
    const arr = new Uint8Array(length);

    for (let i = 1; i <= length; i++) {
      arr[length - i] = num % 256;
      num = Math.floor(num / 256);
    }

    return arr;
  };

  // const intHexFill = (r, t) => {
  //   let n = '';
  //   for (let o = 2 * t, e = o - r.toString(16).length, a = 0; a < o; a++) {
  //     if (a == e) {
  //       n = ''.concat(n).concat(r.toString(16));
  //       break;
  //     }
  //     n = ''.concat(n, '0');
  //   }
  //   return n;
  // };

  // const numToUint8Array = (num, length = 8) => {
  //   const str = intHexFill(num, length);
  //   const buffer = new Uint8Array(length);

  //   const arr: number[] = [];

  //   for (let i = 0; i < length; i++) {
  //     const s = str.slice(i * 2, i * 2 + 2);
  //     const v = parseInt(s, 16);
  //     arr.push(v);
  //   }
  //   // const arr: number[] = [];
  //   // let cache = num;
  //   // while (cache > 256) {
  //   //   arr.push(cache % 256);
  //   //   cache = Math.floor(cache / 256);
  //   // }

  //   // arr.push(cache);

  //   // buffer.set(arr.slice(Math.max(arr.length - 1 - length, 0), length));
  //   buffer.set(arr, 0);
  //   return buffer;
  // };

  // const numToUint8Array = (num, length = 8) => {
  //   const arr = new Uint8Array(length);
  //   let value = BigInt(num);
  //   for (let i = 1; i < length; i++) {
  //     arr[length - i] = Number(value % BigInt(256));
  //     value = BigInt((value / BigInt(256)).toString());
  //   }

  //   return arr;
  // };

  const uint8ArrayToNum = (arr: Uint8Array) => {
    return arr.reduce((out, item, index) => {
      out += item * Math.pow(256, arr.length - index - 1);
      return out;
    }, 0);
  };

  const uint8ArrayToNumString = (arr: Uint8Array) => {
    return arr
      .join(':')
      .split(':')
      .map((i) => Number(i).toString(16))
      .join(':');
  };

  const numStringToUint8Array = (str: string) => {
    return new Uint8Array(str.split(':').map((s: string) => parseInt(s, 16)));
  };

  return {
    buf2hex,
    CryptJsWordArrayToUint8Array,
    decryptBuffer,
    encryptToBuffer,
    convertUint8ArrayToBinaryString,
    convertBinaryStringToUint8Array,
    numToUint8Array,
    uint8ArrayToNum,
    uint8ArrayToNumString,
    numStringToUint8Array,
  };
};
