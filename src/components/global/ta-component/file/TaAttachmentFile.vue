<script lang="ts">
import FileSaver from 'file-saver';
// import audio from './assets/icons/sound_32.svg';
// import video from './assets/icons/video_32.svg';
// import attachment from './assets/icons/attachment_32.svg';
import { computed, ref, toRefs, defineComponent, PropType } from 'vue';
import { getFileDefaultImg, getFileFType } from './util';
import FileServer, { IFile } from '@/components/global/ta-component/file/servers';

const TaAttachmentFile = defineComponent({
  name: 'TaAttachmentFile',
  components: {},
  props: {
    attachment: { type: Object as PropType<IFile>, default: () => ({}) },
    // 上一个 下一个 切换
    attachmentList: { type: Array as PropType<IFile[]>, default: () => [] },
    display: { type: Boolean, default: false },
    showActions: { type: Boolean, default: false },
    downloadable: { type: Boolean, default: true },
    previewable: { type: Boolean, default: true },
    imageMaxHeight: { type: Number, default: undefined },
  },
  setup(props, { emit }) {
    const fileServer = new FileServer({ useCdn: false });

    const fileType = computed(() => {
      if (props.attachment?.fileCategory) {
        return getFileFType(props.attachment);
      } else {
        return 'nan';
      }
    });

    // const typeMap = {
    //   image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp', 'svg'],
    //   video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
    //   audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
    // };
    // 预览
    const visible = ref(false);

    const fileItem = computed(() => {
      const { fileSize } = props.attachment;
      return {
        ...props.attachment,
        url: fileServer.getCDNUrl(props.attachment),
        size_zh: FileServer.getSizeText(fileSize),
        // status: 'error',
      };
    });

    const getThumbnailUrl = computed(() => {
      if (fileType.value === 'image') {
        return fileServer.getThumbnailUrl(fileItem.value, 128, 128);
      }

      const file = { url: getFileDefaultImg(props.attachment) };
      return fileServer.getThumbnailUrl(file, 128, 128);
    });

    const isSuccess = computed(
      () =>
        fileItem.value.status === 'done' ||
        fileItem.value.percent >= 100 ||
        !fileItem.value.percent, // 或者 percent 不存在
    );

    const preview = () => {
      if (isSuccess.value && props.previewable) {
        visible.value = true;
      } else {
        emit('preview', fileItem.value);
      }
    };

    const remove = () => {
      emit('remove', fileItem.value);
    };

    const restart = () => {
      emit('restart', fileItem.value);
    };

    const download = () => {
      FileSaver.saveAs(fileItem.value.url, fileItem.value.fileName);
    };

    const percent = ref(0);

    const renderProgress = (value: number) => {
      percent.value = value;
    };

    /**
     * TODO: 形态改造
     * 1. 文件列表
     *  1.1 文件图【图片类型展示图片】，非图片类型展示其类型图片，未知类型展示未知类型
     *  1.2 失败时样例
     *  1.3 进度条下放
     *
     */

    return {
      ...toRefs(props),
      fileItem,
      getThumbnailUrl,
      preview,
      remove,
      restart,
      download,
      visible,
      isSuccess,
      renderProgress,
      percent,

      fileType,
      getFileDefaultImg,
    };
  },
});
export default TaAttachmentFile;
</script>

<template lang="pug">
.attachment-wrapper.w-full
  
  .media-wrapper(v-if='display && fileItem.mimeType.includes("video")')
    TaVideo.video(:src='fileItem.url', :type='fileItem.mimeType')
  .audio-wrapper(v-else-if='display && fileItem.mimeType.includes("audio")')
    audio.audio(:src='fileItem.url', controls)
  .image-wrapper(v-else-if='display && fileItem.mimeType.includes("image")')
    img.display-image(
      :src='fileItem.url',
      :alt='fileItem.fileName',
      :style='{ "max-height": imageMaxHeight ? `${imageMaxHeight}px` : null }',
      @click='preview'
    )
  .attachment.w-full(v-else, :class='fileItem.status', @click='preview')
    img.thumbnail(:src='getThumbnailUrl')
    .flex.w-0.flex-grow.flex-col 
      .w-full.flex.items-center.px-2
        .file-name 
          | {{ fileItem.fileName }}
        .file-size
          | {{ fileItem.size_zh }}
        .actions
          .file-button(@click.stop='download', v-if='isSuccess && downloadable && fileItem.status !== "error"')
            TaIcon.text-sm(type='DownloadOutlined')
          template(v-if='showActions')
            .file-button(@click.stop='remove')
              TaIcon.text-sm.file_remove(type='CloseOutlined')
            .file-button(@click.stop='restart', v-if='fileItem.status === "error"')
              TaIcon.text-sm.file_restart(type='ReloadOutlined')
          slot(name='actions')
      .progress
        a-progress(
          v-if='!isSuccess',
          :percent='percent',
          :strokeWidth='3',
          :showInfo='false',
          size='small'
        )
  TaFilePreviewer(
    v-if='previewable',
    v-model:visible='visible',
    :attachment='attachment',
    :attachmentList='attachmentList',
  )
</template>

<style lang="stylus" scoped>
$contentHeight = 36px

.attachment-wrapper
  margin-top 10px
  &:first-child
    margin-top 0
  .media-wrapper
    width 100%
    background #000
    .video
      width 100%
  .audio-wrapper
    width 100%
    .audio
      width 100%
  .image-wrapper
    width 100%
    .display-image
      width 100%
      object-fit cover
      object-position center
  .attachment
    position relative
    display flex
    flex-direction row
    flex-wrap nowrap
    align-items center
    padding 4px 8px
    height $contentHeight + (2 * 4)px
    border-radius 4px
    color #383838
    font-size 14px
    .thumbnail
      flex-shrink 0
      width $contentHeight
      height $contentHeight
      border-radius 4px
      background-color #E9F7FE
      text-align center
      font-size 18px
      line-height $contentHeight
    .progress
      position absolute
      right 16px
      bottom -2px
      left 52px
      width calc(100% - 52px - 16px)

    .file-name
      overflow hidden
      padding 0 12px 0 0px
      width 100%
      text-overflow ellipsis
      white-space nowrap
      line-height $contentHeight
      font-size 14px
    .file-size
      flex-shrink 0
      margin-right 8px
      color #999
      font-size 14px
    &:before
      position absolute
      top 0
      right 0
      bottom 0
      left 0
      z-index 2
      border 1px solid transparent
      border-radius 4px
      content ''
      transition all 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)
      pointer-events none
    &:hover, &:focus
      cursor pointer
      &:before
        border 1px solid transparent
        box-shadow 0 0 6px 0 rgba(50, 150, 250, 0.1)
    .actions
      display flex
      justify-content flex-end
      align-items center
      .file-button
        margin-left 8px
        width 20px
        height 20px
        color #8c8c8c
        font-size 16px
        display flex
        align-items center
        &:hover
          color #3296fa
  .error
    color #F05252
    .file_remove
      color #F05252
    .file_restart
      color #F05252
    .file-size
      color #F05252
</style>
