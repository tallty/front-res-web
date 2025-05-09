<script lang="ts">
import { ref, toRefs, computed, PropType } from 'vue';
import { IFile } from '../../file/file';
import FileServer from '@/components/global/ta-component/file/servers';
import { defineTaBuilderCellComponent } from './defineTaBuilderCellComponent';
import { injectTaBuilderDesignerActiveItem } from '../designer/useActiveItem';

const TaLayer = defineTaBuilderCellComponent({
  name: 'TaLayer',
  components: {},
  props: {
    url: { label: '图片链接', type: String, default: '', formType: 'input' },
    // fixed or flex
    display: {
      label: '布局',
      type: String,
      default: 'block',
      formType: 'select',
      select: [
        { label: '固定布局', value: 'block' },
        { label: '流式布局', value: 'flex' },
      ],
    },
    fileItems: {
      label: '上传图片',
      type: Array as PropType<IFile[]>,
      formType: 'image_single',
      default: [],
    },
  },
  setup(props: any) {
    const fileServer = new FileServer();

    const url = computed(
      () =>
        props.url ||
        (props.fileItems?.[0]?.fileKey ? fileServer.getCDNUrl(props.fileItems[0]) : ''),
    );

    const background = computed(() => `url(${url.value}) center / cover no-repeat`);
    const { activeItem } = injectTaBuilderDesignerActiveItem();

    const editing = computed(() => !!activeItem);

    return {
      background,
      editing,
    };
  },
});
export default TaLayer;
</script>

<template lang="pug">
.ta-layer(:class='{ "flex-layer": display === "flex" && !editing }')
  slot
</template>

<style lang="stylus" scoped>
.ta-layer
  background v-bind(background)
  display v-bind(display)
</style>

<style lang="stylus">
.flex-layer >  *
  position relative !important
  top unset !important
  bottom unset !important
  left unset !important
  right unset !important
</style>
