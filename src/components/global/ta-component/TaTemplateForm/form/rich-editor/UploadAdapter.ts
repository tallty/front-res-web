import axios, { AxiosInstance } from 'axios';
import { VObject } from '../../../../../../lib/vails/model/index';
import FileServer from '../../../file/servers';
import { IFile } from '../../../file/servers/types';

const { CancelToken } = axios;
const cdnTag = 1;

export default class UploadAdapter {
  loader: any = {};
  options: VObject = {};
  cancel!: () => void;
  fileServer: typeof FileServer = new FileServer();
  server!: AxiosInstance;

  constructor(loader: any, options: VObject = { headers: {} }) {
    this.loader = loader;
    this.options = options;
    this.cancel = () => {};
    this.fileServer = new FileServer({
      useCdn: true,
    });
    this.server = axios.create({
      headers: {
        ...options.headers,
      },
      onUploadProgress: progressEvent => {
        this.loader.uploadTotal = progressEvent.total;
        this.loader.uploaded = progressEvent.loaded;
      },
    });
  }

  async upload() {
    try {
      const file = await this.loader.file;
      const fileItem: IFile = await this.fileServer.getFileItem({
        file,
        chunkSize: file.size,
        shouldCompress: true,
      });
      const { data } = await this.fileServer.chunkUpload(fileItem, {
        cancelToken: new CancelToken(c => {
          this.cancel = c;
        }),
      });
      return {
        default: this.fileServer.getDownloadUrl({
          ...fileItem,
          ...data,
          chunks: fileItem.chunks, // data.chunks 为已上传的索引数组， fileItem.chunks 为分片数量
          cdnTag,
        }),
      };
    } catch (error) {
      return 'Image Error';
    }
  }

  abort() {
    this.cancel();
  }
}
