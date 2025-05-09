<script lang="ts">
import { toRefs, defineComponent, PropType } from 'vue';
import FileServer, {
  IFile,
} from '@/components/global/ta-component/file/servers';
import dayjs from 'dayjs';
import { TaTemplateFormColumnAttribute } from '../ta-template-form-core/types';

const TaCellValueFormatter = defineComponent({
  name: 'TaCellValueFormatter',
  props: {
    value: { type: [String, Number, Object, Array], default: '' },
    column: {
      type: Object as PropType<TaTemplateFormColumnAttribute>,
      default: () => ({}),
    },
  },
  setup(props) {
    const isHref = (value: string) => {
      return (
        value && typeof value === 'string' && value.trim().startsWith('http')
      );
    };

    const isTime = (value: string) => {
      if (typeof value === 'string') {
        return value.match(/^\d{1,4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}/);
      } else {
        return false;
      }
    };

    const isColor = (value: string) => {
      if (typeof value === 'string') {
        return (
          value.match(/^#([a-fA-F\d]{6}|[a-fA-F\d]{3})$/) ||
          value
            .replace(/\s/, '')
            .match(
              /rgb\((0|1\d{0,2}|2[0-5]{2}),(0|1\d{0,2}|2[0-5]{2}),(0|1\d{0,2}|2[0-5]{2})\)/
            ) ||
          value
            .replace(/\s/, '')
            .match(
              /rgba\((0|1\d{0,2}|2[0-5]{2}),(0|1\d{0,2}|2[0-5]{2}),(0|1\d{0,2}|2[0-5]{2})\),\d+/
            )
        );
      } else {
        return false;
      }
    };

    const getThumbnailUrl = (fileItem: IFile) => {
      return new FileServer().getThumbnailUrl(fileItem, 150, 150);
    };

    const openHref = () => {
      window.open(props.value as string);
    };

    return {
      ...toRefs(props),
      isHref,
      isTime,
      getThumbnailUrl,
      dayjs,
      openHref,
      isColor,
    };
  },
});

export default TaCellValueFormatter;
</script>

<template lang="pug">
.ta-cell-value-formatter
  //- http 链接
  TaTextButton(v-if='isHref(value)', @click.stop='openHref') {{ value }}
  //- 文件数组
  .file-previewer(v-else-if='value && typeof value === "object" && value[0] && value[0].fileKey')
    .file(v-for='file in value')
      template(v-if='file.mimeType.startsWith("image")')
        img.image(:src='getThumbnailUrl(file)')
      template(v-else)
        TaAttachments(:attachments='[file]')
  //- 布尔
  div(v-else-if='typeof value === "boolean"') {{ value ? '是' : '否'}}
  //- 数组
  div(v-else-if='typeof value === "object"') {{ value ? (typeof value.join === "function" ? value.join("、") : value) : '-' }}
  //- 时间
  div(v-else-if='isTime(value)') {{ dayjs(value).format("YYYY-MM-DD HH:mm") }}
  div.h-4.w-10.rounded(v-else-if='isColor(value)', :style='{ background: value }')
  div(
    v-else,
    :class='{ truncate: column.ellipsis }',
    :style='{ color: column.color }',
  ) {{ value === 0 ? value : (value || '-') }}
</template>

<style lang="stylus" scoped>
.image
  height 50px
// .ta-cell-value-formatter
//   width 100%
</style>
