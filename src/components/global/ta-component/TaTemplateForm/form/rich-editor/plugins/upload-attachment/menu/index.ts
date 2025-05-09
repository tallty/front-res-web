/**
 * @description attachment menu entry
 */

import DeleteAttachment from './DeleteAttachment';
// import ViewAttachmentLink from './ViewAttachmentLink';
//  import { genAttachmentMenuConfig } from './config'
import DownloadAttachment from './DownloadAttachment';

//  const config = genAttachmentMenuConfig() // menu config

//  export const insertAttachmentMenuConf = {
//    key: 'insertAttachment',
//    factory() {
//      return new InsertAttachment()
//    },

//    // 默认的菜单菜单配置，将存储在 editorConfig.MENU_CONF[key] 中
//    // 创建编辑器时，可通过 editorConfig.MENU_CONF[key] = {...} 来修改
//    config,
//  }

export const deleteAttachmentMenuConf = {
  key: 'DeleteAttachment',
  factory() {
    return new DeleteAttachment();
  },
};

export const downloadAttachmentMenuConf = {
  key: 'DownloadAttachment',
  factory() {
    return new DownloadAttachment();
  },
};

// export const editAttachmentMenuConf = {
//   key: 'editAttachment',
//   factory() {
//     return new EditAttachment();
//   },
//   config,
// };

// export const viewAttachmentLinkMenuConf = {
//   key: 'viewAttachmentLink',
//   factory() {
//     return new ViewAttachmentLink();
//   },
// };

// export const AttachmentWidth30MenuConf = {
//   key: 'AttachmentWidth30',
//   factory() {
//     return new AttachmentWidth30();
//   },
// };

// export const AttachmentWidth50MenuConf = {
//   key: 'AttachmentWidth50',
//   factory() {
//     return new AttachmentWidth50();
//   },
// };

// export const AttachmentWidth100MenuConf = {
//   key: 'AttachmentWidth100',
//   factory() {
//     return new AttachmentWidth100();
//   },
// };
