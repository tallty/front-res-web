import { Method, AxiosRequestConfig } from 'axios';
import { VApiParent } from '../api/index';

export type VRequestConfig = {
  url?: string;
  method?: Method;
  baseURL?: string;
  headers?: any;
  params?: any;
  data?: any;
  dataType?: string;
  responseType?: string;
} & AxiosRequestConfig;

export interface VRequestInstance {
  defaults: VRequestConfig;
  (config: VRequestConfig): VRequestPromise;
  (url: string, config?: VRequestConfig): VRequestPromise;
  run(config: VRequestConfig): VRequestPromise;
  run(url: string, config?: VRequestConfig): VRequestPromise;
  get<T = any, R = VRequestResponse<T>>(url: string, config?: VRequestConfig): Promise<R>;
  delete<T = any, R = VRequestResponse<T>>(url: string, config?: VRequestConfig): Promise<R>;
  post<T = any, R = VRequestResponse<T>>(url: string, data?: any, config?: VRequestConfig): Promise<R>;
  patch<T = any, R = VRequestResponse<T>>(url: string, data?: any, config?: VRequestConfig): Promise<R>;
}

export interface VRequestResponse<T = any>  {
  data: T;
  status: number;
}

export type VRequestPromise<T = any> = Promise<VRequestResponse<T>>
