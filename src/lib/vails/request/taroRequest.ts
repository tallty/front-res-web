import Taro from '@tarojs/taro';
import { merge } from 'lodash-es';
import { VObject } from '../model/index';
import { VRequestConfig } from './index';
import requestError from './requestError';

import { useSHA256Encrypt } from '@/components/global/ta-mobile-component/ta-template-form-core/useSHA256Encrypt';

const { encryptText, decryptText } = useSHA256Encrypt();

export default class TaroRequest {
  constructor(
    config: VRequestConfig & { loginPage?: string; encrypt?: boolean } = {}
  ) {
    this.defaults = config;
    this.loginPage =
      config.loginPage || process.env.LOGIN_PAGE || this.loginPage;
    this.encrypt = config.encrypt || false;
  }

  defaults: VRequestConfig = {};

  loginPage = '/login/pages/login/index';
  encrypt = false;

  request(
    path: string,
    method: keyof Taro.request.Method,
    specifyConfig: VRequestConfig
  ) {
    const defaultConfig = JSON.parse(JSON.stringify(this.defaults));
    const config = merge(defaultConfig, specifyConfig);
    const token = Taro.getStorageSync('sessionStore');
    const memberId = (Taro.getStorageSync('member') || {})?.id || '';
    const appCode = (Taro.getStorageSync('appp') || {})?.code || '';
    const lang = Taro.getStorageSync('Accept-Lang') || '';

    let data = merge(config.params, config.data);

    // dev:pro时 配置VUE_APP_DISABLE_IV: '"TRUE"',即可强制关闭加密
    if (process.env?.VUE_APP_DISABLE_IV === 'TRUE') {
      Object.assign(this.defaults.headers, {
        'disable-iv-encrypt': 1,
      });
    }

    if (process.env?.VUE_APP_TENENT_CODE) {
      Object.assign(this.defaults.headers, {
        'tanent-code': process.env.VUE_APP_TENENT_CODE,
      });
    }

    if (this.encrypt) {
      const { ivBase64, encryptedText } = encryptText(JSON.stringify(data));

      Object.assign(this.defaults.headers, {
        'iv-encrypt': true,
        'iv-decode': ivBase64,
      });

      let isFormData = false;

      try {
        isFormData = data?.constructor === new FormData().constructor;
      } catch {
        isFormData = false;
      }

      if (isFormData) {
        data.append('iv_encrypted', encryptedText);
      } else {
        data = {
          iv_encrypted: encryptedText,
        };
      }
    }

    return Taro.request({
      url: `${config.baseURL}${path}`,
      method: method,
      data,
      dataType: config.dataType || 'json',
      header: {
        'content-type': 'application/json',
        'Accept-Lang': lang,
        authorization: `Token ${token}`,
        MemberId: memberId,
        AppCode: appCode,
        'ransack-decode': true,
        ...this.defaults?.headers,
        ...specifyConfig?.headers,
      },
    })
      .then((res: any) => {
        // console.log(res.header);

        if (
          this.encrypt ||
          res.header['iv-encrypt'] ||
          res.header['Iv-Encrypt']
        ) {
          const decryptedText = decryptText(
            res.data.iv_encrypted,
            res.data.iv64
          );
          if (decryptedText) {
            const data = JSON.parse(decryptedText);
            if (Array.isArray(data)) {
              res.data = data;
            } else {
              Object.assign(res.data, data);
            }
          }
        }

        if (res.statusCode === 503) {
          throw new requestError('503了后端仔', res);
        }
        if (res.statusCode === 500) {
          throw new requestError('500了后端仔');
        }

        if (res.statusCode === 404) {
          throw new requestError('404了前端仔');
        }

        if (res.statusCode === 400) {
          throw new requestError('400了前端仔');
        }

        if (res.statusCode === 422) {
          Taro.showToast({ title: res.data.message, icon: 'none' });
          throw new requestError('422了前端仔', res.data.message);
        }

        if (res.statusCode === 430) {
          Taro.showToast({ title: '操作太快啦', icon: 'none' });
          throw new requestError('操作过频', res.data);
        }

        if (res.statusCode === 403) {
          Taro.showToast({ title: '无权限', icon: 'none' });
          throw new requestError('无权限', res.data);
        }

        if (res.statusCode === 401) {
          Taro.setStorageSync('sessionStore', '');
          if (process.env.TRAO_ENV === 'weapp') {
            console.log('进入微信登录逻辑');
            Taro.request({
              url: `${config.baseURL}/wechat/login/unbind`,
              method: 'POST',
              header: {
                authorization: `Token ${token}`,
              },
            }).catch();
          }

          const lastPage =
            Taro.getCurrentPages()[Taro.getCurrentPages().length - 1];
          const lastPageRoute =
            '/' +
            (lastPage?.route || '')
              .split('/')
              .filter((i) => i)
              .join('/');
          if (lastPageRoute !== this.loginPage) {
            this.navigateToLoginPage(lastPage);
          }

          throw new requestError('401了前端仔');
        }
        return res;
      })
      .catch((error: any) => {
        if (error.status === 401) {
          Taro.setStorageSync('sessionStore', '');

          Taro.request({
            url: `${config.baseURL}/wechat/login/unbind`,
            method: 'POST',
            header: {
              authorization: `Token ${token}`,
            },
          }).catch();

          const lastPage =
            Taro.getCurrentPages()[Taro.getCurrentPages().length - 1];
          const lastPageRoute =
            '/' +
            (lastPage?.route || '')
              .split('/')
              .filter((i) => i)
              .join('/');
          if (lastPageRoute !== this.loginPage) {
            this.navigateToLoginPage(lastPage);
          }
        }
        throw error;
      });
  }

  navigateToLoginPage(lastPage: any) {
    Taro.navigateTo({
      url: `${this.loginPage}?redirect=${encodeURIComponent(
        `${lastPage.$taroPath}&${Object.keys(lastPage.$taroParams)
          .map((key) => [key, lastPage.$taroParams[key]].join('='))
          .join('&')}`
      )}`,
    });
  }

  run(
    config: VRequestConfig & { url: string; method: keyof Taro.request.method }
  ) {
    return this.request(config.url, config.method, config);
  }

  get(path: string, specifyConfig?: VRequestConfig) {
    return this.request(path, 'GET', specifyConfig || {});
  }

  post(path: string, data: VObject, specifyConfig?: VRequestConfig) {
    return this.request(path, 'POST', { ...specifyConfig, data });
  }

  patch(path: string, data: VObject, specifyConfig?: VRequestConfig) {
    return this.request(path, 'PUT', { ...specifyConfig, data });
  }

  delete(path: string, specifyConfig?: VRequestConfig) {
    return this.request(path, 'DELETE', {
      ...specifyConfig,
      dataType: 'plain',
    });
  }
}
