import Axios, { AxiosInstance } from 'axios';
import qs from 'qs';
import { VRequestConfig } from './index';

export default (): AxiosInstance => {
  const apiUrl = process.env.VUE_APP_API_DOMAIN || 'http://127.0.0.1:3000';
  const rootPath = process.env.VUE_APP_API_ROOT_PATH || '/';

  const request = Axios.create({
    baseURL: apiUrl + rootPath,
    headers: {
      Accept: 'application/json',
    },
    paramsSerializer(params) {
      return qs.stringify(params, {
        encode: true,
        arrayFormat: 'brackets',
        skipNulls: true,
      });
    },
  });

  request.prototype.run = (config: VRequestConfig) => {
    return request(config);
  };

  return request;
};
