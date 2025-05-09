<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  toRefs,
  watch,
  PropType,
} from 'vue';
import { Keyboarder } from '../../Keyboarder';
import { baseTemplate } from '../configs/baseTemplate';
import templates from '../configs/templates';
import { eventTemplateFn } from './eventTemplate';
import { injectTaBuilderDesignerActiveItem } from './useActiveItem';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import { useScreenDesignerConfigInject } from '../builder/useScreenDesignerConfig';

const TaBuilderDesignerConfig = defineComponent({
  name: 'TaBuilderDesignerConfig',
  components: {},
  props: {
    keywordTemplate: {
      type: Object as PropType<TaTemplateFormItem>,
      default: () => ({}),
    },
  },
  setup(props) {
    // const customConfig = ref<TaTemplateFormItem | null>({});
    const { activeItem, activeItemMeta } = injectTaBuilderDesignerActiveItem();

    const visibleCustomConfig = ref(false);

    const customConfig = computed(() => {
      if (activeItem?.value?.component) {
        return (
          templates[`${activeItem.value.component}Template`] ||
          activeItemMeta?.value?.componentRef?.__template
        );
      } else {
        return null;
      }
    });

    const activeItemCache = ref(activeItem!.value);

    watch(customConfig, () => {
      // 重新渲染表单
      activeItemCache.value = {};
      visibleCustomConfig.value = false;
      nextTick(() => {
        visibleCustomConfig.value = true;
        activeItemCache.value = activeItem!.value;
      });
    });

    const descendantTemplates = computed(() => {
      if (
        activeItem?.value?.component &&
        activeItemMeta?.value?.componentRef?.descendantTemplates
      ) {
        return activeItemMeta.value.componentRef.descendantTemplates;
      }
      return null;
    });

    const keyboarder = new Keyboarder();

    keyboarder.persistent('down arrow', ['shift'], () => {
      if (typeof activeItem?.value?.cssc?.y === 'number') activeItem.value.cssc.y++;
    });

    keyboarder.persistent('up arrow', ['shift'], () => {
      if (typeof activeItem?.value?.cssc?.y === 'number') activeItem.value.cssc.y--;
    });

    keyboarder.persistent('right arrow', ['shift'], () => {
      if (typeof activeItem?.value?.cssc?.x === 'number') activeItem.value.cssc.x++;
    });

    keyboarder.persistent('left arrow', ['shift'], () => {
      if (typeof activeItem?.value?.cssc?.x === 'number') activeItem.value.cssc.x--;
    });

    onMounted(() => keyboarder.connect());
    onUnmounted(() => keyboarder.disconnect());

    const { dataSourceSelect } = useScreenDesignerConfigInject();
    const eventTemplate = computed(() => eventTemplateFn(dataSourceSelect.value));

    return {
      ...toRefs(props),
      customConfig,
      activeItem,
      baseTemplate,
      visibleCustomConfig,
      descendantTemplates,
      eventTemplate,
      activeItemCache,
    };
  },
});
export default TaBuilderDesignerConfig;
</script>

<template lang="pug">
.ta-search-designer-config.h-full.overflow-y-auto
  //- a-button(type='primary', @click='activeItem = {}') reset
  TaTemplateForm(v-model:modelValue='activeItem', :template='baseTemplate')
  .p-4(v-if='activeItem?.component === "TaLayer"')
    .text-gray-400.py-2 水平对齐
    TaBuilderDesignerAlignTool(v-model:value='activeItem.cssc', direction='horizontal')
    .text-gray-400.py-2 垂直对齐
    TaBuilderDesignerAlignTool(v-model:value='activeItem.cssc', direction='vertical')
  TaTemplateForm(v-model:modelValue='activeItem', :template='eventTemplate')
  TaTemplateForm(
    v-if='visibleCustomConfig && customConfig',
    v-model:modelValue='activeItemCache',
    :key='activeItem.key',
    :template='customConfig'
  )
  template(v-for='templateConfig in descendantTemplates')
    .text-gray-400.py-2 {{ templateConfig.label }}
    TaTemplateForm(
      v-if='visibleCustomConfig && templateConfig.template',
      v-model:modelValue='templateConfig.value',
      :template='templateConfig.template'
    )
  TaBuilderConditionTool(
    v-if='activeItem.component === "TaConditionLayer"',
    v-model:activeItem='activeItem',
    :keywordTemplate='keywordTemplate',
  )
</template>

<style lang="stylus" scoped>
.ta-search-designer-config
  width 250px
  >>> .ta-template-form-field__item
    margin 0
  >>> .ta-template-form-field
    padding 0.5rem 0.25rem
</style>
