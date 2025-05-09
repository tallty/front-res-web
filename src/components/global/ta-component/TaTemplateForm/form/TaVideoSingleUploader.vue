<script lang="ts">
import { defineComponent, toRefs, computed, PropType, ref } from 'vue';
import { IFile } from '../../file/file';
import FileServer from '@/components/global/ta-component/file/servers';
import { useI18n } from 'vue-i18n';

const TaVideoSingleUploader = defineComponent({
  name: 'TaVideoSingleUploader',
  components: {},
  props: {
    options: {
      type: Object,
      default: () => {
        return { fileSize: 20 };
      },
    },
    value: { type: Array as PropType<IFile[]>, default: () => [] },
    disabled: { type: Boolean, default: false },
    aspectRatio: { type: Number, default: 0.75 },

    uploaderProps: { type: Object, default: () => ({}) },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val =>
        emit(
          'update:value',
          [val[val.length - 1]].filter(i => i),
        ),
    });

    const fileServer = new FileServer();

    const onStart = () => {
      emit('start');
    };

    const onAllSettle = (doneFiles: IFile[], errorFiles: IFile[]) => {
      emit('allSettle', doneFiles, errorFiles);
    };
    const videoUpload = ref();
    const validate = async () => {
      // TODO: 如有问题，需要改[存在可能性]
      return videoUpload.value?.validate?.();
    };

    const { t } = useI18n();

    return {
      ...toRefs(props),
      localValue,
      fileServer,
      onStart,
      onAllSettle,
      videoUpload,
      validate,
      t,
    };
  },
});
export default TaVideoSingleUploader;
</script>

<template lang="pug">
TaImageSingleUploader.ta-video-single-uploader(
  v-model:value='localValue',
  v-bind='$props',
  :options='options',
  accept='video/*',
  :mimeTypeZh="t('taComponent.upload.video')",
  mimeType='video'
  :includeType='["video"]',
  :uploaderProps='uploaderProps',
  @start='onStart',
  @allSettle='onAllSettle',
  ref='videoUpload'
)
  template(#background='{ fileItem }')
    slot(name='background', :fileItem='fileItem')
      .flex-center.h-full.w-full.relative.overflow-hidden.rounded-lg(v-if='fileItem')
        video(:src='fileServer.getCDNUrl(fileItem)')
        .absolute.inset-0.flex-center
          TaIcon(type='PlayCircleFilled', :size='50', class='!text-gray-400')
</template>

<style lang="stylus" scoped></style>
