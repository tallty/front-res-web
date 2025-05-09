export default function useClipboard() {
  const copyToClipboard = (text: string): Promise<boolean> => {
    if (!text) return Promise.resolve(false);
    return new Promise(resolve => {
      // 支持 Clipboard API 的浏览器
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            fallbackCopyTextToClipboard(text, resolve);
          });
      } else {
        fallbackCopyTextToClipboard(text, resolve);
      }
    });
  };

  // 不支持 Clipboard API 的浏览器
  const fallbackCopyTextToClipboard = (text: string, resolve: (value: boolean) => void) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // 避免滚动到底部
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      resolve(successful);
    } catch (err) {
      console.error('复制文本失败: ', err);
      resolve(false);
    }

    document.body.removeChild(textArea);
  };

  return {
    copyToClipboard,
  };
}
