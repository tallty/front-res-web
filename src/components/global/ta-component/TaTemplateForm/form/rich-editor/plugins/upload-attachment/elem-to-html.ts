/**
 * @description elem to html
 */

import { SlateElement } from '@wangeditor/editor';
import { AttachmentElement } from './custom-types';

// 生成 html 的函数
export function attachmentToHtml(
  elem: SlateElement,
  // childrenHtml: string
): string {
  const { link = '', fileName = '', mimeType = '' } = elem as AttachmentElement;
  return `<span data-w-e-type="attachment" data-w-e-is-void data-w-e-is-inline data-link="${link}" data-fileName="${fileName}" data-mimeType="${mimeType}">${fileName}</span>`;
}

// 配置
const conf = {
  type: 'attachment', // 节点 type ，重要！！！
  elemToHtml: attachmentToHtml,
};

export default conf;
