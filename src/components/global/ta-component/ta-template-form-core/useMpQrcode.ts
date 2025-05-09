import { compressEncode } from './useCompress';

import axios from 'axios';

export const getMpQrcode = (
  path: string,
  scene: string,
  width = 350,
  wechatAppId = process.env.VUE_APP_WECHAT_APP_ID,
  isHyaline = 0,
) => {
  return `${
    process.env.VUE_APP_API_DOMAIN
  }/weixin/${wechatAppId}/api/wxa_get_wxacode_unlimit?width=${width}&is_hyaline=${!!isHyaline}&page=${encodeURIComponent(
    path,
  )}${scene ? `&scene=${encodeURIComponent(scene)}` : ''}`;
  // )}&uuid=${encodeURIComponent(compressEncode(scene))}`;
};

export const getMpQrcodeUrlPost = async (
  path: string,
  scene: string,
  width = 350,
  wechatAppId = process.env.VUE_APP_WECHAT_APP_ID,
  isHyaline = false,
) => {
  console.log('axios post');
  const res = await axios.post(
    `${process.env.VUE_APP_API_DOMAIN}/weixin/${wechatAppId}/api/wxa_get_wxacode_unlimit`,
    {
      width,
      is_hyaline: !!isHyaline,
      page: path,
      ...(scene ? { scene } : {}),
    },
    {
      headers: {
        'response-type': 'arraybuffer',
      },
    },
  );

  // const imgUrl =
  //   'data:image/png;base64,' +
  //   btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
  // console.log(imgUrl);
  // 这里如果不清楚 new Uint8Array(data.data) 中data的指代，就看看最上面的那个图

  // const blob = new Blob([res.data], { type: 'image/jpg' });

  // const baseString = await new Promise((resolve, reject) => {
  //   const reader = new FileReader();
  //   reader.onloadend = () => resolve(reader.result as string);
  //   reader.onerror = error => reject(error);
  //   reader.readAsDataURL(blob); // 将 Blob 读取为 Base64
  // });
  // return baseString;
};
