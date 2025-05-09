/**
 * @description download attachment menu
 * @author wangfupeng
 */

import { DomEditor, IDomEditor, SlateRange, t } from '@wangeditor/editor';
import { IButtonMenu } from '@wangeditor/editor';
import { AttachmentElement } from '../custom-types';

class DownloadAttachment implements IButtonMenu {
  readonly title = '下载'; //t('attachment.download');
  readonly iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
</svg>`;
  readonly tag = 'button';

  getValue(editor: IDomEditor): string | boolean {
    const attachmentElem = this.getSelectedElem(editor);
    if (attachmentElem == null) return '';
    return attachmentElem.link;
  }

  isActive(editor: IDomEditor): boolean {
    // 任何时候，都不用激活 menu
    return false;
  }

  exec(editor: IDomEditor, value: string | boolean) {
    if (!value) return;
    if (typeof value !== 'string') return;
    window.open(value, '_blank');
  }

  isDisabled(editor: IDomEditor): boolean {
    // const { selection } = editor;
    // if (selection == null) return true;
    // if (SlateRange.isExpanded(selection)) return true; // 选区非折叠，禁用

    // // 未匹配到 attachment node 则禁用
    // const attachmentElem = this.getSelectedElem(editor);
    // if (attachmentElem == null) return true;

    return false;
  }

  private getSelectedElem(editor: IDomEditor): AttachmentElement | null {
    const node = DomEditor.getSelectedNodeByType(editor, 'attachment');
    if (node == null) return null;
    return node as AttachmentElement;
  }
}

export default DownloadAttachment;
