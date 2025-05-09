import Axios, { AxiosRequestConfig } from 'axios';
import { IFile } from './types';
import BaseFileServer, { IChunkUploadParams } from './BaseFileServer';
import { createRequestClient } from '@/apis/MyApi';
import { VRequestConfig } from '../../../../../lib/vails/request/index';
import { VObject } from '@/lib/vails';

const request = createRequestClient();
let seq = 0;

/**
 * 文件服务模型
 * fileKey = { 文件上传后业务系统负责保存, 一般为 md5 值 }
 * download = { 文件名 } // 业务系统保存
 */
export default class OssFileServer extends BaseFileServer {
  /**
   * 直接上传文件
   * @param file 读取的文件对象
   */
  async upload(fileItem: IFile, config?: AxiosRequestConfig) {
    const { mimeType, fileName, fileSize, file } = fileItem;
    const formData = {
      blob: {
        filename: fileName,
        byte_size: fileSize,
        content_type: mimeType,
        checksum: btoa(await BaseFileServer.toMd5(file, true)),
      },
      limit_identifier: seq++,
    };
    return request.post(`/storage/direct_uploads`, formData, config).then(async res => {
      const postUrl = res.data.direct_upload.url;
      const header = res.data.direct_upload.headers;
      await Axios.put(postUrl, fileItem.file, { headers: header, ...config });
      return res;
    });
  }

  // parseUrl(url: string, fileItem: IFile) {
  //   if (process.env.VUE_APP_FILESERVER_URL_REPLACE_MAP && !!url) {
  //     const map = JSON.parse(process.env.VUE_APP_FILESERVER_URL_REPLACE_MAP);
  //     return Object.keys(map).reduce((out: string, key: string) => {
  //       return out.replace(key, map[key]);
  //     }, url);
  //   }
  //   return url;
  // }

  /**
   * 获取文件下载地址
   * @param fileKey
   * @param fileName
   */
  getDownloadUrl(fileItem: IFile) {
    return this.parseUrl(fileItem.url || '', fileItem);
  }

  /**
   * 获取文件 CDN 地址
   */
  getCDNUrl(fileItem: IFile) {
    return this.parseUrl(fileItem.url || '', fileItem);
  }

  async getFileItem(args: { file: File; chunkSize: number; shouldCompress?: boolean }) {
    try {
      const { file, chunkSize } = args;

      const fileCategory = BaseFileServer.getFileCategory(file);
      const {
        data: { key, uploadId },
      } = await request.post('/storage/multipart', {
        limit_identifier: seq++,
        filename: file.name,
        type: file.type,
      });

      const fileKey: string = key;
      const fileItem: IFile = {
        cdnTag: this.cdnTag,
        file,
        fileKey,
        uploadId,
        fileName: file.name,
        fileSize: file.size,
        fileType: BaseFileServer.getFileType(file.type),
        fileCategory,
        mimeType: file.type,
        chunkSize,
        chunks: Math.ceil(file.size / chunkSize),
        chunkId: 0,
        loaded: 0,
        percent: 0.1,
        status: 'todo',
      };
      if (file.type.includes('image')) {
        const imageData = await BaseFileServer.loadImage(file);
        fileItem.width = imageData.width;
        fileItem.height = imageData.height;
      }
      return Promise.resolve<IFile>(fileItem);
    } catch (error) {
      return Promise.reject(error);
    }
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
  async chunkUpload(params: IChunkUploadParams, config?: VRequestConfig) {
    const { file, fileKey, uploadId, chunkId } = params;

    const {
      data: { url },
    } = await request.post(`/storage/multipart/part`, {
      key: fileKey,
      upload_id: uploadId,
      part_number: chunkId + 1,
    });

    return Axios.put(url, file, config);
  }

  async chunkComplete(fileItem: IFile) {
    const { uploadId, fileKey } = fileItem;
    const infoRes = await request.post(`/storage/multipart/list`, {
      key: fileKey,
      upload_id: uploadId,
    });

    const { data } = await request.post(`/storage/multipart/complete`, {
      key: fileKey,
      parts: infoRes.data,
      upload_id: uploadId,
    });

    fileItem.url = data.location.split('?')[0];
  }

  getThumbnailUrl(fileItem: IFile, width?: number, height?: number): string {
    const { url: originUrl, thumbnail } = fileItem;

    const url = this.parseUrl(originUrl!, fileItem);

    if (url.includes('lushu')) {
      return url;
    }

    if (url.endsWith('.svg')) {
      return url;
    }

    if (thumbnail) {
      return this.getThumbnailUrl(thumbnail, width, height);
    }

    const sizeArguments: string[] = [];
    const query: VObject = {};

    if (url?.includes('aliyuncs')) {
      if (width) {
        sizeArguments.push(`w_${width}`);
      }

      if (height) {
        sizeArguments.push(`h_${height}`);
      }

      if (!width && !height) {
        sizeArguments.push('w_64');
      }
      return `${url}?x-oss-process=image/resize,${sizeArguments.join(',')}`;
    }

    if (width) {
      sizeArguments.push(`w_${width}`);
      query.width = width;
    }

    if (height) {
      sizeArguments.push(`h_${height}`);
      query.height = height;
    }

    if (!width && !height) {
      sizeArguments.push('w_64');
      query.width = 64;
    }

    return `${url}?x-image-process=image/resize,${sizeArguments.join(',')},limit_0&${Object.keys(
      query,
    )
      .map(key => `${key}=${query[key]}`)
      .join('&')}`;
  }

  static chunkable = true;
  static checkFile = false;
  static concurrency = true;
  static needComplete = true;
}
