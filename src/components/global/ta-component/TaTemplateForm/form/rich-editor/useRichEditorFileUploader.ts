import { ref } from 'vue';
import { IFile } from '../../../file/servers/types';
import FileServer from '@/components/global/ta-component/file/servers';
import { message } from 'ant-design-vue';

export const useRichEditorFileUploader = () => {
  const fileUploader = ref<any>(null);
  const fileUploaderValue = ref<IFile[]>([]);

  const fileServer = new FileServer();

  const customUpload = async (file: File, insertFn: Function) => {
    if (fileUploader.value) {
      fileUploaderValue.value = [];
      await fileUploader.value
        .handleFileInputChange({ target: { files: [file] } })
        .then(async () => {
          if (fileUploaderValue.value?.[0]) {
            await insertFn(
              fileServer.getCDNUrl(fileUploaderValue.value[0]),
              fileUploaderValue.value[0].fileName,
              fileServer.getCDNUrl(fileUploaderValue.value[0]),
              fileUploaderValue.value[0],
            );
            message.success('上传成功');
          }
        })
        .catch(() => message.error('上传失败'));
    }
  };
  return {
    fileUploader,
    fileUploaderValue,
    customUpload,
  };
};
