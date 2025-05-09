<script lang="ts">
import FileServer, { IFile } from '../../file/servers';
import { defineComponent, PropType, ref, computed, watch, nextTick, toRefs, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { TaContentFieldValueItem } from '../../ta-template-form-core/ContentFieldFormatter';
import draggable from 'vuedraggable';
import useDraggableLanding from '../designer/useDraggableLanding';
import { useI18n } from 'vue-i18n';

const TaContentField = defineComponent({
  name: 'TaContentField',
  components: {
    draggable,
  },
  props: {
    value: { type: Array as PropType<TaContentFieldValueItem[]>, default: () => [] },
    disabled: { type: Boolean, default: false },
    useNormalText: { type: Boolean, default: false },
    hideVideo: { type: Boolean, default: false },
    hideImage: { type: Boolean, default: false },
    hideText: { type: Boolean, default: false },
    hideAudio: { type: Boolean, default: false },
    hideFile: { type: Boolean, default: false },
    imageFileSize: { type: Number, default: 10 },
    videoFileSize: { type: Number, default: 10 },
    audioFileSize: { type: Number, default: 10 },
    fileFileSize: { type: Number, default: 10 },
  },
  setup(props, { emit }) {
    const { onMove, onDragEnd } = useDraggableLanding(computed(() => true));

    const modules = ref<TaContentFieldValueItem[]>([]);
    const activeModule = ref<TaContentFieldValueItem>({
      body: '',
      images: [],
      videos: [],
      audios: [],
      files: [],
    });

    const visibleForm = ref(false);
    const richEditor = ref<any>(null);
    const fileServer = new FileServer();

    const contentModules = computed(() => {
      return (modules.value || []).map((e: TaContentFieldValueItem) => ({
        key: e.key,
        body: e.body,
        id: e.key,
        images: (e.images || []).map((o: IFile) => fileServer.getDownloadUrl(o)) || [],
        videosFileItems:
          (e.videos || []).map((o: IFile) => ({ ...o, url: fileServer.getCDNUrl(o) })) || [],
        audioFileItems: (e.audios || []).map((o: IFile) => ({
          ...o,
          url: fileServer.getCDNUrl(o),
          name: o.fileName.replace(/\.mp3| \.wma| \.rm| \.wav| \.mid| \.ape| \.flac/, ''),
        })),
        fileFileItems: (e.files || []).map((o: IFile) => ({
          ...o,
          url: fileServer.getCDNUrl(o),
        })),
      }));
    });

    const toolbar = [
      'heading',
      'bold',
      'italic',
      'underline',
      '|',
      'numberedList',
      // 'blockQuote',
      'alignment',
      '|',
    ];

    watch(
      () => props.value,
      () => {
        modules.value = (
          Array.isArray(props.value) ? props.value : props.value ? [props.value] : []
        ).map((e: any) => ({
          ...e,
          key: e.key || new Date().getTime(),
        }));
      },
      { deep: true, immediate: true },
    );

    const initActiveModule = () => {
      activeModule.value = {
        body: '',
        images: [],
        videos: [],
        audios: [],
        files: [],
      };
    };

    const richEditorKey = ref(new Date().getTime());

    const onCreate = () => {
      initActiveModule();
      visibleForm.value = true;
      richEditorKey.value = new Date().getTime();
      nextTick(() => {
        // richEditor.value?.onFocus(); // 粘贴表格会引起浏览器卡死 初步判断为对象被污染，注释后未发现编辑器引起bug
      });
    };

    const onEdit = (index: number) => {
      activeModule.value = {
        ...modules.value[index],
      };
      visibleForm.value = true;
      nextTick(() => {
        // richEditor.value?.onFocus(); // 粘贴表格会引起浏览器卡死 初步判断为对象被污染，注释后未发现编辑器引起bug
      });
    };

    const onSubmit = () => {
      if (!activeModule.value.body) {
        message.warning(t('taComponent.TaContentField.warningWhite'));
        return;
      }
      if (activeModule.value.key) {
        const index = modules.value.findIndex(e => e.key === activeModule.value.key);
        modules.value.splice(index, 1, { ...activeModule.value });
      } else {
        modules.value.push({ ...activeModule.value, key: new Date().getTime() });
      }
      onChange();
      visibleForm.value = false;
    };

    const isAllSettled = (key: 'image' | 'video' | 'file' | 'audio', allSettled: boolean) => {
      progressingFileItems[key] = {};

      if (allSettled) {
        modules.value.push({ ...activeModule.value, key: new Date().getTime() });
        onChange();
      }
    };

    const onDelete = (index: number) => {
      modules.value.splice(index, 1);
      onChange();
    };

    const onChange = () => {
      nextTick(() => {
        emit('update:value', modules.value);
      });
      initActiveModule();
    };

    const progressingFileItems = reactive({
      image: {},
      video: {},
      file: {},
      audio: {},
    });

    const onProgress = (key: 'image' | 'video' | 'file' | 'audio', fileItem: IFile) => {
      progressingFileItems[key] = fileItem;
    };

    const contentModulesUpdate = ref(contentModules.value);

    watch(
      () => contentModules.value,
      () => {
        contentModulesUpdate.value = contentModules.value;
      },
      { deep: true },
    );

    const { t } = useI18n();

    return {
      ...toRefs(props),
      contentModules,
      onMove,
      onDragEnd,
      onEdit,
      onDelete,
      onCreate,
      activeModule,
      isAllSettled,
      onSubmit,
      visibleForm,
      toolbar,
      richEditor,
      richEditorKey,
      progressingFileItems,
      onProgress,
      contentModulesUpdate,

      t,
    };
  },
});

export default TaContentField;
</script>

<template lang="pug">
.ta-content-field.border-gray-300.divide-y.divide-gray-300.rounded-lg(:class='{ border: !disabled }')
  draggable.modules(
    v-if='contentModules.length > 0',
    :class='{ "p-3": !disabled }'
    :list='contentModulesUpdate',
    handle=".handle",
  )
    template(#item='{element, index}')
      .module(v-if="element", :key="element")
        .ck-content.body(v-html='element.body', v-if='element.body', :class='{ "hover-item": !disabled }')
        .cover-image(v-for='(url, key) in element.images', :key='key')
          img.mx-auto(
            :src='url',
            :class='{ "max-w-[800px]": disabled, "max-w-[400px]": !disabled, "hover-item": !disabled }'
          )
        .video(v-for='(fileItem, key) in element.videosFileItems', :key='key')
          TaVideo.mx-auto(
            :src='fileItem.url',
            :class='{ "max-w-[800px]": disabled, "max-w-[400px]": !disabled, "hover-item": !disabled }'
          )
        .audios(v-for='(fileItem, key) in element.audioFileItems', :key='key')
          TaAudio(
            :src='fileItem.url',
            :name='fileItem.name',
            :class='{ "max-w-[800px]": disabled, "max-w-[400px]": !disabled, "hover-item": !disabled,  "!mx-auto": true }'
          )
        .files
          TaAttachments.mx-auto(
            :attachments='element.fileFileItems',
            :class='{ "max-w-[800px]": disabled, "max-w-[400px]": !disabled, "hover-item": !disabled }'
          )
        .operations.flex(v-if='!disabled')
            TaIconTooltip.icon.handle(
              icon='MenuOutlined',
              :tips='t("taComponent.TaContentField.sortText")',
            )
            TaIconTooltip.icon(
              icon='FormOutlined',
              :tips='t("taComponent.TaContentField.edit")',
              @click='onEdit(index)',
              v-if='element.body'
            )
            TaPopoverConfirm.destroy(
              :title='t("taComponent.TaContentField.tip")',,
              :content='t("taComponent.TaContentField.sureAction")',
              placement='bottomRight',
              @confirm='onDelete(index)'
            )
              TaIconTooltip.icon(icon='DeleteOutlined', :tips='t("taComponent.TaContentField.delete")', :danger='true')

  .actions.bg-gray-50.rounded-b-lg(v-if='!disabled' :class='contentModules.length > 0 ? "" : "rounded-t-lg"')
    .divide-x.divide-gray-300.h-26.flex-around.w-full
      .action.h-9.flex-center.w-full(v-if='!hideText', icon='PlusOutlined', @click='onCreate')
        .button.h-11.flex-center.flex-col
          img.w-5.h-5.mx-auto.mb-1.hover.hidden(
            src='https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/public/icon-translate%403x%E9%80%89%E4%B8%AD.png'
          )
          img.w-5.h-5.mx-auto.mb-1.not-hover(
            src='https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/public/icon-translate%403x.png'
          )
          .text.text-sm.font-regular.text-gray-900 {{t('taComponent.TaContentField.addText')}}
      TaFileUploader.action.flex-between(
        v-if='!hideImage',
        accept='image/*',
        v-model:value='activeModule.images',
        :multiple='true',
        :showList='false',
        :showTips='false',
        :options='{ fileSize: imageFileSize }'
        @progress='onProgress("image", $event)',
        @update:isAllSettled='isAllSettled("image", $event)'
      )
        .flex-center.h-9.relative
          .button.h-11.flex-center.flex-col
            img.w-5.h-5.mx-auto.mb-1.hover.hidden(
              src='https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/public/icon-photograph%403x%E9%80%89%E4%B8%AD.png'
            )
            img.w-5.h-5.mx-auto.mb-1.not-hover(
              src='https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/public/icon-photograph%403x.png'
            )
            .text.text-sm.font-regular.text-gray-900 {{t('taComponent.TaContentField.addImage')}}
          .absolute.-bottom-5.w-full
            a-progress(
              v-if='progressingFileItems.image?.fileKey',
              :percent='progressingFileItems.image.percent',
              :showInfo='false',
              :status='progressingFileItems.image.status === "error" ? "exception" : "active"'
            )
      TaFileUploader.action.flex-between(
        v-if='!hideVideo',
        accept='video/*',
        v-model:value='activeModule.videos',
        :multiple='true',
        :showList='false',
        :showTips='false',
        :options='{ fileSize: videoFileSize }'
        @progress='onProgress("video", $event)',
        @update:isAllSettled='isAllSettled("video", $event)'
      )
        .flex-center.h-9.relative(@click='openFile')
          .button.h-11.flex-center.flex-col
            img.w-5.h-5.mx-auto.mb-1.hover.hidden(
              src='https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/public/icon-film%403x%E9%80%89%E4%B8%AD.png'
            )
            img.w-5.h-5.mx-auto.mb-1.not-hover(
              src='https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/public/icon-film%403x.png'
            )
            .text.text-sm.font-regular.text-gray-900 {{t('taComponent.TaContentField.addVideo')}}
          .absolute.-bottom-5.w-full
            a-progress(
              v-if='progressingFileItems.video?.fileKey',
              :percent='progressingFileItems.video.percent',
              :showInfo='false',
              :status='progressingFileItems.video.status === "error" ? "exception" : "active"'
            )
      TaFileUploader.action(
        v-if='!hideAudio',
        accept='audio/*',
        v-model:value='activeModule.audios',
        :multiple='true',
        :showList='false',
        :showTips='false',
        :options='{ fileSize: audioFileSize }'
        @progress='onProgress("audio", $event)',
        @update:isAllSettled='isAllSettled("audio", $event)'
      )
        .flex-center.h-9.relative(@click='openFile')
          .button.h-11.flex-center.flex-col
            img.w-5.h-5.mx-auto.mb-1.hover.hidden(
              src='https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/public/icon-music-note-%E9%80%89%E4%B8%AD%403x.png'
            )
            img.w-5.h-5.mx-auto.mb-1.not-hover(
              src='https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/public/icon-music-note%403x.png'
            )
            .text.text-sm.font-regular.text-gray-900 {{t('taComponent.TaContentField.addAudeo')}}
          .absolute.-bottom-5.w-full
            a-progress(
              v-if='progressingFileItems.audio?.fileKey',
              :percent='progressingFileItems.audio.percent',
              :showInfo='false',
              :status='progressingFileItems.audio.status === "error" ? "exception" : "active"'
            )
      TaFileUploader.action(
        v-if='!hideFile',
        accept='*',
        v-model:value='activeModule.files',
        :multiple='true',
        :showList='false',
        :showTips='false',
        :options='{ fileSize: fileFileSize }'
        @progress='onProgress("file", $event)',
        @update:isAllSettled='isAllSettled("file", $event)'
      )
        .flex-center.h-9.relative(@click='openFile')
          .button.h-11.flex-center.flex-col
            img.w-5.h-5.mx-auto.mb-1.hover.hidden(
              src='https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/public/icon-folder%403x%E9%80%89%E4%B8%AD.png'
            )
            img.w-5.h-5.mx-auto.mb-1.not-hover(
              src='https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/public/icon-folder%403x.png'
            )
            .text.text-sm.font-regular.text-gray-900  {{t('taComponent.TaContentField.addFile')}}
          .absolute.-bottom-5.w-full
            a-progress(
              v-if='progressingFileItems.file?.fileKey',
              :percent='progressingFileItems.file.percent',
              :showInfo='false',
              :status='progressingFileItems.file.status === "error" ? "exception" : "active"'
            )
  a-modal(
    v-model:visible='visibleForm',
    v-if='visibleForm',
    :title="t('taComponent.TaContentField.textContent')",
    :maskClosable='false',
    :centered='true',
    :closable='false',
    :width='860',
    :okText="t('taComponent.TaContentField.sure')",
    :cacelText="t('taComponent.TaContentField.cancel')",
    @cancel='() => { visibleForm = false; }',
    @ok='onSubmit'
  )
    TaTextarea(v-if='useNormalText', v-model:value='activeModule.body')
    TaRichEditor(
      v-else,
      ref='richEditor',
      :key='richEditorKey',
      v-model:value='activeModule.body',
      :toolbar='toolbar',
      height='360px',
      :placeholder="t('taComponent.TaContentField.placeText')"
    )
</template>

<style lang="stylus" scoped>
.ta-content-field
  width 100%
  .modules
    width 100%
    .module
      width 100%
      padding 6px 0px
      position relative
      &:hover
        .operations
          display flex
      .body
        color #383838
        >>> *
          // font-size 16px
          // line-height 36px
      .cover-image
        width 100%
        margin-bottom 12px
        &:last-child
          margin 0px
        img
          width 100%
      .operations
        position absolute
        top 0px
        right 0px
        display none
        background #fff
        box-shadow 0px 1px 6px 0px rgba(0, 0, 0, 0.1)
        border-radius 3px
        padding 10px
        z-index 999
        .icon
          margin-left 4px
.hover-item
  &:hover
    @apply bg-indigo-50 border-radius-4
.action
  @apply flex-grow
  cursor pointer
  &:hover
    .text
      color $primary-color
    .button
      .hover
        display block
      .not-hover
        display none
</style>
