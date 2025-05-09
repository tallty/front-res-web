import createRequestClient from '../request/request';
import { isInteger, merge, cloneDeep, snakeCase, reject } from 'lodash-es';
import { plural } from 'pluralize';
import { VModelBase, VObject } from '../model';
import {
  VRequestConfig,
  VRequestInstance,
  VRequestResponse,
  VRequestPromise,
} from '../request';

export type VApiIdType = number | string;
type VAPiModeType = 'default' | 'shallow' | 'single';

export interface VApiParent {
  type: string;
  id?: number | string;
}

interface VApiAction {
  name: string;
  method: 'get' | 'post' | 'patch' | 'put' | 'delete';
  on: 'member' | 'collection';
}

type VApiIndexRecordsResponse<T, K extends string> = { [key in K]: T[] };
interface VApiIndexPaginationResponse {
  current_page: number;
  total_pages: number;
  total_count: number;
}
export type VApiIndexResponse<
  T,
  K extends string = string
> = VApiIndexRecordsResponse<T, K> & VApiIndexPaginationResponse;

export interface VApiInterface {
  baseURL: string;
  rootPath: string;
  namespace: string;
  name: string;
  pathIndexKey: string;
  dataIndexKey: string;
  paramsKey: string;
  wrapParams: boolean;
  parents: VApiParent[];
  mode?: VAPiModeType;
  params?: VObject;
  resourcePath: string;
  parentMap: { [key: string]: VApiParent };
  index(params: VObject, config?: VRequestConfig): any;
  find(id?: VApiIdType, config?: VRequestConfig): any;
  create(payload: any, config?: VRequestConfig): any;
  update(instance: any, config?: VRequestConfig): any;
  delete(id?: VApiIdType, config?: VRequestConfig): any;
  sendCollectionAction(actionName: string, config?: VRequestConfig): any;
  sendMemberAction(
    id: VApiIdType,
    actionName: string,
    config?: VRequestConfig
  ): any;
}

export interface VApiConfig {
  baseURL?: string;
  rootPath?: string; // 路由的命名空间
  name?: string; // 模型名称
  namespace?: string; // 路由的命名空间
  paramsKey?: string; //
  wrapParams?: boolean; // 是否包裹参数
  dataIndexKey?: string; // 资源名称，一般是模型名的复数形式
  pathIndexKey?: string; //路由上的模型名复数形式
  parents?: VApiParent[]; // 关联父资源
  actions?: VApiAction[]; // 自定义接口方法
  mode?: VAPiModeType; // default: Restful 默认模式， shallow: 对于后台 shallow: true, single: 单例模式
  params?: VObject;
  formData?: VObject; // create 固定参数，类似父对象id
  urls?: VApiUrlOptions;
  encrypt?: boolean; // 是否加密
}

interface VApiUrlOptions {
  index?: string;
}

const defaultActions: VApiAction[] = [
  { name: 'export', method: 'post', on: 'collection' },
  { name: 'export_async', method: 'post', on: 'collection' },
  { name: 'export_file', method: 'post', on: 'collection' },
  { name: 'export_file_async', method: 'post', on: 'collection' },
  { name: 'upload_excel', method: 'post', on: 'collection' },
  { name: 'excel', method: 'post', on: 'collection' },
  { name: 'import_headers', method: 'post', on: 'collection' },
  { name: 'export_headers', method: 'post', on: 'collection' },
  { name: 'import', method: 'post', on: 'collection' },
  { name: 'export_import_template', method: 'post', on: 'collection' },
  { name: 'list_index', method: 'post', on: 'collection' },
  { name: 'group_index', method: 'post', on: 'collection' },
];

/**
 * 模型抽象基础类
 * api_path: baseURL + rootPath + namespace + resource
 * examples:
 *  http://www.api.com/v2/finance/user/activities
 *  http://www.api.com + /v2 + /finance/user + /activities
 */
export default class VApi<
  T extends VModelBase = VModelBase,
  K extends string = string
> implements VApiInterface
{
  request!: VRequestInstance;
  baseURL!: string;
  rootPath = '/';
  namespace = '';
  name = '';
  dataIndexKey = '';
  pathIndexKey = '';
  paramsKey: string;
  // @ts-ignore
  wrapParams: boolean | undefined;
  parents: VApiParent[] = [];
  actions: VApiAction[] = [];
  mode: VAPiModeType = 'default';
  params: VObject = {};
  formData: VObject = {};
  urls: VApiUrlOptions | undefined = {};

  constructor(
    config: VApiConfig = {},
    requestGenerator: () => any = createRequestClient
  ) {
    this.request = requestGenerator();
    const {
      baseURL,
      rootPath,
      name,
      namespace,
      dataIndexKey,
      pathIndexKey,
      paramsKey,
      parents,
      actions,
      mode,
      params,
      formData,
      urls,
      wrapParams,
    } = config;

    this.urls = urls;

    if (baseURL) {
      this.request.defaults.baseURL = baseURL;
    }
    if (rootPath) {
      this.request.defaults.baseURL += rootPath;
    }
    this.namespace = namespace || this.namespace;
    // const modelName = name || this.constructor.name;
    this.name = name || '';
    this.dataIndexKey = dataIndexKey || 'records';
    this.pathIndexKey = pathIndexKey || plural(this.name);
    this.wrapParams = wrapParams === undefined ? true : wrapParams;
    this.paramsKey = paramsKey || this.name;
    this.parents = parents || [];
    this.actions = actions || [];
    this.mode = mode || 'default';
    this.params = params || {};
    this.formData = formData || {};
  }

  get parentMap(): Record<string, VApiParent> {
    return this.parents.reduce(
      (map: Record<string, VApiParent>, parent: VApiParent) => {
        map[parent.type] = parent;
        return map;
      },
      Object.create(null)
    );
  }

  get allActions() {
    return [...defaultActions, ...this.actions];
  }

  get resourcePath(): string {
    return `${this.namespace}/${this.pathIndexKey}`;
  }

  get indexPath(): string {
    if (this.urls && this.urls.index) {
      return this.urls.index;
    }
    const temp = this.parents.map((item) => {
      if (!item.id) {
        return `${item.type}`;
      }
      return `${item.type}/${item.id}`;
    });
    const parentPath: string = temp.reduce(
      (path: string, item: string) => `${path}/${item}`,
      this.namespace
    );
    if (this.mode === 'single') {
      return `${parentPath}/${this.name}`;
    }
    return `${parentPath}/${this.pathIndexKey}`;
  }

  get memberActionMap(): Record<string, VApiAction> {
    return this.allActions
      .filter((a) => a.on === 'member')
      .reduce((map: Record<string, VApiAction>, action: VApiAction) => {
        map[action.name] = action;
        return map;
      }, Object.create(null));
  }

  get collectionActionMap(): Record<string, VApiAction> {
    return this.allActions
      .filter((a) => a.on === 'collection')
      .reduce((map: Record<string, VApiAction>, action: VApiAction) => {
        map[action.name] = action;
        return map;
      }, Object.create(null));
  }

  customParentsPromise = (
    fn: () => Promise<any>,
    params: VObject,
    config: VApiConfig = {}
  ): Promise<any> => {
    const customParents =
      merge({}, params, params[this.paramsKey] || {}, config?.params)
        .$parents || this.parents;

    return new Promise((resolve, reject) => {
      const parentsCache = [...this.parents];
      this.parents = [...customParents];

      fn()
        .then((arg: any) => {
          resolve(arg);
        })
        .catch((err) => {
          reject(err);
        })
        .finally(() => {
          this.parents = parentsCache;
        });
    });
  };

  /**
   * index
   * 模型列表接口
   */
  index(
    params?: VObject,
    config?: VRequestConfig
  ): Promise<VRequestResponse<VApiIndexResponse<T, K>>> {
    const apiParams = cloneDeep(this.params);
    const finalParams = merge(apiParams, params);
    const indexParams = cloneDeep(finalParams);
    delete indexParams.$parents;

    return this.customParentsPromise(
      () =>
        this.request.get<VApiIndexResponse<T, K>>(
          this.getCollectionPath(),
          merge({}, config, { params: { ...indexParams } })
        ),
      finalParams,
      config
    );
  }

  /**
   * find
   * 模型详情接口
   */
  find(id?: VApiIdType, config?: VRequestConfig): VRequestPromise<T> {
    const apiParams = cloneDeep(this.params);
    delete apiParams.$parents;

    return this.customParentsPromise(
      () =>
        this.request.get<T>(
          this.getMemberPath(id),
          merge(config, { params: { ...apiParams } })
        ),
      {},
      config
    );
  }

  /**
   * create
   * 创建记录
   */
  create(payload: Partial<T>, config?: VRequestConfig): VRequestPromise<T> {
    const { data: apiFormData, params: apiParams } =
      this.getParamsAndData(config);

    const wrap_payload = this.wrapParams
      ? merge(apiParams, { [this.paramsKey]: merge(apiFormData, payload) })
      : merge(apiParams, apiFormData, payload);
    return this.customParentsPromise(
      () =>
        this.request.post<T>(this.getCollectionPath(), wrap_payload, config),
      wrap_payload,
      config
    );
  }

  /**
   * update
   * 更新记录
   */
  update(payload: Partial<T>, config?: VRequestConfig): VRequestPromise<T> {
    const { data: apiFormData, params: apiParams } =
      this.getParamsAndData(config);
    const wrap_payload = this.wrapParams
      ? merge(apiParams, { [this.paramsKey]: merge(apiFormData, payload) })
      : merge(apiParams, apiFormData, payload);

    return this.customParentsPromise(
      () =>
        this.request.patch(
          this.getMemberPath(payload.id!),
          wrap_payload,
          config
        ),
      wrap_payload,
      config
    );
  }

  /**
   * delete
   * 删除记录
   */
  delete(id?: VApiIdType, config?: VRequestConfig): VRequestPromise<T> {
    return this.customParentsPromise(
      () => this.request.delete(this.getActionPath(id), config),
      {},
      config
    );
  }

  /**
   * 触发自定义方法
   */
  sendCollectionAction(
    actionName: string,
    config?: VRequestConfig
  ): VRequestPromise<any> {
    const action: VApiAction = this.collectionActionMap[actionName];

    if (!action) {
      throw new Error(
        `\n${actionName} on collection 接口不存在，请检查模型配置。\n`
      );
    }

    const { data, params } = this.getParamsAndData(config);

    return this.customParentsPromise(
      () =>
        this.request.run({
          method: action.method,
          url: this.getCollectionPath(actionName),
          ...config,
          params,
          data,
        }),
      {},
      config
    );
  }

  /**
   * 触发自定义方法
   */
  sendMemberAction(
    id: VApiIdType,
    actionName: string,
    config?: VRequestConfig
  ): VRequestPromise<any> {
    const action: VApiAction = this.memberActionMap[actionName];
    if (!action) {
      throw new Error(
        `\n ${actionName} on member 接口不存在，请检查模型配置。\n`
      );
    }

    const { data, params } = this.getParamsAndData(config);

    return this.customParentsPromise(
      () =>
        this.request.run({
          method: action.method,
          url: this.getMemberPath(id, actionName),
          ...config,
          params,
          data,
        }),
      {},
      config
    );
  }

  getCollectionPath(action?: string) {
    return [this.indexPath, action].filter((i) => i).join('/');
  }

  getMemberPath(id?: VApiIdType, action?: string) {
    return [this.getActionPath(id), action].filter((i) => i).join('/');
  }

  getLockKey(opts: {
    type: 'collection' | 'member';
    action?: string;
    id?: VApiIdType;
    method?: string;
  }) {
    const { type, action, id, method } = opts;
    if (type === 'collection') {
      return `${
        method || (action ? this.collectionActionMap[action] : '')
      }-${this.getCollectionPath(action)}`;
    } else {
      return `${
        method || (action ? this.memberActionMap[action] : '')
      }-${this.getMemberPath(id, action)}`;
    }
  }

  getParamsAndData(config?: VRequestConfig) {
    const apiFormData = cloneDeep(this.formData);
    const apiParams = cloneDeep(this.params);
    let formDataClass: any;
    try {
      formDataClass = FormData;
    } catch {
      formDataClass = null;
    }
    if (
      config?.data &&
      formDataClass &&
      config.data.constructor === new formDataClass().constructor
    ) {
      Object.keys(apiFormData).forEach((key) => {
        const val =
          typeof apiFormData[key] === 'object'
            ? JSON.stringify(apiFormData[key])
            : apiFormData[key];
        config.data.append(key, val);
      });
      return {
        params: merge(apiParams, config?.params || {}),
        data: config.data,
      };
    } else {
      return {
        params: merge(apiParams, config?.params || {}),
        data: merge(apiFormData, config?.data || {}),
      };
    }
  }

  getActionPath(action?: VApiIdType | string) {
    if (action) {
      if (this.mode === 'shallow' && isInteger(Number(action))) {
        return `${this.resourcePath}/${action}`;
      }
      if (this.mode === 'single' && isInteger(Number(action))) {
        return `${this.indexPath}`;
      }
      return `${this.indexPath}/${action}`;
    }
    return this.indexPath;
  }
}
