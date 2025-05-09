import FileServer, {
  TaFile,
} from '@/components/global/ta-component/file/servers';
import { Ref } from '@vue/runtime-core';
import { ref } from 'vue';

export interface TaContentFieldValueItem {
  key?: number;
  body: string;
  images: TaFile[];
  videos: TaFile[];
  audios: TaFile[];
  files: TaFile[];
}

export default class ContentFieldFormatter {
  valueRef: Ref<TaContentFieldValueItem[]> = ref([]);
  fileServer = new FileServer();

  constructor(valueRef: Ref<TaContentFieldValueItem[]>) {
    this.valueRef = valueRef;
  }

  get bodyAry() {
    return this.valueRef.value.map((item) => item.body);
  }

  getBodySummary(limit = 50) {
    const result = this.bodyAry
      .join(' ')
      .replace(/<\/?.+?>/g, '')
      .replace(/ /g, '')
      .replace(/&nbsp;/g, '');
    return result.length > 50 ? `${result.slice(0, limit)}...` : result;
  }

  get images() {
    return this.valueRef.value
      .map((item) => item.images)
      .reduce((out, ary) => out.concat(ary), []);
  }

  get imageUrls() {
    return this.images.map(this.parseImage);
  }

  get videos() {
    return this.valueRef.value
      .map((item) => item.videos)
      .reduce((out, ary) => out.concat(ary), []);
  }

  get videoUrls() {
    return this.videos.map(this.parseVideo);
  }

  get audios() {
    return this.valueRef.value
      .map((item) => item.audios)
      .reduce((out, ary) => out.concat(ary), []);
  }

  get audioObjs() {
    return this.audios.map(this.parseAudio);
  }

  get files() {
    return this.valueRef.value
      .map((item) => item.files)
      .reduce((out, ary) => out.concat(ary), []);
  }

  parseImage = (o: TaFile) => this.fileServer.getDownloadUrl(o);

  parseVideo = (o: TaFile) => this.fileServer.getCdnUrl(o);

  parseAudio = (o: TaFile) => ({
    url: this.fileServer.getCdnUrl(o),
    name: o.fileName.replace(
      /\.mp3| \.wma| \.rm| \.wav| \.mid| \.ape| \.flac/,
      ''
    ),
  });
}
