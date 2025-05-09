<script lang="ts">
import { ref, defineComponent, toRefs, computed, PropType, onMounted, onUnmounted } from 'vue';
import { IFile } from '../../file/file';
import FileServer from '@/components/global/ta-component/file/servers';
import {
  FormItemSize,
  TaTemplateFormOptions,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { PlusOutlined } from '@ant-design/icons-vue';

const TaImageSingleUploaderNew = defineComponent({
  name: 'TaImageSingleUploaderNew',
  components: {
    PlusOutlined,
  },
  props: {
    options: {
      type: Object as PropType<TaTemplateFormOptions>,
      default: () => {
        return { fileSize: 30, size: 'regular' };
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
    size: { type: String as PropType<FormItemSize>, default: () => 'regular' },
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

    // const fileList = ref<antdFileItem[]>([]);
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
    console.log(props.options);

    const onStart = () => {
      emit('start');
    };

    const onAllSettle = (doneFiles: IFile[], errorFiles: IFile[]) => {
      emit('allSettle', doneFiles, errorFiles);
      progressingFileItem.value = {};
    };

    // watch(
    //   localValue,
    //   () => {
    //     fileList.value = localValue.value.map((fileItem: IFile) => ({
    //       uid: fileItem.fileKey,
    //       percent: fileItem.percent,
    //       status: fileItem.status,
    //       name: fileItem.fileName,
    //       url: fileServer.getCDNUrl(fileItem),
    //     }));
    //   },
    //   { deep: true, immediate: true },
    // );

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

    const finalSize = computed(() => {
      if (props?.options?.size) {
        return props.options.size === 'large' ? 'regular' : props.options.size;
      }
      return props.size;
    });
    const height = computed(() => {
      return `${228 / (finalSize.value === 'regular' ? 1 : 1.55)}px`;
    });
    const width = computed(() => {
      return `${460 / (finalSize.value === 'regular' ? 1 : 1.55)}px`;
    });

    const fileList = computed(() => {
      return uploader.value?.fileItems?.map?.((fileItem: IFile) => ({
        uid: fileItem.fileKey || (fileItem as any).key,
        percent: fileItem.percent * 100,
        status: fileItem.status === 'doing' ? 'uploading' : fileItem.status,
        name: fileItem.fileName,
        url: fileServer.getCDNUrl(fileItem),
      }));
    });

    const flag = ref(true);
    const validate = async () => {
      if (localValue.value.some((el: any) => el.status !== 'done')) {
        flag.value = false;
        if (localValue.value.some((el: any) => el.status === 'doing')) {
          return Promise.reject('存在文件未上传完毕');
        } else {
          return Promise.reject('存在未成功上传的文件');
        }
      } else {
        flag.value = true;
        return Promise.resolve();
      }
    };

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
      container,
      visiblePresetImages,
      progressingFileItem,
      onProgress,

      finalSize,
      height,
      width,

      validate,
      flag,
    };
  },
});
export default TaImageSingleUploaderNew;
</script>

<template lang="pug">
.ta-image-single-uploader.w-full
  .container.w-full(ref='container', :class='fileList?.[0]?.status === "error" || !flag ? "error_container" : ""')
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
          .background.h-full.w-full.bg-center.bg-no-repeat.bg-cover.flex.flex-col-reverse.relative.rounded-lg(
            :style='{ "background-image": imageUrl }'
						
          )
            .actions.z-10.relative.flex-center.h-full.w-full.text-xs.text-gray-600.overflow-hidden(
              :class='{ "opacity-0": fileList?.length > 0 }',
            )
              .absolute.action_icon.flex(
                v-if='currentFileItem?.status === "done"',
              )
                TaIcon.mr-4(
                  type='EyeFilled',
                  :size='20'
                  @click.stop='onPreview'
                )
                TaIcon(
                  type='DeleteOutlined',
                  :size='20'
                  @click.stop='onClear'
                )
              .shell(v-show='fileList?.length<=0')
                .flex-center.pb-2
                  TaIcon(type='PlusOutlined', :size='20', color='#9CA3AF')
                .flex.w-full.justify-center.text-sm.text-gray-500.font-semibold.pb-1 请将{{ mimeTypeZh }}拖至此处或点击上传
                .flex.w-full.justify-center.text-xs.text-gray-500.font-medium.pb-2 最大允许上传 {{options.fileSize}} MB
                .flex.w-full.justify-center 
                  a-button(type='primary') 
                    TaIcon.relative(type='PlusOutlined', :size='14', color='#fff' class='bottom-[3px]')
                    | 点击上传
            .w-full.h-full.absolute.inset-0.flex-center
              a-spin.z-20(v-if='currentFileItem?.status === "doing"')
              slot(v-else, name='background', :fileItem='currentFileItem')
                .flex-center.h-full.w-full.relative.overflow-hidden.rounded-lg(v-if='currentFileItem && mimeType === "video" ')
                  video(:src='fileList?.[0]?.url')
                  .absolute.inset-0.flex-center
                    TaIcon(type='PlayCircleFilled', :size='50', class='!text-gray-400')
    
    template(v-else)
      .background.h-full.w-full.bg-center.bg-no-repeat.bg-cover.relative.cursor-pointer.rounded-lg(
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
  .more.mt-4.text-gray-400.text-right.cursor-pointer(
    v-if='presetFiles?.length > 0 && !disabled',
    @click='() => visiblePresetImages = true'
  )
    | 预置{{ mimeTypeZh }} >
  .text-gray-500.text-sm.py-2(v-if='options?.placeholder && !disabled && fileList?.length === 0') {{options?.placeholder}}

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
  padding-bottom 8px
  .more
    max-width v-bind(width)

  .container
    height v-bind(height)
    max-width v-bind(width)
    width 100%
    >>>.ant-upload-drag
      border 1px dashed #E5E7EB !important
      border-radius 8px
      background #F9FAFB
  >>> .ant-upload-btn
    padding 0 !important
  .error_container
    >>>.ant-upload-drag
      border 2px dashed #F05252 !important
  .background
    &:hover
      border-radius 8px
      .actions
        color white
        background black
        opacity 0.9
        transition all .2s
        height 100%
        border-radius 8px
        .action_icon
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);
</style>
