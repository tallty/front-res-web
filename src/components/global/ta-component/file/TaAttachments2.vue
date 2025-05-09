<script lang="ts">
import TaAttachmentFile2 from './TaAttachmentFile2.vue';
import { IFile } from './file';
import { PropType, toRefs, defineComponent } from 'vue';
import { ref } from '@vue/reactivity';
import { VObject } from '@/lib/vails/model';

const TaAttachments2 = defineComponent({
  name: 'TaAttachments2',
  components: { TaAttachmentFile2 },
  props: {
    attachments: { type: Array as PropType<IFile[]>, default: () => [], required: true },
    showActions: { type: Boolean, default: false },
    display: { type: Boolean, default: false },
    downloadable: { type: Boolean, default: true },
    previewable: { type: Boolean, default: true },
  },
  setup(props, { emit }) {
    const remove = (fileItem: IFile, index: number) => {
      const items = props.attachments.concat();
      items.splice(index, 1);
      emit('remove', fileItem, index);
      onChange(items);
      if (fileItem._cancel) {
        fileItem._cancel();
      }
    };

    const restart = (fileItem: IFile, index: number) => {
      emit('restart', fileItem, index);
    };

    const preview = (fileItem: IFile, index: number) => {
      emit('preview', fileItem, index);
    };

    // 与 fileUploader 同步
    const onChange = (files: IFile[]) => {
      const todoFiles = files.filter((file: IFile) => file.status === 'todo');
      const doingFiles = files.filter((file: IFile) => file.status === 'doing');
      const doneFiles = files.filter((file: IFile) => file.status === 'done');
      const errorFiles = files.filter((file: IFile) => file.status === 'error');

      const allSettled = todoFiles.length === 0 && doingFiles.length === 0;
      const statusFiles = {
        todo: todoFiles,
        doing: doingFiles,
        done: doneFiles,
        error: errorFiles,
      };

      emit('update:attachments', files, statusFiles, allSettled);
    };

    const attachmentRefs = ref<VObject>({});

    const renderProgress = (fileKey: string, percent: number) => {
      attachmentRefs.value[fileKey]?.renderProgress(percent);
    };

    return {
      ...toRefs(props),
      onChange,
      preview,
      remove,
      restart,
      attachmentRefs,
      renderProgress,
    };
  },
});
export default TaAttachments2;
</script>

<template lang="pug">
.attachments2.w-full(@click.stop='')
  TaAttachmentFile2(
    v-for='(item, index) in attachments',
    :ref='el => (attachmentRefs[item.fileKey] = el)',
    :attachment='item',
    :key='`index_${item.fileKey}`',
    :display='display',
    :showActions='showActions',
    :downloadable='downloadable',
    :previewable='previewable',
    :attachmentList='attachments',
    @preview='preview(item, index)',
    @remove='remove(item, index)',
    @restart='restart(item, index)'
  )
</template>

<style lang="stylus" scoped>
.attachments2
  position relative
  overflow hidden
</style>
