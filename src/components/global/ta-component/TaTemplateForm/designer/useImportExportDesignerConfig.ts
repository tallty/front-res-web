import { message } from 'ant-design-vue';
import ClipboardJS from 'clipboard';

const useSystemClipboard = () => {
  const copyToClipboard = (selector: string, valueFunc: () => string) => {
    const clipboard = new ClipboardJS(selector, {
      text: valueFunc,
    });

    clipboard.on('success', e => {
      message.success('复制成功');
      e.clearSelection();
    });

    clipboard.on('error', () => {
      message.success('复制失败');
    });
  };

  const pasteFormClipboardAsync = (validate: (data: string) => boolean) => {
    return new Promise<string>((resolve, reject) => {
      navigator.clipboard.readText().then(str => {
        if (validate(str)) {
          resolve(str);
        } else {
          message.error('内容格式验证失败');
          reject();
        }
      });
    });
  };

  return {
    copyToClipboard,
    pasteFormClipboardAsync,
  };
};

export default useSystemClipboard;
