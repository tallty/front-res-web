<script lang="ts">
import FileSaver from 'file-saver';
import { directive as viewer } from 'v-viewer';
import 'viewerjs/dist/viewer.css';
import { PropType, computed, defineComponent, nextTick, reactive, ref, toRefs, watch } from 'vue';
import attachmentIcon from './assets/icons/attachment_32.svg';
import FileServer, { IFile } from './servers';

const TaFilePreviewer = defineComponent({
  name: 'TaFilePreviewer',
  components: {},
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    attachment: { type: Object as PropType<IFile>, default: () => ({}) },
    // 上一个 下一个 切换
    attachmentList: { type: Object as PropType<IFile[]>, default: () => [] },
  },
  directives: {
    viewer: viewer({
      debug: true,
    }),
  },
  setup(props, { emit }) {
    const container = ref(null);
    const rightDisplay = ref(false);
    const fileServer: typeof FileServer = new FileServer();
    const viewerOptions = reactive({
      inline: true,
      navbar: false,
      title: false,
      toolbar: {
        zoomIn: 4,
        zoomOut: 4,
        oneToOne: 4,
        reset: 4,
        prev: 0,
        play: 0,
        next: 0,
        rotateLeft: 4,
        rotateRight: 4,
        flipHorizontal: 4,
        flipVertical: 4,
      },
    });

    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });

    const videoOptions = reactive({
      aspectRatio: '16:9',
    });

    const fileTitle = computed(() => props.title || props.attachment.fileName || '文件预览');

    const fileItem = ref<Partial<IFile>>({});

    const getFileItem = (attachment?: IFile) =>
      attachment
        ? {
            ...attachment,
            url: fileServer.getCDNUrl(attachment),
            sizeText: FileServer.getSizeText(attachment.fileSize),
          }
        : {
            url: '',
            sizeText: '',
          };

    watch(
      () => props.attachment,
      () => {
        fileItem.value = getFileItem(props.attachment);
      },
      { immediate: true },
    );

    const onNext = (offset: number) => {
      fileItem.value = getFileItem(props.attachmentList[activeIndex.value + offset]);
    };

    const activeIndex = computed(() => {
      // console.log(props.attachmentList, 'props.attachmentList');

      return props.attachmentList.findIndex((attachment: IFile) =>
        attachment.fileKey
          ? attachment.fileKey === fileItem.value?.fileKey
          : attachment.fileName === fileItem.value?.fileName,
      );
    });

    // 注：Word和PowerPoint文档必须小于10M，Excel 必须小于五M
    const officeTypes = [
      'doc',
      'docx',
      'xlsx',
      'xls',
      'pptx',
      'ppt',
      'msword',
      'wpsoffice',
      'vnd.ms-works',
      'application/vnd.ms-works',
      'vnd.openxmlformats-officedocument.wordprocessingml.document',
      'vnd.ms-excel',
      'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'vnd.ms-powerpoint',
      'vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    const durationString = computed(() => {
      if (fileItem.value.duration) {
        return parseSeconds(fileItem.value.duration).toString();
      }
      return '';
    });

    const isOfficeFile = computed(() =>
      officeTypes.some(
        type => fileItem.value.fileType?.includes(type) || fileItem.value.mimeType?.includes(type),
      ),
    );

    watch(localVisible, () => {
      if (localVisible.value) {
        nextTick(() => {
          if (container.value) {
            const { clientHeight, clientWidth } = container.value as any;
            videoOptions.aspectRatio = `${clientWidth}:${clientHeight}`;
          }
        });
      }
    });

    const parseSeconds = (seconds: number) => {
      const secPerMinute = 60;
      const secPerHour = 60 * 60;
      const hours = Math.floor(seconds / secPerHour);
      const hourString = String(hours).padStart(2, '0');
      const minutesLeft = seconds - hours * secPerHour;
      const minutes = Math.floor(minutesLeft / secPerMinute);
      const minuteString = String(minutes).padStart(2, '0');
      const secondsCount = minutesLeft - minutes * secPerMinute;
      const secondString = String(secondsCount).padStart(2, '0');
      return {
        hour: hourString,
        minute: minuteString,
        second: secondString,
        toString() {
          return `${hourString}:${minuteString}:${secondString}`;
        },
      };
    };

    const onClose = () => {
      localVisible.value = false;
      emit('close');
    };

    const download = () => {
      FileSaver.saveAs(fileItem.value.url, fileItem.value.fileName);
    };

    const changeRightDisplay = () => {
      rightDisplay.value = !rightDisplay.value;
    };

    const onPdfError = () => {
      window.open(fileItem.value.url);
      localVisible.value = false;
    };

    const visibleOnlineEdit = ref(false);
    const onlineEditable = !!process.env.VUE_APP_ONLINE_EDITOR_DOCUMENT_SERVER;
    const onOnlineEdit = () => {
      visibleOnlineEdit.value = true;
    };

    return {
      ...toRefs(props),
      container,
      onClose,
      fileTitle,
      download,
      fileItem,
      videoOptions,
      viewerOptions,
      attachmentIcon,
      durationString,
      isOfficeFile,
      activeIndex,
      onNext,
      rightDisplay,
      changeRightDisplay,
      localVisible,
      onPdfError,
      onOnlineEdit,
      onlineEditable,
      visibleOnlineEdit,
    };
  },
});

export default TaFilePreviewer;
</script>

<template lang="pug">
a-drawer.ta-file-previewer.file-previewer-wrap(
  v-if='localVisible',
  :title='null',
  v-model:visible='localVisible',
  :zIndex='99999',
  :destroyOnClose='true',
  :mask='true',
  placement='bottom',
  height='calc(100vh - 50px)',
  @close='onClose',
  :closable='false'
)
  template(#title)
    .file-previewer-header
      .title.text-ellipsis {{ fileTitle }}
      .actions
        //- TaTextButton.action(v-if='onlineEditable', icon='EditOutlined', @click='onOnlineEdit') 在线编辑
        TaTextButton.action(
          v-if='attachmentList.length > 1 && activeIndex > 0',
          icon='UpArrowOutlined',
          @click='onNext(-1)'
        ) 上一个
        TaTextButton.action(
          v-if='attachmentList.length > 1 && activeIndex < attachmentList.length - 1',
          icon='DownArrowOutlined',
          @click='onNext(+1)'
        ) 下一个
        TaTextButton.action(icon='DownloadOutlined', @click='download') 下载
        TaTextButton.action(v-if='rightDisplay', @click='changeRightDisplay') 关闭右侧信息
        TaTextButton.action(v-else, @click='changeRightDisplay') 打开右侧信息
      .closable(@click='onClose')
        TaIcon(type='CloseOutlined', :style='`font-size: 16px;color:rgba(0,0,0,0.45)`')
  .file-preview-container
    .file-previewer.flex.justify-center.items-center(ref='container')
      //- baijiayun_video_id
      ComBaijiayunVideoPlayer.w-full.h-full(
        v-if='fileItem.baijiayun_video_id',
        :fileItem='fileItem'
      )
      //- Pdf
      object.type-file-frame(
        v-else-if='["pdf", "application/pdf"].includes(fileItem.mimeType || fileItem.fileType)',
        :data='fileItem.url',
        type='application/pdf',
        :onerror='onPdfError'
      )
        .frame-placeholder
          .flex-center
            img.file-icon(:src='attachmentIcon')
          .file-tips 浏览器不支持在线预览 PDF 文件，可下载后查看
          TaTextButton(
            icon='DownloadOutlined',
            color='rgb(61, 168, 245)',
            type='primary',
            @click='download'
          )
            | 点击下载
      //- Video
      .type-file-frame(v-else-if='(fileItem.mimeType || fileItem.fileType)?.includes("video")')
        TaVideo.video-widget(:src='fileItem.url', :options='videoOptions')
        //- TaVideo.video-widget(:src='fileItem.url', :type='(fileItem.mimeType || fileItem.fileType)', :options='videoOptions')
        //- Audio
      .type-file-frame(v-else-if='(fileItem.mimeType || fileItem.fileType)?.includes("audio")')
        audio.audio-widget(:src='fileItem.url', controls)
        //- Image
      .type-file-frame(v-else-if='(fileItem.mimeType || fileItem.fileType)?.includes("image")')
        .image-widget(v-viewer='viewerOptions')
          img(:src='fileItem.url', :alt='fileItem.name', v-show='false')
        //- Offices
      iframe.type-file-frame(
        v-else-if='isOfficeFile && !onlineEditable',
        :src='`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileItem.url)}`',
        width='100%',
        height='100%',
        frameborder='0'
      )
      TaOfficeOnlineEditorModel.type-file-editor(
        v-else-if='isOfficeFile && onlineEditable',
        :fileItem='fileItem',
        wrapComponent='div'
      )
      //- Other
      .type-file-frame(v-else)
        .frame-placeholder
          img.file-icon(:src='attachmentIcon')
          .file-tips 不支持在线预览，请下载后查看
          TaTextButton(icon='DownloadOutlined', type='primary', @click='download')
            | 点击下载
    .side-container(v-show='rightDisplay')
      .side-part(v-if='$slots.sideTop')
        slot(name='sideTop', :fileItem='fileItem')
      .side-part
        ComKvCell(name='大小', nameWidth='48px')
          | {{ fileItem.sizeText }}
        ComKvCell(name='时长', nameWidth='48px', v-if='fileItem.duration')
          | {{ durationString }}
        ComKvCell(
          name='尺寸',
          nameWidth='48px',
          v-if='fileItem.width && fileItem.width !== "undefined"'
        )
          | {{ fileItem.width }} x {{ fileItem.height }}
      .side-part(v-if='$slots.sideBottom')
        slot(name='sideBottom', :fileItem='fileItem')

  TaOfficeOnlineEditorModel(
    v-if='visibleOnlineEdit',
    v-model:visible='visibleOnlineEdit',
    :zIndex='999999',
    :fileItem='fileItem'
  )
</template>

<style lang="stylus">
.file-previewer-wrap
  height 100%
  .ant-drawer-header-title
    width 100%
  .ant-drawer-title
    width 100%
  .ant-drawer-mask
    opacity 0.6 !important
  .ant-drawer-wrapper-body
    height 100%
  .ant-drawer-content-wrapper
    padding 0 50px 50px
    height 100%
    .ant-drawer-close-x
      font-size 20px
    .ant-drawer-body
      padding 0
      height 100%
      .file-preview-container
        position relative
        display flex
        // padding-top 56px
        height 100%
        .file-previewer
          width 100%
          height 100%
          background #333
          .type-file-frame
            position relative
            display flex
            justify-content center
            align-items center
            overflow auto
            width 100%
            height 100%
            .frame-placeholder
              color #fff
              text-align center
              display flex
              flex-direction column
              align-items center
              font-size 16px
              .file-icon
                margin-bottom 20px
                width 60px
              .file-tips
                margin-bottom 30px
            .audio-widget
              width 500px
            .image-widget
              width 100%
              height 100%
            .video-widget
              max-width 100%
              max-height 100%
        .side-container
          flex-shrink 0
          overflow auto
          padding 10px 20px
          width 300px
          height 100%
          border-left 1px solid RGBA(224, 224, 224, 1)
          .side-part
            position relative
            overflow hidden
            border-bottom 1px solid #e8e8e8
            &:last-child
              border-bottom none
.file-previewer-header
  display flex
  flex-grow 1
  justify-content space-between
  align-items center
  padding-right 70px
  padding-left 16px
  width 100%
  // height 56px
  // border-bottom 1px solid RGBA(224, 224, 224, 1)
  color #333
  .actions
    flex-shrink 0
    align-items center
    display flex
    .action
      margin-left 20px
      color #333333
      &:hover
        color #000000
        font-weight bold
  .closable
    position relative
    right -70px
    cursor pointer
</style>
