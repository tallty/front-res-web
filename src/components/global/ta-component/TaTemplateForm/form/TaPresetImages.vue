<script lang="ts">
import { ref, defineComponent, toRefs, computed, PropType } from 'vue';
import { IFile } from '../../file/file';
import FileServer from '@/components/global/ta-component/file/servers';
import { cloneDeep } from 'lodash';

const TaPresetImages = defineComponent({
  name: 'TaPresetImages',
  components: {},
  props: {
    value: { type: Array as PropType<IFile[]>, default: () => [] },
    visible: { type: Boolean, default: false },

    aspectRatio: { type: Number, default: 0.75 },
    presetFiles: { type: Array as PropType<IFile[]>, default: () => [] },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });

    const fileServer = new FileServer();

    const getBackgroundImageUrl = (fileItem: IFile | null, width?: number) => {
      return fileItem
        ? `url(${fileServer.getThumbnailUrl(fileItem, width)}) center / cover no-repeat`
        : '';
    };

    const activeFileItem = ref<IFile | null>(null);

    activeFileItem.value = cloneDeep(props.presetFiles[0]);

    const onOk = () => {
      if (activeFileItem.value) {
        localValue.value = [activeFileItem.value];
      }
      localVisible.value = false;
    };

    return {
      ...toRefs(props),
      localValue,
      localVisible,
      activeFileItem,
      getBackgroundImageUrl,
      onOk,
    };
  },
});
export default TaPresetImages;
</script>

<template lang="pug">
.ta-preset-images
  a-modal(
    v-model:visible='localVisible',
    width='800px'
    title='选择预置图片',
    @ok='onOk'
  )
    .container.flex
      .list.overflow-auto.flex-shrink-0(class='w-[100px] h-max-[350px]')
        .item.my-1.cursor-pointer.relative(
          v-for='fileItem in presetFiles',
          :style='{ background: getBackgroundImageUrl(fileItem, 100), height: `${aspectRatio * 100}px` }'
          @click='() => activeFileItem = fileItem'
        )
          .absolute.w-full.h-full.bg-gray-800.opacity-60.flex-center(v-if='activeFileItem?.fileKey === fileItem.fileKey')
            TaIcon(type='CheckCircleFilled', class='!text-white', :size='30')

      .preview.flex-grow.flex-shrink-0(class='[350px]')
        .image.w-full.h-full(
          :style='{ background: getBackgroundImageUrl(activeFileItem, 500) }'
        )
</template>

<style lang="stylus" scoped></style>
