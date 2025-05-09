import { createRequestClient } from '@/apis/MyApi';
import { STORAGE_SESSION_ID } from '@/store/mutation-type';
import localStorage from '@/utils/local-storage';
import jwt from 'jsonwebtoken';
import { merge } from 'lodash';
import qs from 'qs';
import SparkMD5 from 'spark-md5';
import { AuthSessionApi } from '../../../../../engines/login/apis/auth/session.api';
import { VRequestConfig } from '../../../../../lib/vails/request/index';
import { IFile } from './index';
import { uriJoin } from '../../ta-template-form-core/uriJoin';

export interface IChunkFileResponse {
  fileName: string;
  fileType: string;
  mimeType: string;
  fileCategory: string;
  chunks: number[] | true; // 已上传的分片信息
  cdnTag: 0 | 1;
  downloadPath: string;
  width: number;
  height: number;
}

export interface IChunkUploadParams {
  fileKey: string;
  file: Blob | string;
  chunks: number;
  chunkId: number;
  fileName: string;
  fileSize: number;
  width: string;
  height: string;
  uploadId?: string;
}
// interface IChunkCheckResponse {
//   md5: string; // 与 fileKey 一致
//   exist: boolean; // 如果服务上存在文件，则返回 true
//   chunks: number[]; // 如果服务上存在切片文件，则返回已经上传过的切片序号
//   stats: IFile;
// }

interface IBaseFileServerOptions {
  useCdn: boolean;
  token?: string;
  userCode?: string | number;
  appsecret?: string;
  headers?: Record<string, any>;
  compress?: boolean;
}

const request = createRequestClient(
  process.env.VUE_APP_FILESERVER_DOMAIN || 'https://soa-file.tallty.com/files',
);

/**
 * 文件服务模型
 * fileKey = { 文件上传后业务系统负责保存, 一般为 md5 值 }
 * download = { 文件名 } // 业务系统保存
 */
export default class BaseFileServer {
  // 华为云
  hwDomain = process.env.VUE_APP_FILESERVER_DOMAIN || 'https://soa-file.tallty.com/files';
  hwCdnDomain = process.env.VUE_APP_FILESERVER_CDN_DOMAIN || 'https://cdn.4dschools.com';

  cdnTag: 0 | 1 = 0;
  appsecret = process.env.VUE_APP_FILESERVER_APPSECRET;
  userCode: string | number = '';
  compress = !!process.env.VUE_APP_COMPRESS;

  constructor(options: IBaseFileServerOptions = { useCdn: false, compress: false }) {
    const { useCdn, userCode, appsecret, compress } = options;
    this.cdnTag = useCdn ? 1 : 0;
    this.appsecret = appsecret || this.appsecret;
    this.userCode = userCode || localStorage.get(STORAGE_SESSION_ID) || AuthSessionApi.sessionId();
    this.compress = compress || this.compress;
  }

  /**
   * 获取不同版本文件服务 CDN 域名
   */
  getCdnDomain(fileItem: IFile) {
    return this.hwCdnDomain;
  }

  /**
   * 获取不同版本的文件服务域名
   */
  getDomain(fileItem: IFile) {
    return this.hwDomain;
  }

  /**
   * 生成文件签名
   * @param fileItem  文件对象
   */
  getSignature(fileItem: IFile, shouldAuth = true) {
    const { fileName } = fileItem;
    if (shouldAuth) {
      // storage 文件地址, 上传文件，使用授权签名
      return jwt.sign(
        { appsecret: this.appsecret, fileName },
        JSON.stringify({ userId: this.userCode }),
      );
    }
    // 缩略图使用无授权签名
    return jwt.sign({ appsecret: this.appsecret }, fileName);
  }

  /**
   * 获取文件对应的icon图标
   * @param fileItem  文件对象
   */
  getIcon(fileItem: IFile) {
    return 'icon file path';
  }

  /**
   * 直接上传文件
   * @param file 读取的文件对象
   */
  upload(fileItem: IFile, config?: VRequestConfig & { onUploadProgress: (res: any) => void }) {
    const { file, fileKey, fileName, fileSize } = fileItem;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileKey', fileKey);
    formData.append('fileName', fileName);
    formData.append('fileSize', String(fileSize));
    formData.append('cdnTag', String(this.cdnTag));
    formData.append('signature', this.getSignature(fileItem));

    // return uploadTask
    return request.post(
      `/upload/${fileKey}`,
      formData,
      merge(config, {
        params: { compress: this.compress },
      }),
    );
  }

  /**
   * 分片：检查分片的上传信息，用于断点续传
   * @param fileKey file md5
   */
  checkChunk(fileItem: IFile) {
    const { fileKey, fileSize, fileName, chunks, chunkId, height, width } = fileItem;
    return request.get(`/chunks/${fileKey}`, {
      params: {
        cdnTag: this.cdnTag,
        signature: this.getSignature(fileItem),
        fileSize,
        fileName,
        chunks,
        chunkId,
        height,
        width,
      },
    });
  }

  /**
   * 分片：上传
   * @param fileKey file md5
   * @param chunk 分片二进制数据
   * @param chunks 分片总长度
   * @param chunkId 分片 ID, 从 0 开始，即：文件拆分后的片段的序号
   * @param fileName 文件名称
   * @param fileSize 文件大小
   */
  chunkUpload(params: IChunkUploadParams, config?: VRequestConfig) {
    const { file, chunks, fileKey, fileName, fileSize, chunkId, height, width } = params;
    const formData = new FormData();
    formData.append('chunk', file);
    formData.append('chunks', `${chunks}`);
    formData.append('chunkId', `${chunkId}`);
    formData.append('fileName', fileName);
    formData.append('fileSize', `${fileSize}`);
    formData.append('cdnTag', `${this.cdnTag}`);
    formData.append('signature', this.getSignature({ fileName } as any));
    formData.append('height', height);
    formData.append('width', width);

    return request.post(
      `/chunks/${fileKey}`,
      formData,
      merge(config, {
        params: { compress: this.compress },
      }),
    );
  }

  /**
   * 分片：合并分片为文件
   * 所有分片上传成功后调用，合并分片为完整文件
   * @param fileItem 文件对象
   */
  mergeChunks(fileItem: IFile) {
    return request.post(`/chunk/merge/${fileItem.fileKey}`, {});
  }

  /**
   * 删除文件
   * @param fileKey 文件 key
   */
  delete(fileKey: string) {
    return request.delete(`/storage/${fileKey}`);
  }

  parseUrl(url: string, fileItem: IFile, width = 500, height = 500) {
    let resultUrl = url || new BaseFileServer().getCDNUrl(fileItem);
    if (process.env.VUE_APP_FILESERVER_URL_REPLACE_MAP) {
      const map = JSON.parse(process.env.VUE_APP_FILESERVER_URL_REPLACE_MAP);
      return Object.keys(map).reduce((out: string, key: string) => {
        if (typeof map[key] === 'string') {
          return out.replace(key, map[key]);
        } else {
          const regexp = new RegExp(map[key].regexp);
          if (regexp.test(out)) {
            return out.replace(key, map[key].to);
          } else {
            return out;
          }
        }
      }, resultUrl);
    }

    // 替换 {height} 与 {width} 为具体值
    if (resultUrl.includes('{height}')) {
      resultUrl = resultUrl.replace('{height}', String(height));
    }

    if (resultUrl.includes('{width}')) {
      resultUrl = resultUrl.replace('{width}', String(width));
    }

    return resultUrl;
  }

  /**
   * 获取文件下载地址
   * @param fileKey
   * @param fileName
   */
  getDownloadUrl(fileItem: IFile) {
    const { downloadPath, fileKey, fileName, cdnTag, url } = fileItem;
    if (url) return url;
    if (Number(cdnTag) === 1 && downloadPath) {
      return this.parseUrl(
        uriJoin(this.getCdnDomain(fileItem), downloadPath?.replace('/mnt/files/', '/')),
        fileItem,
      );
    }
    const params = qs.stringify({
      download: fileName,
      signature: this.getSignature(fileItem, false),
    });
    return this.parseUrl(
      uriJoin(this.getDomain(fileItem), `/storage/${fileKey}?${params}`),
      fileItem,
    );
  }

  /**
   * 获取文件 CDN 地址
   */
  getCDNUrl(fileItem: IFile): string {
    const { downloadPath, url } = fileItem;
    return url
      ? url
      : this.parseUrl(
          uriJoin(this.getCdnDomain(fileItem), downloadPath?.replace('/mnt/files/', '/')),
          fileItem,
        );
  }

  /**
   * 获取缩略图地址，设置宽高属性其一，另一个想根据图片自动调整
   * @param fileItem 文件对象s
   * @param width 宽度 可选
   * @param height 高度 可选
   */

  getThumbnailUrl(fileItem: IFile, width?: number, height?: number): string {
    const { fileKey, downloadPath, cdnTag, thumbnail, url } = fileItem;

    if (thumbnail) {
      return this.getThumbnailUrl(thumbnail, width, height);
    }

    if (url) {
      return url;
    }

    // 老版本，新版可直接缩略图接口
    if (Number(cdnTag) === 1 && downloadPath) {
      return this.parseUrl(
        uriJoin(this.getCdnDomain(fileItem), downloadPath?.replace('/mnt/files', '')),
        fileItem,
      );
    }

    const { fileName } = fileItem;
    // const fileNameChunks = fileName.split('.');
    // if (fileNameChunks.length >= 2) {
    //   const lastIndex = fileNameChunks.length - 1;
    //   const validType = fileNameChunks[lastIndex].toLowerCase();
    //   fileNameChunks.splice(lastIndex, 1, validType);
    //   fileName = fileNameChunks.join('.');
    // }
    let sizePath = '';
    if (width && height) {
      sizePath = `w/${width}/h/${height}`;
    } else if (height) {
      sizePath = `h/${height}`;
    } else if (width) {
      sizePath = `w/${width}`;
    } else {
      sizePath = 'w/64';
    }
    const params = qs.stringify({
      download: fileName,
      signature: this.getSignature(fileItem, false),
    });
    return this.parseUrl(
      uriJoin(this.getDomain(fileItem), `/thumbnail/${fileKey}/${sizePath}?${params}`),
      fileItem,
      width,
      height,
    );
  }

  async getFileItem(args: { file: File; chunkSize: number; shouldCompress?: boolean }) {
    try {
      const { file, chunkSize, shouldCompress = true } = args;
      const fileCategory = BaseFileServer.getFileCategory(file);
      const innerFile = file;
      if (fileCategory === 'image' && shouldCompress) {
        // innerFile = await BaseFileServer.getCompressedImage(file);
      }
      const fileKey: string = await BaseFileServer.toMd5(innerFile);
      const fileItem: IFile = {
        cdnTag: this.cdnTag,
        file: innerFile,
        fileKey,
        fileName: innerFile.name,
        fileSize: innerFile.size,
        fileType: BaseFileServer.getFileType(innerFile.type),
        fileCategory,
        mimeType: innerFile.type,
        chunkSize,
        chunks: Math.ceil(innerFile.size / chunkSize),
        chunkId: 0,
        loaded: 0,
        percent: 0.1,
        status: 'todo',
      };
      if (file.type.includes('image')) {
        const imageData = await BaseFileServer.loadImage(innerFile);
        fileItem.width = imageData.width;
        fileItem.height = imageData.height;
      }
      return Promise.resolve<IFile>(fileItem);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static getFileType(mimeType: string): string {
    return mimeType.split('/').pop() || mimeType;
  }

  static getFileCategory(file: File): string {
    return file.type.split('/').shift() || 'application';
  }

  /**
   * 生成 file md5
   * @param file File
   */
  static toMd5(file: File, hex = false) {
    const blobSlice = File.prototype.slice;
    const chunkSize = 2 * 1024 * 1024;
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;

    const fileReader: FileReader = new FileReader();
    const sparkBuffer = new SparkMD5.ArrayBuffer();

    const loadNextChunk = () => {
      const start = currentChunk * chunkSize;
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    };

    return new Promise<string>((resolve, reject) => {
      fileReader.onload = () => {
        sparkBuffer.append(fileReader.result as ArrayBuffer);
        currentChunk += 1;
        if (currentChunk < chunks) {
          loadNextChunk();
        } else {
          resolve(sparkBuffer.end(hex));
        }
      };
      fileReader.onerror = reject;
      loadNextChunk();
    });
  }

  /**
   * 压缩图片
   */
  // static async getCompressedImage(
  // file: File,
  // rate = 0.8,
  // options: { quality?: number } = { quality: 0.8 },
  // ) {
  //   if (!(file && file.type.includes('image'))) {
  //     throw new Error('只支持图片压缩，请检查 fileItem 参数。');
  //   }
  //   if (rate > 1 || rate <= 0) {
  //     return Promise.resolve(file);
  //   }
  //   const image = await BaseFileServer.convertFileToImageElement(file);
  //   const canvas = document.createElement('canvas');
  //   const context = canvas.getContext('2d');
  //   const targetWidth = Math.round(image.width * rate) || 1;
  //   const targetHeight = Math.round(image.height * rate) || 1;
  //   canvas.width = targetWidth;
  //   canvas.height = targetHeight;
  //   if (context) {
  //     context.clearRect(0, 0, targetWidth, targetHeight);
  //     context.drawImage(image, 0, 0, targetWidth, targetHeight);
  //   }
  //   return new Promise<File>((resolve, reject) => {
  //     const fileType: string = file.type || 'image/png';
  //     canvas.toBlob(
  //       blob => {
  //         if (blob) {
  //           const imageFile = new File([blob], file.name, { type: fileType, lastModified: Date.now() });
  //           if (imageFile.size < file.size) {
  //             resolve(imageFile);
  //           } else {
  //             resolve(file);
  //           }
  //         } else {
  //           reject(new Error('压缩图片失败'));
  //         }
  //       },
  //       fileType,
  //       options.quality,
  //     );
  //   });
  // }

  /**
   * 图片 File 对象转化为 html img 标签对象
   * @param file File 对象
   */
  static convertFileToImageElement(file: File) {
    if (file.type.indexOf('image') !== 0) {
      throw new Error('imageLoad 方法只可以传入图片文件');
    }
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const reader = new FileReader();
      const image = new Image();
      reader.onerror = reject;
      reader.onload = (e: any) => {
        image.src = e.target.result;
      };
      image.onload = () => {
        resolve(image);
      };
      if (file.type.indexOf('image') === 0) {
        reader.readAsDataURL(file);
      }
    });
  }

  static loadImage(file: File) {
    return new Promise<{ height: number; width: number }>((resolve, reject) => {
      const image: HTMLImageElement = new Image();
      image.onerror = reject;
      image.onload = () => {
        resolve({
          ...image,
          height: image.height,
          width: image.width,
        });
      };
      image.src = window.URL.createObjectURL(file);
    });
  }

  /**
   * 根据 url 另存为文件，可以重命名
   * @param url 文件 url
   */
  static async getBlob(url: string) {
    if (!url.includes('http')) {
      throw new Error('文件下载地址有误，必须是一个合法的网络地址。');
    }
    request.defaults.headers.Accept = '*/*';
    return request.get(url, { params: { responseType: 'blob' } });
  }

  static getSizeText(size: number) {
    const mb = 1024 * 1024;
    const gb = 1024 * 1024 * 1024;
    if (size < mb) {
      return `${Math.ceil(size / 1024).toFixed(1)} KB`;
    }
    if (size < gb) {
      return `${Math.ceil(size / mb).toFixed(1)} MB`;
    }
    return `${Math.ceil(size / gb).toFixed(1)} GB`;
  }

  static chunkable = true;
  static checkFile = true;
}
