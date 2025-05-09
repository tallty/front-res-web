import { Canceler } from 'axios';
export type IFileStatus = 'doing' | 'todo' | 'done' | 'error';

export interface IFile {
  description?: string | undefined;
  version?: string; // 1: 新版本  undefined: 旧版本  2.华为云服务器
  file: File;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  fileCategory: string;
  chunkSize: number; // 分片大小
  chunks: number; // 分片总长度
  chunkId: number; // 当前 chunk 的 索引
  signature?: string;
  downloadPath?: string;
  cdnTag?: 0 | 1;
  width?: number; // 图片
  height?: number; // 图片
  duration?: number; // 时长，秒
  loaded?: number; // === UI 业务属性: 已上传的数据大小
  percent: number; // === UI 业务属性: 上传进度
  status: IFileStatus; // === 业务属性：状态
  url?: string; // === 业务属性：地址
  uploadId?: string;
  category_type?: string; // 文件类型
  thumbnail?: IFile;
  _cancel?: Canceler;
}
