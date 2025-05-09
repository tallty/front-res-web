<script lang="ts">
import { defineComponent, PropType, computed, ref, toRefs, watch } from 'vue';
import { TaSelectableFieldProps } from './selectable/TaSelectableField.vue';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import { jsonataGet } from '../../ta-template-form-core/useJsonata';

const TaApiTreeField = defineComponent({
  name: 'TaApiTreeField',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    value: { type: Array as PropType<number[]>, default: () => [] },
    path: { type: String, default: '' },
    ransackStr: { type: String, default: '' },
    bookSelectionConfig: { type: Array, default: undefined },
    ...TaSelectableFieldProps,
  },
  // emits: ['onSelect', 'update:value', 'open', 'ok', 'cancel', 'tabChange', 'show', 'selectedAdd'],
  setup(props, { emit }) {
    return {
      ...toRefs(props),
      jsonataGet,
    };
  },
});
export default TaApiTreeField;
</script>

<template lang="pug">
.ta-api-tree-field
  TaApiField(
    v-bind='$props',
  )
    template(#card='{ record, index, no, isActive, actions }')
      .flex
        .item.text-base.text-gray-900(
          v-for='(column, index) in tableItems',
          :class='{ "text-sm": index > 0, "text-gray-500": index > 0, "font-bold": index === 0 }'
        )
          TableRendersAuto(:value='jsonataGet(record, column.dataIndex.join("."))', :record='record', :index='index')

    template(#tags='{ records, actions }')
      slot(name='tags', :records='records', :actions='actions')

    template(#tag-text='{ record }')
      slot(name='tag-text', :record='record')

    template(#display='{ open }')
      slot(name='display', :open='open')

    template(#selected-display='{ record, index, attrs }')
      slot(name='selected-display', :record='record', :index='index', :attrs='attrs')

    template(#modal-header-left)
      slot(name='modal-header-left')

    template(#modal-header-right)
      slot(name='modal-header-right')

    template(#modal-header)
      slot(name='modal-header')

    template(#right-actions)
      slot(name='right-actions')
</template>

<style lang="stylus" scoped></style>
