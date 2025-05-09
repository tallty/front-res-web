import { VObject } from './../lib/vails/model/index';
import qs from 'qs';

import store from '@/store';
type func = (item: any) => string;

export default {
  only(obj: VObject, keys: string | string[]) {
    obj = obj || {};
    if ('string' == typeof keys) {
      keys = keys.split(/ +/);
    }
    return keys.reduce((ret: VObject, key: string) => {
      if (null == obj[key]) {
        return ret;
      }
      ret[key] = obj[key];
      return ret;
    }, {});
  },
  except(obj: VObject, exceptKeys: string | string[]) {
    obj = obj || {};
    if ('string' == typeof exceptKeys) {
      exceptKeys = exceptKeys.split(/ +/);
    }
    const keys = Object.keys(obj);
    return keys.reduce((ret: VObject, key: string) => {
      if (null == obj[key]) {
        return ret;
      }
      if (exceptKeys.includes(key)) {
        return ret;
      }
      ret[key] = obj[key];
      return ret;
    }, {});
  },
  groupBy(array: any[], func: any) {
    return array.map(typeof func === 'function' ? func : val => val[func]).reduce(
      (group: any, val: any, index: number) => ({
        ...group,
        [val]: (group[val] || []).concat(array[index]),
      }),
      {},
    );
  },
  objectify(ary: any[], key: string | func, valueKey?: string | number) {
    return ary.reduce((obj, item) => {
      const v = valueKey ? item[valueKey] : item;
      const k = typeof key === 'function' ? key(item) : item[key];
      Object.assign(obj, { [k]: v });
      return obj;
    }, {});
  },
  stringToArray(str: string) {
    if (!str) {
      return [];
    }
    const pattern = /[,，;；\s、!@#$%^&*_\-+=《》<>?\\/[\]()（）'"‘’“”]/g;
    const formatString = str
      .replace(pattern, ' ')
      .trim()
      .replace(/\s{2,}/g, ' ');
    return formatString.split(' ');
  },
  openUrl(path: string, target = '_blank') {
    const publicPath = process.env.VUE_APP_PUBLIC_PATH || '';
    if (path.includes('http') || path.includes(publicPath)) {
      window.open(path, target);
      return;
    }
    const newPath = path.charAt(0) === '/' ? path.slice(1) : path;
    window.open(`${publicPath}${newPath}`, target);
  },
  toCurrency(price: number | string, decimalCount = 2, suffix = '') {
    const priceNumber = Number(price);
    if (Number.isNaN(priceNumber)) return null;
    const priceArray = priceNumber.toFixed(decimalCount).split('.');
    return `${Number(priceArray[0]).toLocaleString('en-US')}.${
      priceArray[1] ? priceArray[1].padEnd(decimalCount, '0') : suffix
    }`;
  },
  isEmpty(value: any) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }
    return !!value;
  },
  permit(value: string | string[]) {
    let isPermit = false;
    const permits = store.state.currentUser.roles;
    if (permits) {
      if (typeof value === 'object') {
        (value as string[]).forEach(val => {
          if (permits.includes(val)) {
            isPermit = true;
          }
        });
      } else {
        if (permits.includes(value)) {
          isPermit = true;
        }
      }
    }

    return isPermit;
  },
  getRouteQuery() {
    return qs.parse(window.location.search.slice(1)) || {};
  },
};
