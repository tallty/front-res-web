/**
 * @description parse elem html
 */

import { SlateElement } from '@wangeditor/editor';
import { DOMElement } from '@wangeditor/editor/dist/editor/src/utils/dom';
import { AttachmentElement } from './custom-types';

function parseHtml(
  elem: DOMElement,
  // children: SlateDescendant[],
  // editor: IDomEditor,
): SlateElement {
  const link = elem.getAttribute('data-link') || '';
  const fileName = elem.getAttribute('data-fileName') || '';
  const mimeType = elem.getAttribute('data-mimeType') || '';
  return {
    type: 'attachment',
    link,
    fileName,
    mimeType,
    children: [{ text: '' }], // void node 必须有一个空白 text
  } as AttachmentElement;
}

const parseHtmlConf = {
  selector: 'span[data-w-e-type="attachment"]',
  parseElemHtml: parseHtml,
};

export default parseHtmlConf;
