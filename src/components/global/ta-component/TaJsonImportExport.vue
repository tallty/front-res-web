<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import FileSaver from 'file-saver';
import { message } from 'ant-design-vue';

const TaJsonImportExport = defineComponent({
  name: 'TaJsonImportExport',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const onExport = (filename = `${Date.now()}.json`) => {
      const jsonString = JSON.stringify(localValue.value);
      const blob = new Blob([jsonString], { type: 'application/json' });
      FileSaver.saveAs(blob, filename);
    };

    const fileInput = ref<any>(null);
    const onImport = () => {
      fileInput.value?.click?.();
    };

    const onFileInputChange = (e: any) => {
      if (e.target.files?.[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = function () {
          try {
            if (reader.result) {
              const jsonData = JSON.parse(String(reader.result));
              localValue.value = jsonData;
            }
          } catch (error) {
            message.error('JSON 格式错误');
          }
        };
        reader.onerror = function () {
          message.error('读取文件失败');
        };
      }
    };

    return {
      ...toRefs(props),
      localValue,
      onExport,
      onImport,
      fileInput,
      onFileInputChange,
    };
  },
});
export default TaJsonImportExport;
</script>

<template lang="pug">
.ta-json-import-export.flex.space-x-2
  slot(:actions='{ export: onExport, import: onImport }')
    a-button(@click='() => onExport()') 导出JSON
    a-button(@click='onImport') 导入JSON

  input.hidden(ref='fileInput', :multiple='false', type='file', @change='onFileInputChange')
</template>

<style lang="stylus" scoped>
.ta-json-import-export
  .hidden
    display none !important
</style>
