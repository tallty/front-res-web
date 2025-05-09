<script lang="ts">
import { defineComponent, toRefs, PropType, ref } from 'vue';
import { userConditionPartialItem } from '../form/TaTemplateFormConditionFormSelectorTemplate';
import {
  TaTemplateFormComplexCondition,
  TaTemplateFormItem,
  TaTemplateFormComplexConditionItem,
} from '../../ta-template-form-core/types';
import { cloneDeep } from 'lodash';
import useProcessFields from '@/components/global/ta-component/ta-template-form-core/useProcessFields';

const TaTemplateFormDesignerComplexConditionDesc = defineComponent({
  name: 'TaTemplateFormDesignerComplexConditionDesc',
  components: {},
  props: {
    complexCondition: {
      type: Object as PropType<TaTemplateFormComplexCondition>,
      default: () => ({}),
    },
  },
  setup(props) {
    const getItemTemplate = (item: TaTemplateFormComplexConditionItem) => {
      return {
        ...item.desc?.template,
        options: { ...item.desc?.template?.options, theme: 'none', layout: 'horizontal' },
        fields:
          item.desc?.template?.fields?.map((i: TaTemplateFormItem) => ({
            ...i,
            options: { ...i.options, span: 24 },
          })) || [],
      };
    };

    const { processField } = useProcessFields();
    const descUserConditionPartialItem = ref(cloneDeep(userConditionPartialItem));

    processField(descUserConditionPartialItem.value, (item: TaTemplateFormItem) => {
      // item.name = undefined;
      if (!item.options) item.options = {};
      item.options.theme = 'none';
      item.options.span = 24;
      item.options.layout = 'horizontal';
    });

    return {
      ...toRefs(props),
      getItemTemplate,
      descUserConditionPartialItem,
    };
  },
});
export default TaTemplateFormDesignerComplexConditionDesc;
</script>

<template lang="pug">
.ta-template-form-designer-complex-condition-desc.flex(v-if='complexCondition')
  .condition-group.flex.flex-wrap.flex-grow(v-for='(group, groupIndex) in complexCondition.groups')
    a-tag(v-if='groupIndex !== 0') 或
    .condition-item.flex-grow(v-for='(item, itemIndex) in group.items')
      a-tag(v-if='itemIndex === 0') 当
      a-tag(v-else) 且
      template(v-if='item.desc')
        span {{ item.desc.name }}&nbsp
        a-tag {{ item.desc.optZh }}
        TaTemplateFormViewer.viewer(
          :modelValue='item.desc.modelValue',
          :template='getItemTemplate(item)',
        )
      template(v-else)
        TaTemplateFormViewer.flex.flex-wrap(
          :modelValue='item',
          :template='descUserConditionPartialItem'
        )
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-complex-condition-desc
  padding 5px 0
  line-height 32px
  .condition-group
    display flex
    align-items center
    flex-wrap wrap
    margin-bottom 10px
    &:last-child
      margin-bottom 0
    .condition-item
      display flex
      align-items center
      flex-wrap wrap
  >>> .ta-template-form-field__item
    margin-bottom 0
  .viewer
    >>> .ta-template-form-viewer
      display inline-block
      flex-shrink 0
      height 32px
      >>> .ant-col-12
        max-width 100%
        flex 0 0 100%
    >>> .ant-row
      height 32px
    >>> .ta-template-form-field
      padding 0
      flex-shrink 0
    >>> .ant-form-item
      margin 0
    >>> .ta-template-form-field
      margin 0
    >>> .ant-form-item
      margin-bottom 0
    >>> .ant-form-item-no-colon
      display none
</style>
