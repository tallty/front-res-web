<script lang="ts">
import { defineComponent, toRefs, computed, ref, onMounted, watch } from 'vue';
// import VueJsonEditor from 'vue-json-editor';
import JsonEditor, { JSONEditorMode } from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.min.css';

import { VObject } from '@/lib/vails/model';
import { isEqual } from 'lodash';

const TaJsonEditor = defineComponent({
  name: 'TaJsonEditor',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    watch(
      () => props.value,
      (newValue: VObject, oldValue?: VObject) => {
        if (
          !isEqual(newValue, oldValue) &&
          editor.value &&
          !isEqual(editor.value.get(), newValue)
        ) {
          editor.value.update(newValue);
        }
      },
      { deep: true },
    );

    const editor = ref<any>(null);
    const editorRef = ref<any>(null);

    const onJsonChange = (val: VObject) => {
      error.value = false;
      localValue.value = val;
    };

    const error = ref(false);

    const onJsonError = () => {
      error.value = true;
    };

    const initJsonEditor = () => {
      const el = editorRef.value;
      if (!el) return;

      const options = {
        mode: (props.disabled ? 'preview' : 'code') as JSONEditorMode,
        modes: ['tree', 'code', 'form', 'text', 'view', 'preview'] as JSONEditorMode[],
        mainMenuBar: true,
        navigationBar: false,
        language: 'zh-CN',
        history: true,
        search: false,
        onChange: () => {
          try {
            const data = editor.value.get();
            onJsonChange(data);
          } catch (e) {
            onJsonError();
          }
        },
        // onModeChange(newMode, oldMode) {
        //   _self.$emit('on-mode', { newMode, oldMode });
        // },
        // onTextSelectionChange(start, end, text) {
        //   _self.$emit('on-select-text', { start, end, text });
        // },
        // onEditable({ path, field, value }) {
        //   return { field: _self.drag, value: _self.edit };
        // },
        onError() {
          onJsonError();
        },
      };
      editor.value = new JsonEditor(el, options, localValue.value);
    };

    onMounted(() => {
      initJsonEditor();
    });

    return {
      ...toRefs(props),
      localValue,
      error,
      editorRef,
    };
  },
});
export default TaJsonEditor;
</script>

<template lang="pug">
.ta-json-editor
  template(v-if='!disabled')
    .error(v-if='error') * 格式错误，将保留上次正确格式数据
    .editor(ref='editorRef')
  template(v-else)
    .editor(ref='editorRef')
</template>

<style lang="stylus" scoped>
.ta-json-editor
  .error
    color red
</style>
