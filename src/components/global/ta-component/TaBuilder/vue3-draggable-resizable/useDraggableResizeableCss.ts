import { VObject } from '@/lib/vails/model/index';

let seq = 0;

const useDraggableResizeableCss = () => {
  // 分为 css 与 cssc 两部分，css 将会覆盖 cssc
  // schema.cssc 部分

  const uuid = seq++;

  // schema.css 部分
  const cssId = `_css_draggable_resizeable_${uuid}`;

  const generateCssClass = (cssObj: VObject) => {
    const cssStr = Object.keys(cssObj).reduce((out: string, key: string) => {
      return [out, [key, cssObj[key]].join(':')].join(';');
    }, '');
    const existDom = document.getElementById(cssId);
    const style = existDom || document.createElement('style');
    (style as any).type = 'text/css';
    style.id = cssId;
    style.innerHTML = `
        .${cssId} { ${cssStr} }
      `;

    if (!existDom) document.getElementsByTagName('head')[0].appendChild(style);
  };

  return { generateCssClass, cssId };
};

export default useDraggableResizeableCss;
