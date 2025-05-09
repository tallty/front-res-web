<script lang="ts">
import { ref, toRefs, computed, PropType } from 'vue';
import FileServer, { IFile } from '@/components/global/ta-component/file/servers';
import { defineTaBuilderCellComponent } from '../builder/defineTaBuilderCellComponent';

const TaChartImage = defineTaBuilderCellComponent({
  name: 'TaChartImage',
  components: {},
  props: {
    url: { label: '图片链接', type: String, default: '', formType: 'input' },
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

    // const background = computed(() => `url(${url.value}) center / cover no-repeat`);

    return {
      ...toRefs(props),
      // background,
      url,
    };
  },
});
export default TaChartImage;
</script>

<template lang="pug">
img.ta-chart-image(:src='url')
</template>

<style lang="stylus" scoped>
// .ta-chart-image
  // background v-bind(background)
</style>
