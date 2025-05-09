<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { normalLayoutTemplate } from './normalLayoutTemplate';

const TaTemplateFormDesignerGlobalConfig = defineComponent({
  name: 'TaTemplateFormDesignerGlobalConfig',
  components: {},
  props: {
    value: { type: Object as PropType<TaTemplateFormItem>, required: true },
  },
  setup(props, { emit }) {
    const field = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    // if (!field.value.options) {
    //   field.value.options = {};
    // }

    // if (!field.value.model) {
    //   field.value.model = {};
    // }

    return {
      ...toRefs(props),
      field,
      normalLayoutTemplate,
    };
  },
});
export default TaTemplateFormDesignerGlobalConfig;
</script>

<template lang="pug">
.ta-template-form-designer-global-config
  .config-content
    .form
      .form
        TaTemplateFormDesignerLabelConfig(v-model:value='field.options')
      TaTemplateForm(
        v-if='field.options',
        v-model:modelValue='field.options',
        :template='normalLayoutTemplate'
      )
      template(v-if='field.model?.create_default_value')
        .form-item
          .form-item-label 创建时默认值
          TaJsonEditorWithButton(v-model:value='field.model.create_default_value')
        .form-item
          .form-item-label 编辑时默认值
          TaJsonEditorWithButton(v-model:value='field.model.update_default_value')

</template>

<style lang="stylus" scoped>
.ta-template-form-designer-global-config
  overflow auto
  padding 15px 20px 20px
  width 300px
  background #fff
  transition all 1s cubic-bezier(0.645, 0.045, 0.355, 1)
  .config-header
    font-weight 400
    font-size 14px
    line-height 25px
  .config-content
    width 100%
    .form
      width 100%
      .form-item
        margin 10px 0
        width 100%
        display flex
        justify-content space-between
        .form-item-label
          margin-bottom 8px
          color #808080
          font-weight 400
          font-size 14px
          line-height 20px
</style>
