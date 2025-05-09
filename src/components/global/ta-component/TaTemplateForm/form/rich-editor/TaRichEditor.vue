<script lang="ts">
import '@wangeditor/editor/dist/css/style.css'; // 引入 css

import { onBeforeUnmount, ref, shallowRef, defineComponent, computed } from 'vue';

import { Boot, IDomEditor } from '@wangeditor/editor';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import mentionModule from '@wangeditor/plugin-mention';
import markdownModule from '@wangeditor/plugin-md';
import { useRichEditorMention } from './useRichEditorMention';
import { toRefs } from '@vue/reactivity';
import { useRichEditorFileUploader } from './useRichEditorFileUploader';
import uploadAttachmentPluginModule from './plugins/upload-attachment/index';
// import myImagePluginModule from './plugins/my-image/index';
import { IFile } from '../../../file/file';
import { AttachmentElement } from './plugins/upload-attachment/custom-types';
import { useRichEditorPreviewerTrigger } from './useRichEditorPreviewer';
import { nextTick } from 'vue';

Boot.registerModule(mentionModule);
Boot.registerModule(markdownModule);
Boot.registerModule(uploadAttachmentPluginModule);
// Boot.registerModule(myImagePluginModule);

let seq = 0;

const TaRichEditor = defineComponent({
  name: 'TaRichEditor',
  components: { Editor, Toolbar },
  props: {
    value: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    height: { type: String, default: '400px' },
    placeholder: { type: String, default: '请输入内容...' },
  },
  setup(props, { emit }) {
    const componentSeq = seq++;

    // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef();

    const {
      taRichEditorPreviewerConfig,
      defineEmitter: definePreviewerEmitter,
      triggerEmitter: onPreviewFile,
    } = useRichEditorPreviewerTrigger(componentSeq);

    definePreviewerEmitter();

    const {
      showMentionSelector,
      hideMentionSelector,
      mentionSelector,
      mentionSelectorValue,
      insertMention,
    } = useRichEditorMention(editorRef);

    const { fileUploader, fileUploaderValue, customUpload } = useRichEditorFileUploader();

    const getInsertFileFn = (editor: IDomEditor) => {
      return (link: string, fileName: string, _: string, fileItem: IFile) => {
        if (!fileName || !link) return;

        // 还原选区
        editor.restoreSelection();

        // 插入节点
        const attachmentElem: AttachmentElement = {
          type: 'attachment',
          fileName,
          link,
          mimeType: fileItem.mimeType,
          children: [{ text: '' }],
        };

        editor.insertNode(attachmentElem);
        editor.move(1);
      };
    };

    const customPaste = (editor: IDomEditor, event: ClipboardEvent, callback: Function) => {
      const data = event.clipboardData;
      const files = data?.files;
      if (files && files.length > 0) {
        // fileList 对象没有 forEach 方法, 所以使用 for 循环
        for (var i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file.type.includes('image') && !file.type.includes('video')) {
            customUpload(file, getInsertFileFn(editor)).then(() => {
              callback(false);
            });
          }
        }
      }
      callback(true);
    };

    const toolbarConfig = {
      toolbarKeys: [
        // 菜单 key
        // 'headerSelect',
        // 'bold',
        // 'underline',
        // 'italic',
        // 'through',
        // 'code',
        // 'sub',
        // 'sup',
        // 'clearStyle',
        // 'color',
        // 'bgColor',
        // 'fontSize',
        // 'fontFamily',
        // 'indent',
        // 'delIndent',
        // 'justifyLeft',
        // 'justifyRight',
        // 'justifyCenter',
        // 'justifyJustify',
        // 'lineHeight',
        // 'insertImage',
        // 'deleteImage',
        // 'editImage',
        // 'viewImageLink',
        // 'imageWidth30',
        // 'imageWidth50',
        // 'imageWidth100',
        // 'divider',
        // 'emotion',
        // 'editLink',
        // 'unLink',
        // 'viewLink',
        // 'codeBlock',
        // 'blockquote',
        // 'headerSelect',
        // 'header1',
        // 'header2',
        // 'header3',
        // 'header4',
        // 'header5',
        // 'todo',
        // 'redo',
        // 'undo',
        // 'fullScreen',
        // 'enter',
        // 'bulletedList',
        // 'numberedList',
        // 'insertTable',
        // 'deleteTable',
        // 'insertTableRow',
        // 'deleteTableRow',
        // 'insertTableCol',
        // 'deleteTableCol',
        // 'tableHeader',
        // 'tableFullWidth',
        // 'insertVideo',
        // 'uploadVideo',
        // 'editVideoSize',
        // 'uploadImage',
        // 'codeSelectLang',
        // 'DeleteAttachment',
        // 'DownloadAttachment',
        // // 分割线
        // '|',
        'headerSelect',
        '|',
        'bold',
        'underline',
        'italic',
        'color',
        'bgColor',
        '|',
        // 'bulletedList',
        // 'numberedList',
        'todo',
        'insertLink',
        // 菜单组，包含多个菜单
        {
          key: 'justify', // 必填，要以 group 开头
          title: '对齐', // 必填
          // iconSvg: '<svg>....</svg>', // 可选
          menuKeys: ['justifyLeft', 'justifyRight', 'justifyCenter', 'justifyJustify'], // 下级菜单 key ，必填
        },
        '|',
        'uploadImage',
        // 'codeBlock',
        // 继续配置其他菜单...
      ],
    };

    const editorConfig = computed(() => ({
      componentSeq,
      placeholder: props.disabled ? '' : props.placeholder,
      autoFocus: false,
      hoverbarKeys: {
        attachment: {
          // menuKeys: ['DeleteAttachment', 'DownloadAttachment'], // “下载附件”菜单
        },
      },
      MENU_CONF: {
        uploadImage: { customUpload },
        uploadVideo: { customUpload },
      },
      EXTEND_CONF: {
        mentionConfig: {
          showModal: showMentionSelector,
          hideModal: hideMentionSelector,
        },
      },
    }));

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value;
      if (editor == null) return;
      editor.destroy();
    });

    const localValue = computed({
      get: () => {
        return props.disabled ? setTableClass(props.value) : props.value;
      },
      set: val => {
        emit('update:value', val);
      },
    });
    const onEditorCreated = (editor: any) => {
      editorRef.value = editor;

      if (props.disabled) {
        editor.disable();
      }
      localValue.value = props.value || '<p></p>';

      nextTick(() => {
        if (props.disabled) {
          const imgs = editorElement.value.$el.getElementsByTagName('img');
          console.log(imgs, 'imgs');

          for (let i = 0; i < imgs.length; i++) {
            const element = imgs[i];
            const href = element.getAttribute('data-href');
            if (href) {
              element.style.cursor = 'pointer';
              element.addEventListener('click', () => {
                onPreviewFile({
                  url: href,
                  fileName: element.getAttribute('alt'),
                  mimeType: 'image',
                });
              });
            }
          }
        }
      });
    };

    // watch(localValue, (newValue: string, oldValue: string) => {
    //   if (newValue !== oldValue) {
    //     localValue.value = setTableClass(newValue);
    //     emit('update:value', newValue);
    //   }
    // });
    const setTableClass = (html: any) => {
      if (html.match(/<table/)) {
        return html
          .replace(/ class="article-table"/gi, '')
          .replace(/<table/gi, '<table class="article-table"');
      }
      return html;
    };
    const editorElement = ref<any>(null);

    return {
      ...toRefs(props),
      editorRef,
      editorElement,
      localValue,
      mode: 'default', // 或 'simple'
      toolbarConfig,
      editorConfig,
      onEditorCreated,
      // mention
      mentionSelector,
      mentionSelectorValue,
      insertMention,
      // file
      fileUploader,
      fileUploaderValue,
      // wps
      customPaste,
      taRichEditorPreviewerConfig,
    };
  },
});

export default TaRichEditor;
</script>

<template lang="pug">
.ta-rich-editor.w-full.z-10.rounded.flex.flex-col(
  :class='{ "border-gray-200": !disabled, border: !disabled }',
)
  Toolbar.toolbar.w-full.flex-shrink-0(
    v-if='!disabled',
    :editor="editorRef"
    :defaultConfig="toolbarConfig"
    :mode="mode"
  )
  Editor.editor.w-full.flex-grow(
    ref='editorElement',
    v-model="localValue"
    :class='{ editing: !disabled }',
    :defaultConfig="editorConfig"
    :mode="mode"
    @onCreated="onEditorCreated"
    @customPaste='customPaste'
  )

  template(v-if='!disabled')
    TaUserPolymorphicField(
      ref='mentionSelector',
      v-model:value='mentionSelectorValue',
      :item='{ key: "key" }'
      @ok='insertMention',
    )
      template(#display='{ open }')
        .hidden

    TaFileUploader(
      ref='fileUploader',
      v-model:value='fileUploaderValue',
      class='!hidden',
    )

  TaFilePreviewer(
    v-model:visible='taRichEditorPreviewerConfig.visible'
    :attachment='taRichEditorPreviewerConfig.fileItem'
  )
</template>

<style lang="stylus" scoped>
.ta-rich-editor
  .toolbar
    >>> .w-e-bar
      background-color rgba(241, 245, 249, 1)
  .editor
    ::-webkit-scrollbar
      width: 0 !important
    -ms-overflow-style none
    scrollbar-width none
  .editing
    min-height v-bind(height)
    >>> #w-e-element-3
      min-height v-bind(height)
    >>> [data-slate-editor]
      min-height v-bind(height)
    >>> .w-e-scroll
      min-height v-bind(height)
  >>> h1
    font-size 22px
  >>> h2
    font-size 20px
  >>> h3
    font-size 18px
  >>> h4
    font-size 16px
</style>
