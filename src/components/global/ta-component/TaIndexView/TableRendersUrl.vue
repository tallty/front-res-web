<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { TaTemplateFormItem, TaTemplateFormSelect } from '../ta-template-form-core/types';
import ClipboardJS from 'clipboard';
import { message } from 'ant-design-vue';
import useSystemClipboard from '../TaTemplateForm/designer/useImportExportDesignerConfig';

let no = 0;

const TableRendersUrl = defineComponent({
  name: 'TableRendersUrl',
  components: {},
  props: {
    value: { type: String, default: '' },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
  },
  setup(props) {
    const formattedValue = computed(() =>
      props.value?.length > 16 ? `${props.value.slice(0, 16)}...` : props.value,
    );

    const openHref = () => {
      window.open(props.value as string);
    };

    const { copyToClipboard } = useSystemClipboard();

    const domId = no++;

    copyToClipboard(`#copy-button-${domId}`, () => props.value);

    return {
      ...toRefs(props),
      formattedValue,
      openHref,
      domId,
    };
  },
});
export default TableRendersUrl;
</script>

<template lang="pug">
.table-renders-url
  a-tooltip()
    template(#title)
      .flex-start
        .content {{ value }}
        .copy(:id='`copy-button-${domId}`') 复制
    .url(@click.stop='openHref') {{ formattedValue }}
</template>

<style lang="stylus" scoped>
.flex
  width fit-content
.copy
  flex-shrink 0
  word-wrap nowrap
  color $primary-color
  margin-left 4px
  background white
  border-radius 4px
  padding 2px 4px
  width fit-content
  cursor pointer
.url
  margin 0
  color $primary-color
</style>
