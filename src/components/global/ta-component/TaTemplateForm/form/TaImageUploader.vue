<script lang="ts">
import { ref, defineComponent, toRefs, computed, PropType } from 'vue';
import { IFile } from '../../file/file';
import FileServer from '@/components/global/ta-component/file/servers';
import { IFileStatus } from '../../file/servers/types';
import { useI18n } from 'vue-i18n';

export interface antdFileItem {
  uid: string;
  name: string;
  status: IFileStatus;
  url: any;
  percent: number;
}

const TaImageUploader = defineComponent({
  name: 'TaImageUploader',
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
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    // const imageUrl = computed(() => {
    //   if (localValue.value && localValue.value[0]) {
    //     const item: IFile = localValue.value[localValue.value.length - 1];
    //     return `url(${item.url}`;
    //   }
    //   return 'url(https://soa-storage.obs.cn-east-2.myhuaweicloud.com/50165a53f87f47bc2e7bf21265bc36d4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=BLZE3LCBWY8WRVUGSO9L%2F20220210%2Fcn-east-2%2Fs3%2Faws4_request&X-Amz-Date=20220210T131029Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=739d8a5f23e86d31862e7a7d4f2c7da0dfa3b101276cb4051a2632873cab6fd4)';
    // });

    const uploader = ref<any>(null);

    const onSelect = () => {
      uploader.value.clickFileInput();
    };

    const onUpload = (file: File) => {
      return uploader.value.handleFileInputChange({ target: { files: [file] } });
    };

    const onStart = () => {
      emit('start');
    };

    const visiblePreview = ref(false);
    const activeFileItem = ref<IFile | null>(null);

    const onPreview = (file: antdFileItem) => {
      const fileItem = localValue.value.find((item: IFile) =>
        item.fileKey || (item as any).key
          ? (item.fileKey || (item as any).key) === file.uid
          : item.fileName === file.name,
      );
      // console.log(fileItem, file, 'fileItem', localValue.value);

      if (fileItem) {
        activeFileItem.value = { ...fileItem, mimeType: 'image' };
        visiblePreview.value = true;
      }
    };

    const onDelete = (file: antdFileItem) => {
      const index = localValue.value.findIndex(
        (item: IFile) => (item.fileKey || (item as any).key) === file.uid,
      );
      localValue.value.splice(index, 1);
      return true;
    };

    const onAllSettle = (doneFiles: IFile[], errorFiles: IFile[]) => {
      emit('allSettle', doneFiles, errorFiles);
    };

    const fileServer = new FileServer();

    // watch(
    //   localValue,
    //   () => {
    //     if (Array.isArray(localValue.value)) {
    //       console.log(localValue.value);
    //       fileList.value = localValue.value.map((fileItem: IFile) => ({
    //         uid: fileItem.fileKey || (fileItem as any).key,
    //         percent: fileItem.percent,
    //         status: fileItem.status,
    //         name: fileItem.fileName,
    //         url: fileServer.getCDNUrl(fileItem),
    //       }));
    //     }
    //   },
    //   { deep: true, immediate: true },
    // );
    const fileList = computed(() => {
      return uploader.value?.fileItems?.map?.((fileItem: IFile) => ({
        uid: fileItem.fileKey || (fileItem as any).key,
        percent: fileItem.percent * 100,
        status: fileItem.status === 'doing' ? 'uploading' : fileItem.status,
        name: fileItem.fileName,
        url: fileServer.getCDNUrl(fileItem),
      }));
    });

    const validate = async () => {
      if (localValue.value.some((el: any) => el.status !== 'done')) {
        if (localValue.value.some((el: any) => el.status === 'doing')) {
          return Promise.reject('存在文件未上传完毕');
        } else {
          return Promise.reject('存在未成功上传的文件');
        }
      } else return Promise.resolve();
    };

    const { t } = useI18n();

    return {
      ...toRefs(props),
      localValue,
      uploader,
      onSelect,
      fileList,
      onUpload,
      onStart,
      visiblePreview,
      onPreview,
      onDelete,
      onAllSettle,
      activeFileItem,
      validate,
      t,
    };
  },
});
export default TaImageUploader;
</script>

<template lang="pug">
.ta-image-uploader
  //- template(v-if='!disabled')
  a-upload(
    :fileList='fileList',
    :action='onUpload',
    list-type="picture-card",
    accept='image/*',
    :multiple='true',
    :disabled='disabled',
    :customRequest='() => true'
    @remove='onDelete',
    @preview='onPreview',
  )
    .background.h-full.w-full.bg-center.bg-no-repeat.bg-cover.flex-center.text-xs.text-gray-600(
      v-if='!disabled',
      @click.stop='onSelect',
    )
      .shell
        .flex-center.pb-1
          TaIcon.w-5.h-5.text-gray-500(type='PlusOutlined')
        .flex.text-gray-500.text-sm
          | {{t('taComponent.TaImageUploader.text')}}
  .text-gray-500.text-sm(v-if='options?.placeholder && !disabled && fileList?.length === 0') {{options?.placeholder}}
TaFileUploader(
  v-model:value='localValue',
  :options='options',
  ref='uploader',
  style='display: none',
  accept="image/*"
  :includeType='["image"]',
  @start='onStart',
  @allSettle='onAllSettle',
)

TaFilePreviewer(
  v-model:visible='visiblePreview',
  :attachment='activeFileItem',
  :attachmentList='localValue',
)
</template>

<style lang="stylus" scoped>
.ta-image-uploader
  >>>.ant-upload-select-picture-card
    width 148px
    height 84px
    border: 1px dashed  #E5E7EB
    background: #F9FAFB
    border-radius 8px
  >>>.ant-upload-list-picture-card-container
    width 148px
    height 84px
    .ant-upload-list-item
      border none
      border-raiuds 8px
      padding 0
      .ant-upload-span
        border-radius 8px
        overflow hidden
      .ant-upload-list-item-thumbnail
        object-fit cover
        .ant-upload-list-item-image
          object-fit cover
    .ant-upload-list-item-error
      border 1px dashed #F05252 !important
      border-radius 8px
  >>>.ant-upload-list-picture-card
    .ant-upload-list-item-info::before
      border-radius 8px
  >>>.ant-upload-list-item-actions
    .anticon-eye,.anticon-delete
      width 20px
      font-size 20px
      font-weight bold
    .anticon-delete
      top: 3px;
      position: relative;
  >>> .ant-upload-btn
    padding 0 !important
  .background
    // background-image v-bind(imageUrl)
</style>
