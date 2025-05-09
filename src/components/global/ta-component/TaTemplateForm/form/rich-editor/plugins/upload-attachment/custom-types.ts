/**
 * @description attachment element
 */

type EmptyText = {
  text: '';
};

export type AttachmentElement = {
  type: 'attachment';
  fileName: string;
  mimeType: string;
  link: string;
  children: EmptyText[];
};
