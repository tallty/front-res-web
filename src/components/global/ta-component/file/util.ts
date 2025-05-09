export const fileMap: Record<string, string> = {
  excel: ' https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/icon/excel.png',
  image: ' https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/icon/img.png',
  folder: 'https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/icon/floder.png',
  link: ' https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/icon/link.png',
  nan: ' https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/icon/nan.png',
  ppt: ' https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/icon/ppt.png',
  rar: ' https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/icon/rar.png',
  text: ' https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/icon/text.png',
  video: ' https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/icon/video.png',
  audio: ' https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/icon/audio.png',
  word: ' https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/icon/word.png',
  pdf: ' https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/icon/pdf.png',
};
export const words = ['doc', 'docx'];
export const excels = ['xls', 'xlsx', 'xlsm', 'et'];
export const ppts = ['pptx', 'pptm', 'ppt'];
export const pdfs = ['pdf'];
export const txts = ['txt', 'text'];
export const rars = ['rar', 'zip', '7z', 'tar', 'gz', 'bz2'];
export const getFileFType = (v: any) => {
  const type = v.fileCategory;

  if (type === 'video') return 'video';
  if (type === 'audio') return 'audio';
  if (type === 'image') return 'image';
  if (type === 'application') {
    const fileExtension = v.fileName.split('.').pop().toLowerCase();
    if (words.includes(fileExtension)) return 'word';
    if (excels.includes(fileExtension)) return 'excel';
    if (ppts.includes(fileExtension)) return 'ppt';
    if (pdfs.includes(fileExtension)) return 'pdf';
    if (txts.includes(fileExtension)) return 'word';
    if (rars.includes(fileExtension)) return 'rar';
  }
  return 'nan';
};

export const getFileDefaultImg = (v: any) => {
  return fileMap[getFileFType(v)];
};

export const getFileType = (v: any) => {
  if (v.type === 'Disk::Folder') return fileMap.folder;
  let type = v.ftype;
  if (!type) return fileMap.nan;
  if (type && fileMap?.[type]) return fileMap[type];

  type = v.rawData.attachment.files[0].fileCategory;

  if (type === 'video') return fileMap.video;
  if (type === 'audio') return fileMap.audio;
  if (type === 'image') return fileMap.image;
  if (type === 'application') {
    const fileExtension = v.rawData.attachment.files[0].fileName.split('.').pop().toLowerCase();
    if (words.includes(fileExtension)) return fileMap.word;
    if (excels.includes(fileExtension)) return fileMap.excel;
    if (ppts.includes(fileExtension)) return fileMap.ppt;
    if (pdfs.includes(fileExtension)) return fileMap.pdf;
    if (txts.includes(fileExtension)) return fileMap.word;
    if (rars.includes(fileExtension)) return fileMap.rar;
  }
  return fileMap.nan;
};

export const getUploadFileType = (v: any) => {
  const type = v.fileCategory;
  if (type === 'video') return fileMap.video;
  if (type === 'audio') return fileMap.audio;
  if (type === 'image') return fileMap.image;
  if (type === 'application') {
    const fileExtension = v.fileName.split('.').pop().toLowerCase();
    if (words.includes(fileExtension)) return fileMap.word;
    if (excels.includes(fileExtension)) return fileMap.excel;
    if (ppts.includes(fileExtension)) return fileMap.ppt;
    if (pdfs.includes(fileExtension)) return fileMap.pdf;
    if (txts.includes(fileExtension)) return fileMap.word;
    if (rars.includes(fileExtension)) return fileMap.rar;
  }
  return fileMap.nan;
  // else {
  //   const fileType = v.rawData.attachment.files[0].fileCategory;
  //   console.log(fileType);
  //   return fileMap[fileType];
  // }
};

type FileBuffer = Uint8Array | null;

export const isImage = (buf: FileBuffer): string | null => {
  const pngMagic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const jpeg_jfif = [0x4a, 0x46, 0x49, 0x46];
  const jpeg_exif = [0x45, 0x78, 0x69, 0x66];
  const jpegMagic = [0xff, 0xd8, 0xff, 0xe0];
  const gifMagic0 = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61];
  const gifMagic1 = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];

  const isGif = (data: number[]): boolean =>
    arrayEquals(data, gifMagic0) || arrayEquals(data, gifMagic1);
  const isJpeg = (data: number[]): boolean =>
    arrayEquals(data, jpegMagic) || arrayEquals(data, jpeg_jfif) || arrayEquals(data, jpeg_exif);
  const isPng = (data: number[]): boolean => arrayEquals(data, pngMagic);

  const arraycopy = (
    src: Uint8Array,
    index: number,
    dist: number[],
    distIndex: number,
    size: number,
  ): void => {
    for (let i = 0; i < size; i++) {
      dist[distIndex + i] = src[index + i];
    }
  };

  const arrayEquals = (arr1: number[], arr2: number[]): boolean => {
    if (!arr1 || !arr2) {
      return false;
    }
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  };

  if (!buf || buf.length < 8) {
    return null;
  }

  let bytes: number[] = [];
  arraycopy(buf, 0, bytes, 0, 6);
  if (isGif(bytes)) {
    return 'image/gif';
  }

  bytes = [];
  arraycopy(buf, 6, bytes, 0, 4);
  if (isJpeg(bytes)) {
    return 'image/jpeg';
  }

  bytes = [];
  arraycopy(buf, 0, bytes, 0, 8);
  if (isPng(bytes)) {
    return 'image/png';
  }

  return null;
};

export const checkImage = (file: File): Promise<string | null> => {
  if (!file) throw new Error('文件不存在');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = evt => {
      const fileBuf = new Uint8Array((evt.target?.result as ArrayBuffer).slice(0, 11));
      const mime = isImage(fileBuf);
      resolve(mime);
    };
    reader.onerror = () => {
      resolve(null);
    };
    reader.readAsArrayBuffer(file);
  });
};

export interface ImgFileInfo {
  success: boolean;
  width?: number;
  height?: number;
}

export const getImgFileInfo = (file: File): Promise<ImgFileInfo> => {
  if (!file) throw new Error('文件不存在');

  return new Promise((resolve, reject) => {
    const url = window.URL || window.webkitURL;
    const img = new Image();
    img.src = url.createObjectURL(file);
    img.onload = () => resolve({ success: true, width: img.width, height: img.height });
    img.onerror = () => resolve({ success: false });
  });
};
