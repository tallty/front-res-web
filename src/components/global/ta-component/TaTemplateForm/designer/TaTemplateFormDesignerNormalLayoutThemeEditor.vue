<script lang="ts">
import FileServer from '@/components/global/ta-component/file/file';
import { ref, defineComponent, toRefs, computed, reactive, nextTick, onMounted } from 'vue';
import defaultTheme from '../defaultTheme';
import { defaultThemeImageUrl } from '../../ta-template-form-core/types';

const TaTemplateFormDesignerNormalLayoutThemeEditor = defineComponent({
  name: 'TaTemplateFormDesignerNormalLayoutThemeEditor',
  components: {},
  props: {
    item: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const localItem = computed({
      get: () => props.item,
      set: val => emit('update:item', val),
    });

    // if (!localItem.value.options) {
    //   localItem.value.options = {};
    // }

    // if (!localItem.value.options.theme) {
    //   localItem.value.options.theme = {
    //     card: {},
    //     background: {},
    //     form: {},
    //   };
    // }

    // if (!localItem.value.options.theme?.card) localItem.value.options.theme.card = {};
    // if (!localItem.value.options.theme?.background) localItem.value.options.theme.background = {};
    // if (!localItem.value.options.theme?.form) localItem.value.options.theme.form = {};

    const visibleGroup = reactive({
      content: false,
      files: false,
      theme: false,
    });

    const uploader = ref<any>(null);

    const onFilesClick = () => {
      visibleGroup.files = true;
      uploader.value.openFile();
    };

    const hasCard = computed(() => localItem.value?.options?.theme?.card);

    const fileServer = new FileServer();
    const imageUrl = computed(() => {
      return (
        (localItem.value?.options?.theme?.card?.image?.[0] &&
          fileServer.getCDNUrl(localItem.value.options.theme.card.image[0])) ||
        (defaultTheme.value?.card?.image && defaultTheme.value?.card?.image?.length > 0
          ? fileServer.getCDNUrl(defaultTheme.value.card.image[0])
          : defaultThemeImageUrl)
      );
    });

    return {
      ...toRefs(props),
      localItem,
      visibleGroup,
      uploader,
      onFilesClick,
      hasCard,
      imageUrl,
    };
  },
});
export default TaTemplateFormDesignerNormalLayoutThemeEditor;
</script>

<template lang="pug">
.ta-template-designer-normal-layout-theme-editor(v-if='localItem?.options')
  img.image(v-if='imageUrl', :src='imageUrl')
  .editor
    .group(v-if='hasCard')
      TaInputDiv.title(
        v-model:value='localItem.options.theme.card.title',
        placeholder='请输入标题',
        :style='{ fontSize: "18px", fontWeight: 600, color: "rgba(38,38,38,0.85)" }'
      )
    .content(v-if='hasCard')
      .group(v-if='!visibleGroup.content', @click='() => (visibleGroup.content = true)')
        .content-html(
          v-if='localItem.options.theme.card.content',
          v-html='localItem.options.theme.card.content'
        )
        TaTextButton.placeholder(v-else, icon='MessageOutlined') 添加表单描述
      template(v-else)
        .content-editor
          .content-editor-header
            a-button(type='primary', @click='() => (visibleGroup.content = false)') 完成
          TaRichEditor.content-editor-body(
            v-model:value='localItem.options.theme.card.content',
            :autoFocus='true'
          )
    .files(v-if='hasCard')
      .group(
        v-show='localItem.options.theme.card.files && localItem.options.theme.card.files?.length > 0 || visibleGroup.files'
      )
        TaFileUploader(ref='uploader', v-model:value='localItem.options.theme.card.files')
      .group(v-if='!visibleGroup.files', @click='onFilesClick')
        TaTextButton.placeholder(icon='UploadOutlined') 添加附件
    .group(@click='() => (visibleGroup.theme = true)')
      TaTextButton.placeholder(icon='TagsOutlined') 表单样式
  TaTemplateFormDesignerNormalLayoutThemeChest(
    v-model:visible='visibleGroup.theme',
    v-model:options='localItem.options'
  )
</template>

<style lang="stylus" scoped>
.ta-template-designer-normal-layout-theme-editor
  background white
  border-radius 12px
  .image
    width 100%
    border-radius 12px 12px 0 0
    display flex
  .editor
    padding 20px
    .title
      margin-bottom 20px
    .content
      .content-editor
        border 1px solid #D9D9D9
        border-radius 4px
        .content-editor-header
          padding 4px 8px
          display flex
          justify-content flex-end
          height 40px
          background #FFFFFF
          border-bottom 1px solid #D9D9D9
      .content-html
        white-space pre-wrap
    .group
      padding 6px
      width 100%
      cursor pointer
      &:hover
        background rgb(243, 244, 246)
      .placeholder
        margin 0
        color rgba(89, 89, 89, 0.65)
</style>
