import { IModuleConf } from '@wangeditor/editor';
import withAttachment from './plugin';
import renderElemConf from './render-elem';
import elemToHtmlConf from './elem-to-html';
import parseHtmlConf from './parse-elem-html';
import { downloadAttachmentMenuConf, deleteAttachmentMenuConf } from './menu';

const uploadAttachmentPluginModule: Partial<IModuleConf> = {
  editorPlugin: withAttachment,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [deleteAttachmentMenuConf, downloadAttachmentMenuConf],
};

export default uploadAttachmentPluginModule;
