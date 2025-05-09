import { VModelType, VModel, VModelBase, VObject } from '../model';
import VApi, { VApiIndexResponse, VApiIdType } from '../api';
import { Ref, ref } from 'vue';
import { cloneDeep, merge, set, get } from 'lodash-es';
import { VRequestResponse, VRequestConfig } from '../request/index';

export interface VStoreParams {
  silence?: boolean; // 不触发 loading 直接更新store
  shouldAppend?: boolean; // 是否追加元素，而不是整页替换
  [key: string]: any;
}

export interface VStoreCollectionPayload {
  silence?: boolean; // 不触发 loading 直接更新store
  action: string;
  config?: VRequestConfig;
  setRecord?: boolean;
  setRecords?: boolean;
}

export interface VStoreMemberPayload {
  silence?: boolean; // 不触发 loading 直接更新store
  action: string;
  id: number | string;
  config?: VRequestConfig;
  setRecord?: boolean;
  setRecords?: boolean;
}

let order = 0

export interface VStoreCallback {
  lifecycle: string;
  callback: (opts: VObject) => Promise<any>
}

export type VStoreRequestConfig = VRequestConfig & { silence?: boolean };

export interface VStoreConstructorOptions {
  initFormData?: VObject;
  disableLoadingProtection?: boolean;
  extra?: VObject;
}

export class VStore<
  T extends VModelBase = VModelBase,
  CacheType extends VObject = VObject
> {
  model: VModelType<T> = VModel;
  apiRef: Ref<VApi<T>> = ref(new VApi<T>());

  seq = order++;

  get api() {
    return this.apiRef.value;
  }

  set api(val) {
    this.apiRef.value = val;
  }

  records: Ref<(VModel<T> & T)[]> = ref([]);

  perPage = ref(15);
  currentPage = ref(1);
  totalPages = ref(1);
  totalCount = ref(-1);
  record: Ref<VModelBase & VObject> = ref({});
  loading = ref(false);
  query: VObject = ref({});
  subQuery: VObject = ref({});
  params: VObject = ref({});
  requestNo: Record<string, number> = {};
  requestData: Ref<VObject> = ref({});
  initFormData: Ref<VObject> = ref({});
  disableLoadingProtection = ref<boolean>(false);

  loadingLocks = ref<Record<string, boolean | undefined>>({});

  callbacks: VStoreCallback[] = [];

  extra: VObject = {}

  constructor(
    api: VApi<T>,
    model?: VModelType<T>,
    options?: VStoreConstructorOptions
  ) {
    this.api = api;
    this.model = model || VModel;
    this.initFormData.value = options?.initFormData || {};
    this.disableLoadingProtection.value = !!options?.disableLoadingProtection;
    this.extra = options?.extra || {};
  }

  self = this as VStore<T>;

  new(attrs: Partial<T> = {}) {
    return new this.model(
      merge(cloneDeep(this.initFormData.value), cloneDeep(attrs)),
      this.self,
      attrs
    );
  }

  initPagination(params: VStoreParams | undefined): void {
    this.currentPage.value = params?.page || this.currentPage.value;
    this.perPage.value = params?.per_page || this.perPage.value;
    if (this.currentPage.value === 1) {
      // 刷新列表第一页
      this.totalCount.value = -1;
    }
  }

  addCallback(lifecycle: string, callback: (opts: VObject) => Promise<any>) {
    this.callbacks.push({ lifecycle, callback });
  }

  triggerCallbacks(lifecycle: string, opts: VObject = {}) {
    return Promise.all(
      this.callbacks
        .filter((o) => o.lifecycle === lifecycle)
        .map(async (o) => await o.callback(opts))
    )
  }

  afterIndex(callback: (opts: VObject) => Promise<any>) {
    this.addCallback('afterIndex', callback);
  }

  afterFind(callback: (opts: VObject) => Promise<any>) {
    this.addCallback('afterFind', callback);
  }

  afterCreate(callback: (opts: VObject) => Promise<any>) {
    this.addCallback('afterCreate', callback);
  }

  afterUpdate(callback: (opts: VObject) => Promise<any>) {
    this.addCallback('afterUpdate', callback);
  }

  afterDelete(callback: (opts: VObject) => Promise<any>) {
    this.addCallback('afterDelete', callback);
  }

  reset() {
    this.params.value = {};
    this.query.value = {};
    this.subQuery.value = {};
    this.record.value = {};
    this.loading.value = false;
    this.perPage.value = 15;
    this.currentPage.value = 1;
    this.totalPages.value = 1;
    this.totalCount.value = -1;
    this.records.value = [];
    this.cache.value = {} as any;
  }

  processIndexData(data: VApiIndexResponse<T, string>): T[] {
    this.currentPage.value = data.current_page || this.currentPage.value;
    this.totalPages.value = data.total_pages || this.totalPages.value;
    this.totalCount.value =
      typeof data.total_count === 'number'
        ? data.total_count
        : this.totalCount.value;
    return cloneDeep(data[this.api.dataIndexKey] || []);
  }

  appendRecords(data: VApiIndexResponse<T, string>): void {
    const records = this.processIndexData(data);
    if (this.currentPage.value === 1) {
      this.records.value = records.map(
        (record) => new this.model(record, this.self) as T & VModel<T>
      );
    } else {
      this.records.value = [
        ...this.records.value,
        ...records.map(
          (record) => new this.model(record, this.self) as T & VModel<T>
        ),
      ];
    }
  }

  setRecords(data: VApiIndexResponse<T, string>): void {
    const records = this.processIndexData(data);
    this.records.value = records.map(
      (record) => new this.model(record, this.self) as T & VModel<T>
    );
  }

  setRecord(record: T): void {
    this.record.value = new this.model(
      cloneDeep(record),
      this.self,
      cloneDeep(record)
    );
  }

  addRecord(record: T): void {
    this.totalCount.value += 1;
    this.records.value.push(new this.model(record, this.self) as T & VModel<T>);
  }

  updateRecord(record: Partial<T>): void {
    const reactiveRecord = this.records.value.find((o) => o.id === record.id);
    if (reactiveRecord) {
      Object.assign(reactiveRecord, record);
    }
    if (record.id === this.record.value.id) {
      Object.assign(this.record.value, record);
    }
  }

  deleteRecord(id: VApiIdType): void {
    const index = this.records.value.findIndex((o) => o.id === id);

    this.totalCount.value -= 1;
    if (index >= 0) {
      this.records.value.splice(index, 1);
    }
    if (id === this.record.value.id) {
      this.record.value = {};
    }
  }

  withLoadingLock(fn: () => Promise<any>, lockKey: string): Promise<any> {
    const msg = '您操作太快啦';
    // if (this.loading.value && !this.disableLoadingProtection.value) return Promise.reject(msg);
    if (this.loadingLocks.value[lockKey]) return Promise.reject(msg);

    this.loadingLocks.value[lockKey] = true;

    return fn().finally(() => (this.loadingLocks.value[lockKey] = undefined));
  }

  index(
    params?: VStoreParams,
    specifiedApi?: VApi<T>
  ): Promise<VApiIndexResponse<T, string> | Record<string, never>> {
    const api = specifiedApi || this.api;
    this.initPagination(params);

    const _params = JSON.parse(JSON.stringify(params || {}));
    const finalParams = {
      ...merge(_params, cloneDeep(this.params.value), {
        q: cloneDeep(this.query.value),
        sub_q: cloneDeep(this.subQuery.value),
      }),
      per_page: this.perPage.value,
      page: this.currentPage.value,
    };

    const lockKey = api.getLockKey({
      type: 'collection',
      method: `GET-${JSON.stringify(finalParams || {})}`,
    });

    return this.withLoadingLock(async () => {
      if (params?.silence !== true) {
        this.loading.value = true;
      }

      if (
        params &&
        params.shouldAppend &&
        this.totalCount.value !== -1 &&
        this.perPage.value * (this.currentPage.value - 1) >
          this.totalCount.value
      ) {
        this.loading.value = false;
        return {};
      }

      try {
        if (!this.requestNo.index) this.requestNo.index = 0;
        this.requestNo.index += 1;
        const no = this.requestNo.index;

        const { data } = await api.index(finalParams);
        if (no === this.requestNo.index) {
          if (params && params.shouldAppend) {
            this.appendRecords(data);
          } else {
            this.setRecords(data);
          }
          await this.triggerCallbacks('afterIndex', { data });
          this.loading.value = false;
          return data;
        } else {
          return {};
        }
      } catch (error) {
        this.loading.value = false;
        throw error;
      }
    }, lockKey);
  }

  find(
    id: VApiIdType,
    config?: VStoreRequestConfig,
    specifiedApi?: VApi<T>
  ): Promise<VRequestResponse<T>> {
    const api = specifiedApi || this.api;
    const lockKey = api.getLockKey({ type: 'member', method: 'GET', id });

    return this.withLoadingLock(() => {
      if (!config?.silence) {
        this.loading.value = true;
      }
      if (!this.requestNo.find) this.requestNo.find = 0;
      this.requestNo.find += 1;
      const no = this.requestNo.find;
      return api
        .find(id, config)
        .then(async (res) => {
          if (no === this.requestNo.find) {
            this.setRecord(res.data);
          }
          await this.triggerCallbacks('afterFind', { data: res.data});

          this.loading.value = false;
          return cloneDeep(res);
        })
        .catch((error) => {
          this.loading.value = false;
          throw error;
        });
    }, lockKey);
  }

  create(
    formData: Partial<T>,
    config?: VStoreRequestConfig,
    specifiedApi?: VApi<T>
  ): Promise<T> {
    const api = specifiedApi || this.api;
    const lockKey = api.getLockKey({ type: 'collection', method: 'POST' });

    return this.withLoadingLock(() => {
      const api = specifiedApi || this.api;

      if (!config?.silence) {
        this.loading.value = true;
      }

      return api
        .create(
          merge({}, this.params.value, this.requestData.value, formData),
          config
        )
        .then(async ({ data }) => {
          this.addRecord(data);
          await this.triggerCallbacks('afterCreate', { data });
          this.loading.value = false;
          return data;
        })
        .catch((error) => {
          this.loading.value = false;
          throw error;
        });
    }, lockKey);
  }

  update(
    formData: Partial<T>,
    config?: VStoreRequestConfig,
    specifiedApi?: VApi<T>
  ): Promise<VObject> {
    const api = specifiedApi || this.api;
    const lockKey = api.getLockKey({
      type: 'member',
      method: 'PATCH',
      id: formData.id,
    });

    return this.withLoadingLock(async () => {
      if (!config?.silence) {
        this.loading.value = true;
      }
      if (Object.keys(formData)[0]) {
        return api
          .update(formData, config)
          .then(async (res) => {
            const data =
              typeof res === 'object' ? res.data || formData : formData;
            this.updateRecord(data);
            await this.triggerCallbacks('afterUpdate', { data });
            this.loading.value = false;
            return data;
          })
          .catch((error) => {
            this.loading.value = false;
            throw error;
          });
      } else {
        this.loading.value = false;
      }
    }, lockKey);
  }

  delete(
    id: VApiIdType,
    config?: VStoreRequestConfig,
    specifiedApi?: VApi<T>
  ): Promise<T> {
    const api = specifiedApi || this.api;
    const lockKey = api.getLockKey({ type: 'member', method: 'DELETE', id });

    const _params = JSON.parse(JSON.stringify(config?.params || {}));
    const finalParams = {
      ...merge(_params, cloneDeep(this.params.value), {
        q: cloneDeep(this.query.value),
        sub_q: cloneDeep(this.subQuery.value),
      }),
      per_page: this.perPage.value,
      page: this.currentPage.value,
    };

    return this.withLoadingLock(async () => {
      if (!config?.silence) {
        this.loading.value = true;
      }

      try {
        const { data } = await api.delete(id, { ...config, params: finalParams });
        this.deleteRecord(id);
        await this.triggerCallbacks('afterDelete', { data: { id }});
        this.loading.value = false;
        return data;
      } catch (error) {
        this.loading.value = false;
        throw error;
      }
    }, lockKey);
  }

  sendCollectionAction(payload: VStoreCollectionPayload, specifiedApi?: VApi<T>): Promise<any> {
    const api = specifiedApi || this.api;
    const { action, config } = payload;

    const lockKey = api.getLockKey({ type: 'collection', action });

    return this.withLoadingLock(() => {
      if (payload.silence !== true) {
        this.loading.value = true;
      }

      if (!this.requestNo[action]) this.requestNo[action] = 0;
      this.requestNo[action] += 1;

      const no = this.requestNo[action];

      return this.api
        .sendCollectionAction(
          action,
          merge(
            {},
            {
              data: merge({}, this.params.value, this.requestData.value),
            },
            config
          )
        )
        .then((res) => {
          this.loading.value = false;
          if (no === this.requestNo[action]) {
            if (payload?.setRecord) {
              this.setRecord(res.data);
            } else if (payload?.setRecords) {
              this.setRecords(res.data);
            }
            return res;
          } else {
            return {};
          }
        })
        .catch((error) => {
          this.loading.value = false;
          throw error;
        });
    }, lockKey);
  }

  sendMemberAction(payload: VStoreMemberPayload, specifiedApi?: VApi<T>): Promise<any> {
    const api = specifiedApi || this.api;
    const { action, id, config } = payload;

    const lockKey = api.getLockKey({ type: 'member', action, id });

    return this.withLoadingLock(() => {
      if (payload.silence !== true) {
        this.loading.value = true;
      }

      if (!this.requestNo[action]) this.requestNo[action] = 0;
      this.requestNo[action] += 1;

      const no = this.requestNo[action];

      return this.api
        .sendMemberAction(
          id,
          action,
          merge(
            {},
            { data: merge({}, this.params.value, this.requestData.value) },
            config
          )
        )
        .then((res) => {
          this.loading.value = false;
          if (no === this.requestNo[action]) {
            if (payload?.setRecord) {
              this.setRecord(res.data);
            } else if (payload?.setRecords) {
              this.setRecords(res.data);
            }
            return res;
          } else {
            return {};
          }
        })
        .catch((error) => {
          this.loading.value = false;
          throw error;
        });
    }, lockKey);
  }

  cache = ref<CacheType>({} as any);

  setCache(key: string, value: any) {
    set(this.cache.value, key, value);
  }

  getCache(key: string) {
    get(this.cache.value, key);
  }
}
