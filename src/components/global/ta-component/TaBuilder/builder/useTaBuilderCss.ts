import { computed, watch } from 'vue';
import { TaBuilderCssc } from '../types';
import { VObject } from '../../../../../lib/vails/model/index';

let seq = 0;

const useTaBuilderCss = (props: any) => {
  // 分为 css 与 cssc 两部分，css 将会覆盖 cssc
  // schema.cssc 部分

  const uuid = seq++;

  const csscMapping: VObject = {
    x: 'left: ${value}px;',
    y: 'top: ${value}px;',
    h: 'height: ${value}px !important;',
    w: 'width: ${value}px !important;',
    zIndex: 'z-index: ${value};',
    justifyContent: 'justify-content: ${value};',
    alignItems: 'align-items: ${value};',
    flexDirection: 'flex-direction: ${value};',
  };

  const cssCompiler = (cssc: TaBuilderCssc & VObject): string => {
    // console.log(cssc, 'cssc');

    const basicCss = Object.keys(cssc)
      .map((key: string) =>
        csscMapping[key] && cssc[key] ? csscMapping[key].replace('${value}', cssc[key]) : null,
      )
      .filter((i: string | null) => i)
      .join('\n');

    return `${basicCss}`;
  };

  const csscStr = computed(() => {
    return cssCompiler(props.componentSchema.cssc || {});
  });

  // schema.css 部分
  const cssId = computed(() => `_css_${props.componentSchema.key}_${uuid}`);

  const generateCssClass = () => {
    // 防止在设计器中 偏移
    let typeCss = 'position: absolute;';
    if (props.componentSchema.cssc?.type === 'normal') typeCss = 'position: relative;';

    if (props.componentSchema.css || csscStr.value) {
      const existDom = document.getElementById(cssId.value);
      const style = existDom || document.createElement('style');
      (style as any).type = 'text/css';
      style.id = cssId.value;
      style.innerHTML = `
        .${cssId.value} { ${csscStr.value} }
        [class*="_css_preview"] .${cssId.value} { ${typeCss} }
        ${props.componentSchema.css?.replace(/:root/g, `.${cssId.value}`) || ''}
      `;

      // console.log(style.innerHTML, 'innerHTML');

      if (!existDom) document.getElementsByTagName('head')[0].appendChild(style);
    }
  };

  watch(() => [props.componentSchema.css, props.componentSchema.cssc], generateCssClass, {
    deep: true,
    immediate: true,
  });

  return { cssId };
};

export default useTaBuilderCss;
