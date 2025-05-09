import { VObject } from '@/lib/vails/model/index';
import { isArray, mergeWith } from 'lodash';

const customizer = (objValue: VObject, srcValue: VObject) => {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
};

export const mergeWithConcatArray = (object: VObject, other: VObject): VObject => {
  return mergeWith(object, other, customizer);
};
