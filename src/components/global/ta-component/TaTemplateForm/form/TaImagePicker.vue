<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed } from 'vue';
import { IFile } from '../../file/file';
import FileServer from '@/components/global/ta-component/file/file';

const TaImagePicker = defineComponent({
  name: 'TaImagePicker',
  components: {},
  props: {
    value: { type: Array as PropType<IFile[]>, default: () => [] },
    disabled: { type: Boolean, default: false },

    width: { type: Number, default: 30 },
    height: { type: Number, default: 30 },

    presetFiles: { type: Array as PropType<IFile[]>, default: () => [] },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const fileServer = new FileServer();

    const getThumbnailImage = (file: IFile) => {
      return fileServer.getThumbnailUrl(file, props.width, props.height);
    };

    const isSelected = (file: IFile) => {
      return localValue.value.some((item: IFile) => item.fileKey === file.fileKey);
    };

    const onSelect = (file: IFile) => {
      localValue.value = [file];
    };

    return {
      ...toRefs(props),
      localValue,
      getThumbnailImage,
      isSelected,
      onSelect,
    };
  },
});
export default TaImagePicker;
</script>

<template lang="pug">
.ta-image-picker.flex.flex-wrap.items-center
  template(v-if='disabled')
    img(
      v-if='localValue[0]'
      :src='getThumbnailImage(localValue[0])',
      :width='width'
      :height='height'
      class='m-1'
    )
    .text-gray-400.text-sm(v-else)
      | 未设置

  template(v-else)
    .shell.p-2.rounded-xl(
      v-for='(file, index) in presetFiles',
      :class='{ selected: isSelected(file) }',
      @click='onSelect(file)'
    )
      img(
        :src='getThumbnailImage(file)'
        :width='width'
        :height='height'
        class='m-1'
      )
</template>

<style lang="stylus" scoped>
.ta-image-picker
  .shell
    border 2px solid transparent
  .selected
    border 2px solid $primary-color
</style>
