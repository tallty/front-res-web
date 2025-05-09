import type { IFile } from './types';

let fileServerMode = 'base';
try {
  fileServerMode = process.env.VUE_APP_FILESERVER_MODE || fileServerMode;
} catch {
  // import('./env.vite.vue').then(
  //   res => (fileServerMode = (res.default as unknown) as string) || fileServerMode,
  // );
}

import BaseFileServer from './BaseFileServer';
import KqFileServer from './KqFileServer';
import OssFileServer from './OssFileServer';

const fileServerMapping: Record<string, any> = {
  base: BaseFileServer,
  kq: KqFileServer,
  oss: OssFileServer,
};

type TaFile = IFile;

export { IFile, fileServerMode, fileServerMapping, TaFile };
export default fileServerMapping[fileServerMode];
