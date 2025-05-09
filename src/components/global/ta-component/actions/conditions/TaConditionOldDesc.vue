<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';

const TaConditionOldDesc = defineComponent({
  name: 'TaConditionOldDesc',
  components: {},
  props: {
    desc: { type: Object, default: () => ({}) },
  },
  setup(props) {
    const getDescValueTemplate = (item: TaTemplateFormItem) => {
      return {
        ...item,
        model_key: 'val',
        model_key_prefix: 'rule',
        options: { ...item?.options, theme: 'none', layout: 'horizontal' },
        fields:
          item?.fields?.map((i: TaTemplateFormItem) => ({
            ...i,
            options: { ...i?.options, span: 24 },
            model_key: 'val',
            model_key_prefix: 'rule',
          })) || [],
      };
    };

    return {
      ...toRefs(props),
      getDescValueTemplate,
    };
  },
});
export default TaConditionOldDesc;
</script>

<template lang="pug">
.ta-condition-old-desc.flex.items-center
  .mr-2 {{ desc.name }}
  a-tag {{ desc.optZh }}
  TaTemplateFormViewer.viewer(
    v-if='desc.template?.fields?.filter(i => i)?.length > 0',
    :modelValue='desc.modelValue || {}',
    :template='getDescValueTemplate(desc.template)'
  )
  div(v-else) {{ desc.modelValue?.rule?.val }}
</template>

<style lang="stylus" scoped>
.ta-condition-old-desc
  .viewer
    >>> .ta-template-form-viewer
      display inline-block
      width 0
      flex-grow 1
      flex-shrink 0
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
    >>> .ta-template-form-theme-card__default
      background transparent
</style>
