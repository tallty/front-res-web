/**
 * @description delete Attachment menu
 */

import { Transforms } from 'slate';
import { IButtonMenu, IDomEditor, DomEditor, t } from '@wangeditor/core';

class DeleteAttachment implements IButtonMenu {
  readonly title = '删除'; // t('Attachment.delete')
  readonly iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
</svg>`;
  readonly tag = 'button';

  getValue(editor: IDomEditor): string | boolean {
    // 无需获取 val
    return '';
  }

  isActive(editor: IDomEditor): boolean {
    // 无需 active
    return false;
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) return true;

    const AttachmentNode = DomEditor.getSelectedNodeByType(editor, 'attachment');
    if (AttachmentNode == null) {
      // 选区未处于 Attachment node ，则禁用
      return true;
    }
    return false;
  }

  exec(editor: IDomEditor, value: string | boolean) {
    if (this.isDisabled(editor)) return;

    // 删除图片
    Transforms.removeNodes(editor, {
      match: n => DomEditor.checkNodeType(n, 'attachment'),
    });
  }
}

export default DeleteAttachment;
