<script lang="ts">
import { defineComponent, toRefs, PropType, computed, WritableComputedRef, onMounted } from 'vue';
import { TaTemplateFormLabelConfig } from '@/components/global/ta-component/ta-template-form-core/types';

const TaTemplateFormDesignerLabelConfig = defineComponent({
  name: 'TaTemplateFormDesignerLabelConfig',
  components: {},
  props: {
    value: {
      type: Object as PropType<{ label?: TaTemplateFormLabelConfig }>,
      required: true,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const alignOptions = [
      { label: '左对齐', value: 'left' },
      { label: '居中', value: 'center' },
      { label: '右对齐', value: 'right' },
    ];

    const config: WritableComputedRef<{ label?: TaTemplateFormLabelConfig }> = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    onMounted(() => {
      // if (!config.value?.label) {
      //   config.value.label = {};
      // }
    });

    const layoutOptions = [
      { label: '垂直', value: 'vertical' },
      { label: '左右', value: 'horizontal' },
    ];

    return {
      ...toRefs(props),
      alignOptions,
      layoutOptions,
      config,
    };
  },
});
export default TaTemplateFormDesignerLabelConfig;
</script>

<template lang="pug">
.ta-template-form-designer-label-config
  .group(v-if='config?.label')
    .item
      .label 标题宽度(px)
      a-input-number(v-model:value='config.label.width', placeholder='请输入表单标题宽度', width='100px')
    .item
      .label 标题宽度(em)
      a-input-number(v-model:value='config.label.emWidth', placeholder='请输入表单标题宽度', width='100px')
    .item
      .label 标题对齐
      a-select(:options='alignOptions', v-model:value='config.label.align', placeholder='请选择对齐方式')
    .item
      a-checkbox(v-model:checked='config.label.hidden') 隐藏标题
    .item(v-if='config')
      .label 布局方式
      a-select(
        :options='layoutOptions',
        v-model:value='config.layout',
        placeholder='布局方式'
      )
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-label-config
  .item
    display flex
    justify-content space-between
    padding 5px 0
    .label
      line-height 30px
      color #808080
    .input
      width 150px
</style>
