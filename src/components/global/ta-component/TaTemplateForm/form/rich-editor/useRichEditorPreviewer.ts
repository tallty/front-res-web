import { reactive } from 'vue';
import { IFile } from '../../../file/servers/types';
import { TaRichEditorEmitter } from './emitter';

const OPEN_PREVIEW = 'TA_RICH_EDITOR_OPEN_PREVIEW';

interface taRichEditorPreviewerConfigInterface {
  fileItem: {
    url?: string;
    fileName?: string;
    mimeType?: string;
  };
  visible: boolean;
}

export const useRichEditorPreviewerTrigger = (componentSeq: number) => {
  const taRichEditorPreviewerConfig = reactive<taRichEditorPreviewerConfigInterface>({
    fileItem: {
      url: '',
      fileName: '',
      mimeType: '',
    },
    visible: false,
  });

  const key = `${OPEN_PREVIEW}::${componentSeq}`;

  const handler = (e?: { fileItem: Partial<IFile> }) => {
    if (e) {
      taRichEditorPreviewerConfig.fileItem = e.fileItem;
      taRichEditorPreviewerConfig.visible = true;
    }
  };

  const defineEmitter = () => {
    TaRichEditorEmitter.on(key, handler);
  };

  const triggerEmitter = (fileItem: Partial<IFile>) => {
    TaRichEditorEmitter.emit(key, { fileItem });
  };

  return { taRichEditorPreviewerConfig, defineEmitter, triggerEmitter };
};
