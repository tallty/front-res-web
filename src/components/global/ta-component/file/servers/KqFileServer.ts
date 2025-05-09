import { createRequestClient } from '@/apis/MyApi';
import { AxiosRequestConfig } from 'axios';
import { IFile } from './types';
import BaseFileServer from './BaseFileServer';
import Axios from 'axios';

const kqRequest = createRequestClient('https://peacock-api.oppo.com/rails/active_storage');

export interface KqFile {
  attachable_sgid: string;
  byte_size: number;
  checksum: string;
  content_type: string;
  created_at: string;
  direct_upload: {
    headers: Record<string, string>;
    url: string;
  };
  filename: string;
  id: number;
  key: string;
  metadata?: Record<string, any>;
  service_name: string;
  signed_id: string;
  url: string;
}
/**
 * 文件服务模型
 * fileKey = { 文件上传后业务系统负责保存, 一般为 md5 值 }
 * download = { 文件名 } // 业务系统保存
 */
export default class KqFileServer extends BaseFileServer {
  /**
   * 直接上传文件
   * @param file 读取的文件对象
   */
  upload(fileItem: IFile, config?: AxiosRequestConfig) {
    const { mimeType, fileName, fileSize } = fileItem;
    const formData = {
      blob: {
        filename: fileName,
        byte_size: fileSize,
        content_type: mimeType,
        checksum: '',
      },
    };
    return kqRequest.post(`/direct_uploads`, formData, config).then(async res => {
      const postUrl = res.data.direct_upload.url;
      const header = res.data.direct_upload.headers;
      await Axios.put(postUrl, fileItem.file, { headers: header });
      return res;
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
  chunkUpload(params: any, config?: any) {
    return this.upload(params, config);
  }

  /**
   * 获取文件下载地址
   * @param fileKey
   * @param fileName
   */
  getDownloadUrl(fileItem: IFile & KqFile) {
    return fileItem.url;
  }

  /**
   * 获取文件 CDN 地址
   */
  getCDNUrl(fileItem: IFile & KqFile) {
    return fileItem.url;
  }

  getThumbnailUrl(fileItem: IFile & KqFile, width?: number, height?: number) {
    return fileItem.url;
  }

  static chunkable = false;
  static checkFile = false;
}
