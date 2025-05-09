<script lang="ts">
import { ref, defineComponent, toRefs, computed, PropType } from 'vue';
import '@he-tree/vue3/dist/he-tree-vue3.css';
import { BaseTree } from '@he-tree/vue3';
import {
  TaTemplateFormItem,
  TaTemplateFormAccessibility,
} from '@/components/global/ta-component/ta-template-form-core/types';
import useProcessFields from '@/components/global/ta-component/ta-template-form-core/useProcessFields';
import { VObject } from '@/lib/vails/model';

const TaTemplateFormDesignerAccessibilityEditor = defineComponent({
  name: 'TaTemplateFormDesignerAccessibilityEditor',
  components: {
    BaseTree,
  },
  props: {
    value: { type: Object, default: undefined },
    form: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
  },
  setup(props, { emit }) {
    const accessibility = computed({
      get: () =>
        (props.value?.fields || []).reduce((out: VObject, obj: TaTemplateFormAccessibility) => {
          out[obj.key] = obj.accessibility;
          return out;
        }, {}),
      set: val =>
        emit('update:value', {
          fields: Object.keys(val).map((key: string) => ({ key, accessibility: val[key] })),
        }),
    });

    const { getFieldsTree, getKey } = useProcessFields();

    const treeData = computed(() => [getFieldsTree(props.form || {})]);

    const onUpdateAccessibility = (node: any, val: any) => {
      accessibility.value = { ...accessibility.value, [getKey(node)]: val };
    };

    return {
      ...toRefs(props),
      accessibility,
      treeData,
      getKey,
      onUpdateAccessibility,
    };
  },
});
export default TaTemplateFormDesignerAccessibilityEditor;
</script>

<template lang="pug">
.ta-template-designer-accessibility-editor
  .header
    .name 表单项
    .radios
      .radio 不可见
      .radio 读写
      .radio 只读

  BaseTree(:treeData='treeData', childrenKey='fields')
    template(#default='{ node, tree }')
      .line(v-if='node.name')
        p1 {{ node.name }}
        a-radio-group.radios(
          v-if='!["condition", "layout"].includes(node.type)',
          :value='accessibility[getKey(node)]',
          @update:value='onUpdateAccessibility(node, $event)'
          name='accessibility-radio'
        )
          .radio
            a-radio(value='hidden')
          .radio
            a-radio(value='read_and_write')
          .radio
            a-radio(value='readonly')


</template>

<style lang="stylus" scoped>
.ta-template-designer-accessibility-editor
  .header
    display flex
    justify-content space-between
    color #000
    font-weight 500
    font-size 16px
    padding 16px
    .name
      display flex
      justify-content center
      flex-grow 1
  >>> .vl-item
    border-top 1px solid #EEEEEE

.radios
  flex-shrink 0
  display flex
  .radio
    width 100px
    display flex
    justify-content center
    align-items center

.line
  padding 16px
  display flex
  justify-content space-between
  color rgba(0, 0, 0, .65)
  font-size 16px
</style>
