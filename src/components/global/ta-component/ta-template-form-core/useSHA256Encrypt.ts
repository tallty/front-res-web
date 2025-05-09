import * as crypto from 'crypto-js';

export const useSHA256Encrypt = () => {
  const encrypt = (text: string, iv: any) => {
    const key = crypto.SHA256(process.env.VUE_APP_ENCRYPT_PASSWORD || 'tallty.com');
    const encrypted = crypto.AES.encrypt(text, key, { iv });
    return encrypted.toString();
  };

  const encryptText = (text: string) => {
    const iv = crypto.lib.WordArray.random(16);
    const ivBase64 = crypto.enc.Base64.stringify(iv);
    const encryptedText = encrypt(text, iv);

    return {
      ivBase64,
      encryptedText,
    };
  };

  const decryptText = (encryptedText: string, ivBase64: string) => {
    if (!encryptedText || !ivBase64) {
      return '';
    }
    const key = crypto.SHA256(process.env.VUE_APP_ENCRYPT_PASSWORD || 'tallty.com');
    // 解密
    const iv = crypto.enc.Base64.parse(ivBase64);

    const decrypted = crypto.AES.decrypt(
      { ciphertext: crypto.enc.Base64.parse(encryptedText) } as any,
      key,
      { iv: iv },
    );

    return crypto.enc.Utf8.stringify(decrypted);
  };

  return {
    encrypt,
    encryptText,
    decryptText,
  };
};
