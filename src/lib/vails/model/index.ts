import { cloneDeep, isEqual, mergeWith } from 'lodash-es';
import { computed, ComputedRef, reactive, ref, UnwrapRef } from 'vue';
import VApi, { VApiConfig, VApiIdType } from '../api';
import { VStore } from '../store';

// 模型实例基础结构
export interface VModelBase {
  id?: VApiIdType;
  position?: number;
}

export interface VObject {
  [key: string]: any;
}

export type VModelType<T> = new (
  target: Partial<T>,
  store: VStore<T>,
  formData?: Partial<T>
) => VModel<T>;

export interface formDataAttrItem {
  name: string;
  fn: () => any;
}

export class ExtendableProxy<T extends VObject = VObject> {
  constructor(target: Partial<T>, handler: ProxyHandler<VObject>) {
    return new Proxy<Partial<T>>(target, handler);
  }
}

export class VModel<
  T extends VModelBase = VModelBase
> extends ExtendableProxy<T> {
  store: null | VStore<T> = null;
  computedAttrs: string[] = [];

  formDataAttrs: formDataAttrItem[] = [];
  formData: UnwrapRef<VObject> = reactive({});
  lastFormData = ref<VObject>({});

  errorObj = ref<VObject>({});
  // 在每次动作后会清除的 configCache
  configCache = ref<VObject>({});
  renderKey = ref(0);

  constructor(target: Partial<T>, store: VStore<T>, formData?: Partial<T>) {
    super(cloneDeep(target), {
      get: (obj: any, prop: string) => {
        if (prop === '$isVModel') return true;

        const value = Reflect.get(obj, prop);
        if (value === 0) {
          return 0;
        } else if (value === null) {
          return null;
        } else if (value === false) {
          return false;
        } else {
          return (
            value ||
            (this.computedAttrs.includes(prop)
              ? (this as VObject)[prop]
              : undefined)
          );
        }
      },
    });

    this.store = store;
    this.reload(cloneDeep(formData));
    return this;
  }

  reactiveRecord = reactive(this) as unknown as T & VModel<T>;

  preventLoop = (data: VObject) => {
    const d = VModel.preventLoop(data);

    return Object.keys(d).reduce((out, key) => {
      if (!this.computedAttrs.includes(key)) {
        out[key] = d[key];
      }
      return out;
    }, {} as VObject);
  };

  rawData = computed(() => {
    return this.preventLoop(this.reactiveRecord) as Partial<T>;
  });

  formDataAttr = (name: string, fn: () => any) => {
    this.formDataAttrs.push({ name, fn });
    // return computed(() => fn());
  };

  computedAttr = (name: string, fn: () => any): ComputedRef<any> => {
    this.computedAttrs.push(name);
    return computed(() => {
      this.renderKey.value;
      return fn.bind(this)();
    });
  };

  freshRecord = (data: any) => {
    Object.assign(this, data);
    Object.assign(this.reactiveRecord, data);
    this.reload(data);
    this.renderKey.value++;
  };

  update = async (
    payload: Partial<T>,
    config?: VApiConfig,
    api?: VApi<T>
  ): Promise<void> => {
    this.errorObj.value = {};
    await this.store
      ?.update({ id: this.reactiveRecord.id, ...payload }, config, api)
      ?.then((data: VObject) => {
        this.freshRecord(data);
        return data;
      });
    this.clearConfigCache();
  };

  fetch = async (config?: VApiConfig, api?: VApi<T>): Promise<void> => {
    await this.store
      ?.find(this.reactiveRecord.id as number, config, api)
      .then(({ data }) => {
        this.freshRecord(data);
      });
    this.clearConfigCache();
  };

  delete = async (config?: VApiConfig, api?: VApi<T>): Promise<void> => {
    await this.store?.delete(this.reactiveRecord.id as number, config, api);
    this.clearConfigCache();
  };

  save = async (config?: VApiConfig, api?: VApi<T>): Promise<any> => {
    this.errorObj.value = {};

    if (this.reactiveRecord.id) {
      const dirty: Partial<T> = { ...this.dirty() };
      delete dirty.id;
      if (Object.keys(dirty).length === 0) return Promise.resolve();
      const formData = dirty;
      this.lastFormData.value = cloneDeep(formData);

      return await this.update(formData, config, api)
        .catch((error) => {
          if (error.response) {
            this.errorObj = error.response;
          }
          throw error;
        })
        .finally(() => this.clearConfigCache());
    } else {
      const formDataAttrsData = this.formDataAttrs.reduce(
        (out: VObject, item: formDataAttrItem) => {
          out[item.name] = item.fn();
          return out;
        },
        {}
      );

      const formData = {
        ...(this.preventLoop(this.formData) as Partial<T>),
        ...formDataAttrsData,
      };
      this.lastFormData.value = cloneDeep(formData);

      return await this.store!.create(formData, config, api)
        .then((data) => {
          this.freshRecord(data);
          return data
        })
        .catch((error) => {
          if (error.response) {
            this.errorObj = error.response;
          }
          throw error;
        })
        .finally(() => this.clearConfigCache());
    }
  };

  reload = (formData?: Partial<T>) => {
    mergeWith(
      this.formData,
      cloneDeep(formData || this.rawData.value) as VObject,
      VModel.mergeWithCustomizer
    );
  };

  static mergeWithCustomizer = (oldValue: any, newValue: any): any => {
    if (oldValue !== undefined && newValue === undefined) {
      // 旧值中不为空，且新值为空
      return null;
    } else if (Array.isArray(newValue) && Array.isArray(oldValue)) {
      // 保持引用
      oldValue.splice(0, oldValue.length, ...newValue);
      return oldValue; // 不进行递归
    } else if (
      typeof oldValue === 'object' &&
      !Array.isArray(oldValue) &&
      oldValue !== null &&
      typeof newValue === 'object' &&
      !Array.isArray(newValue) &&
      newValue !== null
    ) {
      // 都是 对象
      return mergeWith(oldValue, newValue, VModel.mergeWithCustomizer);
    }
  };

  dirty = () => {
    // support resources_attributes
    const payload = this.preventLoop(this.formData);
    // const diffAttributes = VModel.getDiffResourceAttributes(payload);
    // diff origin data and formData

    const patchData = VModel.nestedDiff(this.rawData.value, payload);

    const formDataAttrsData = this.formDataAttrs.reduce(
      (out: VObject, item: formDataAttrItem) => {
        out[item.name] = item.fn();
        return out;
      },
      {}
    );

    if (Object.keys(patchData)[0] || Object.keys(formDataAttrsData)[0]) {
      return Object.assign(patchData, {
        id: this.reactiveRecord.id,
        // ...diffAttributes,
        ...formDataAttrsData,
      });
    } else {
      return {};
    }
  };

  // 根据attribute属性获取通用表单使用的formRecord
  formRecordWithAttribute = (
    attribute: string,
    callback: { success: () => void; fail: (message?: string) => void }
  ) => {
    const formRecord = ref<any>(null);
    formRecord.value = new VModel({}, this.store as any, {});
    formRecord.value.id = this.formData.id;
    formRecord.value.formData = reactive(this.formData[attribute]);
    formRecord.value.save = async () => {
      try {
        await formRecord.value.update({
          [attribute]: formRecord.value.formData,
        });
        callback.success && callback.success();
      } catch {
        callback.fail && callback.fail();
      }

    };

    return formRecord;
  };

  // 根据对象的某个attribute 生成一个fake record
  // 这个对象传入通用表单，submit以后，保存到原有的属性中
  fakeRecordWithAttribute = (
    attribute: string,
    callback: { success: () => void; fail: (message?: string) => void }
  ) => {
    const fakeRecord = ref<any>(null);
    fakeRecord.value = new VModel({}, this.store as any, {});
    fakeRecord.value.formData = reactive(this.formData[attribute]);
    fakeRecord.value.save = async () => {
      try {
        this.formData[attribute] = fakeRecord.value.formData;

        callback.success && callback.success();
      } catch {
        callback.fail && callback.fail();
      }

    };

    return fakeRecord;
  };

  clearConfigCache = () => {
    this.configCache.value = {};
  };

  storageConfigCache = (key: string, value: any) => {
    this.configCache.value[key] = value;
  };

  // 去掉 'reactiveRecord', 'store' 两个引起死循环与JSON格式化错误的项
  // 再去掉一些多余属性
  static preventLoop(data: VObject) {
    return Object.keys(data).reduce((out, key) => {
      if (
        ![
          'reactiveRecord',
          'store',
          'computedAttrs',
          'formDataAttrs',
          'formData',
          'lastFormData',
          'rawData',
          'configCache',
          'errorObj',
        ].includes(key) &&
        typeof data[key] !== 'function' &&
        !(typeof data[key] === 'object' && data[key]?.$isVModel)
      ) {
        out[key] = data[key];
      }
      return out;
    }, {} as VObject);
  }

  static diff = (oldObject: VObject | null, newObject: VObject) => {
    const old = oldObject || {};
    if (oldObject === newObject) {
      return {};
    }
    return Object.keys(newObject).reduce((res: VObject, key: string) => {
      const oldValue = old[key];
      const newValue = newObject[key];

      if (!isEqual(oldValue, newValue)) {
        Object.assign(res, {
          [key]: this.nestedDiff(oldValue, newValue, false),
        });
      }
      return res;
    }, {});
  };

  static nestedDiff = (
    oldObject: VObject | null,
    newObject: VObject,
    root = true
  ): VObject => {
    if (
      typeof oldObject === 'object' &&
      oldObject !== null &&
      !Array.isArray(oldObject) &&
      typeof newObject === 'object' &&
      newObject !== null &&
      !Array.isArray(newObject)
    ) {
      if (root || oldObject.$diff) {
        return this.diff(oldObject, newObject);
      } else {
        return Object.keys(newObject).reduce((res: VObject, key: string) => {
          const oldValue = oldObject[key];
          const newValue = newObject[key];

          Object.assign(res, {
            [key]: this.nestedDiff(oldValue, newValue, false),
          });
          return res;
        }, {});
      }
    } else {
      return newObject;
    }
  };

  returnNestedModel = (model: VObject) => {
    return new Proxy(model, {
      get: (obj: VObject, key: string) => {
        try {
          return obj[key]?.value || obj[key];
        } catch {
          return obj[key];
        }
      },
    });
  };

  // static getDiffResourceAttributes = (record: VObject) => {
  //   const attributesKeys = Object.keys(record).filter((key: string) =>
  //     key.includes('_attributes'),
  //   );
  //   return attributesKeys.reduce((obj, key) => {
  //     const keyValue =
  //       record[key] instanceof Array
  //         ? VModel.diffAttributes(
  //             record[key.split('_attributes').shift() || ''] || [],
  //             record[key],
  //           )
  //         : record[key];

  //     return {
  //       ...obj,
  //       [key]: keyValue,
  //     };
  //   }, {});
  // };

  // static diffAttributes = (
  //   originAttributeObjects: VObject[],
  //   currentAttributeObjects: VObject[],
  // ) => {
  //   const originAttributeObjectIds = originAttributeObjects.map(
  //     (o: VObject) => o.id,
  //   );
  //   const currentAttributeObjectIds = currentAttributeObjects.map(
  //     (o: VObject) => o.id,
  //   );
  //   const newObjects = currentAttributeObjects.filter(
  //     (o: VObject) => !originAttributeObjectIds.includes(o.id),
  //   );
  //   const deleteObjects = originAttributeObjects
  //     .filter((o: VObject) => !currentAttributeObjectIds.includes(o.id))
  //     .map((o: VObject) => ({
  //       ...o,
  //       _destroy: o.id,
  //     }));
  //   return newObjects.concat(deleteObjects);
  // };
}
