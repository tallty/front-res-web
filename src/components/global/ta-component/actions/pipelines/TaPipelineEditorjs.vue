<script lang="ts">
import { defineComponent, toRefs, onMounted, ref } from 'vue';
// import { undo, redo, history } from 'prosemirror-history';
// import { keymap } from 'prosemirror-keymap';
// // import { markdown } from 'prosemirror-markdown';
// import { schema } from 'prosemirror-schema-basic';
// import { EditorState } from 'prosemirror-state';
// import { EditorView } from 'prosemirror-view';

const TaPipelineEditorjs = defineComponent({
  name: 'TaPipelineEditorjs',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
  },
  setup(props) {
    const editorRef = ref<any>(null);
    onMounted(() => {
      // const state = EditorState.create({
      //   schema,
      //   plugins: [history(), keymap({ 'Mod-z': undo, 'Mod-y': redo })],
      // });
      // const view = new EditorView(editorRef.value, { state });
    });

    return {
      ...toRefs(props),
      editorRef,
    };
  },
});
export default TaPipelineEditorjs;
</script>

<template lang="pug">
.ta-pipeline-editorjs(ref='editorRef')
</template>

<style lang="stylus" scoped></style>
