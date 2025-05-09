<script lang="ts">
import {
  ref,
  defineComponent,
  toRefs,
  computed,
  PropType,
  watch,
  onMounted,
  onUnmounted,
} from 'vue';
import { IFile } from '../../file/file';
import FileServer from '@/components/global/ta-component/file/servers';
import { antdFileItem } from './TaImageUploader.vue';
import { useI18n } from 'vue-i18n';

const TaImageSingleUploader = defineComponent({
  name: 'TaImageSingleUploader',
  components: {},
  props: {
    options: {
      type: Object,
      default: () => {
        return { fileSize: 3 };
      },
    },
    value: { type: Array as PropType<IFile[]>, default: () => [] },
    disabled: { type: Boolean, default: false },
    aspectRatio: { type: Number, default: 0.75 },

    accept: { type: String, default: 'image/*' },
    mimeTypeZh: { type: String, default: '图片' },
    mimeType: { type: String, default: 'image' },

    presetFiles: { type: Array as PropType<IFile[]>, default: () => [] },
    includeType: { type: Array, default: () => ['image'] },

    uploaderProps: { type: Object, default: () => ({}) },
  },
  setup(props, { emit, slots }) {
    const localValue = computed({
      get: () => (Array.isArray(props.value) ? props.value : [props.value].filter(i => i)),
      set: val =>
        emit(
          'update:value',
          [val[val.length - 1]].filter(i => i),
        ),
    });

    const fileList = ref<antdFileItem[]>([]);
    const fileServer = new FileServer();

    const imageUrl = computed(() => {
      resizeTrigger.value;
      if (slots.background) {
        return '';
      }
      if (localValue.value && localValue.value[0]) {
        return `url(${fileServer.getThumbnailUrl(
          currentFileItem.value,
          Math.ceil(container.value?.clientWidth || 0),
          Math.ceil(Number(props.aspectRatio) * container.value?.clientWidth || 0),
        )}`;
      }
      return '';
    });
    const uploader = ref<any>(null);

    const onSelect = () => {
      uploader.value.clickFileInput();
    };

    const onUpload = (file: File) => {
      uploader.value.handleFileInputChange({ target: { files: [file] } });
    };

    const onStart = () => {
      emit('start');
    };

    const onAllSettle = (doneFiles: IFile[], errorFiles: IFile[]) => {
      emit('allSettle', doneFiles, errorFiles);
      progressingFileItem.value = {};
    };

    watch(
      localValue,
      () => {
        fileList.value = localValue.value.map((fileItem: IFile) => ({
          uid: fileItem.fileKey,
          percent: fileItem.percent,
          status: fileItem.status,
          name: fileItem.fileName,
          url: fileServer.getCDNUrl(fileItem),
        }));
      },
      { deep: true, immediate: true },
    );

    const onClear = () => {
      localValue.value = [];
    };

    const visiblePreview = ref(false);
    const activeFileItem = ref<IFile | null>(null);

    const onPreview = () => {
      if (currentFileItem.value) {
        activeFileItem.value = { ...currentFileItem.value };
        visiblePreview.value = true;
      }
    };

    const currentFileItem = computed(() => localValue.value[localValue.value.length - 1]);

    const container = ref<any>(null);
    const resizeTrigger = ref(false);
    const height = computed(() => {
      resizeTrigger.value;
      return `${Number(props.aspectRatio) * container.value?.clientWidth}px`;
    });

    const triggerChange = () => {
      resizeTrigger.value = !resizeTrigger.value;
    };

    onMounted(() => {
      document.addEventListener('click', triggerChange);
    });

    onUnmounted(() => {
      document.removeEventListener('click', triggerChange);
    });

    const visiblePresetImages = ref(false);

    const progressingFileItem = ref({});
    const onProgress = (file: IFile) => {
      progressingFileItem.value = file;
    };

    const { t } = useI18n();

    return {
      ...toRefs(props),
      localValue,
      imageUrl,
      uploader,
      onSelect,
      fileList,
      onUpload,
      onStart,
      onAllSettle,
      onClear,
      onPreview,
      visiblePreview,
      activeFileItem,
      currentFileItem,
      height,
      container,
      visiblePresetImages,
      progressingFileItem,
      onProgress,

      t,
    };
  },
});
export default TaImageSingleUploader;
</script>

<template lang="pug">
.ta-image-single-uploader.w-full
  .container.w-full(ref='container')
    template(v-if='!disabled')
      .w-full.h-full(@click.stop='onSelect')
        a-upload-dragger(
          :fileList='fileList',
          :multiple='false',
          :action='onUpload',
          :customRequest='() => true',
          :showUploadList='false',
          :accept='accept',
          :openFileDialogOnClick='false'
        )
          .background.h-full.w-full.bg-center.bg-no-repeat.bg-cover.flex.flex-col-reverse.relative(
            :style='{ "background-image": imageUrl }'
          )
            .actions.z-10.relative.flex-center.h-full.w-full.text-xs.text-gray-600.overflow-hidden(
              :class='{ "opacity-0": fileList.length > 0 }',
            )
              .absolute.top-4.right-4.flex(
                v-if='currentFileItem?.status === "done"',
              )
                TaIcon.mr-4(
                  type='EyeFilled',
                  @click.stop='onPreview'
                )
                TaIcon(
                  type='CloseCircleOutlined',
                  @click.stop='onClear'
                )
              .shell
                .flex-center.pb-4
                  TaIcon(type='UploadOutlined')
                  | {{t('taComponent.TaImageSingleUploader.please1')}}{{ mimeTypeZh  === '图片' ? t('taComponent.upload.image') : mimeTypeZh }}
                .flex
                  | {{t('taComponent.TaImageSingleUploader.please2')}}{{  mimeTypeZh  === '图片' ? t('taComponent.upload.image') : mimeTypeZh }}{{t('taComponent.TaImageSingleUploader.pleaseNext')}}
            .w-full.h-full.absolute.inset-0.flex-center
              a-spin.z-20(v-if='currentFileItem?.status === "doing"')
              slot(v-else, name='background', :fileItem='currentFileItem')
    template(v-else)
      .background.h-full.w-full.bg-center.bg-no-repeat.bg-cover.relative.cursor-pointer(
        :style='{ "background-image": imageUrl }',
        @click='onPreview',
      )
        .w-full.h-full.absolute.inset-0
          slot(name='background', :fileItem='currentFileItem')
  a-progress(
    v-if='progressingFileItem?.fileKey',
    :percent='progressingFileItem.percent',
    :status='progressingFileItem.status === "error" ? "exception" : "active"',
  )
  .mt-4.text-gray-400.text-right.cursor-pointer(
    v-if='presetFiles?.length > 0 && !disabled',
    @click='() => visiblePresetImages = true'
  )
    | {{t('taComponent.TaImageSingleUploader.preview')}} >

TaFileUploader(
  v-model:value='localValue',
  ref='uploader',
  style='display: none',
  :accept='accept',
  :options='options',
  :includeType='includeType',
  @start='onStart',
  @allSettle='onAllSettle',
  @progress='onProgress',
  v-bind='uploaderProps'
)

TaFilePreviewer(
  v-model:visible='visiblePreview',
  :attachment='activeFileItem',
)

TaPresetImages(
  v-model:visible='visiblePresetImages',
  v-model:value='localValue'
  :presetFiles='presetFiles',
  :aspectRatio='aspectRatio'
)
</template>

<style lang="stylus" scoped>
.ta-image-single-uploader
  .container
    height v-bind(height)
  >>> .ant-upload-btn
    padding 0 !important
  .background
    &:hover
      .actions
        color white
        background black
        opacity 0.7
        transition all .2s
        height 100%
</style>
