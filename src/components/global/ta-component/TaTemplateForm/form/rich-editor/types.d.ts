import { SlateElement } from '@wangeditor/editor';

export type ImageElement = SlateElement & {
  src: string;
  alt: string;
  url: string;
  href: string;
};
