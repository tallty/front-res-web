<script lang="tsx">
import { ref, defineComponent, toRefs, PropType, computed, onMounted, onUnmounted, h } from 'vue';
import {
  toastInterface,
  useToastCard,
} from '@/components/global/ta-component/TaIndexView/ta-index-view-core/useToast';
import { VObject } from '@/lib/vails/model';
import { useRouter } from 'vue-router';
import CommJsxComponent from './commJsxComponent';

const TaToastCard = defineComponent({
  name: 'TaToastCard',
  components: {
    CommJsxComponent,
  },
  props: {
    toast: { type: Object as PropType<toastInterface>, required: true },
  },
  setup(props) {
    const iconConfig = computed(() => {
      return props.toast.type
        ? (
            {
              info: { type: 'CheckCircleOutlined', colorClass: '!text-green-400' },
              error: { type: 'WarningOutlined', colorClass: '!text-red-400' },
              warning: { type: 'InfoCircleOutlined', colorClass: '!text-orange-400' },
            } as VObject
          )[props.toast.type]
        : {};
    });

    const router = useRouter();

    const {
      onSubmit,
      subButtonText,
      buttonText,
      onSubButtonSubmit,
      contentConfig,
      onContentCallback,
      time,
      onCancel,
    } = useToastCard(props, (path: string) => {
      if (path.startsWith('http')) {
        window.open(path);
      } else {
        router.push(path);
      }
    });

    return {
      ...toRefs(props),
      iconConfig,
      onSubmit,
      time,
      onCancel,
      onSubButtonSubmit,
      contentConfig,
      onContentCallback,
      subButtonText,
      buttonText,
    };
  },
});
export default TaToastCard;
</script>

<template lang="pug">
.ta-toast-card.rounded-xl.border.w-110.min-h-120.bg-white.flex-between.flex-col.divide-y(class='border-[#ded5db]' :style='toast.css')
  .head.w-full.h-15.flex-shrink-0.p-4.flex-between
    .left.flex.flex-start
      TaIcon(:type='iconConfig.type', :class='iconConfig.colorClass', :size='20')
      .text-gray-900.ml-2.flex-center 提示
    .right.mb-1
      TaIcon(type='CloseOutlined', @click='onCancel')
  .body.w-full.flex-grow.px-14.pt-5.pb-6.flex-center.max-h-200.flex-col.h-0(class='border-[#ded5db]')
    .overflow-y-auto.h-full.flex.flex-col.items-center
      img.w-35.h-35.mb-4(:src='toast.image || "https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/tech/%E6%8F%90%E4%BA%A4%E6%88%90%E5%8A%9F%20%281%29.png"')
      .title.mb-5.font-bold.text-xl(class='text-gray-[#374151]') {{ toast.title }}
      .content.text-base.text-gray-400
        template(v-for='config in contentConfig')
          span.content-item.ellipsis-4(
            v-if='config.type !== "component"',
            :style='config.css',
            :class='{ primary: config.type === "link" }'
            @click='() => onContentCallback(config)'
          ) {{ config.text }}
          div.content-item(
            v-else-if='config.type === "component"'
            :style='config.css',
            @click='() => onContentCallback(config)'
          )
            CommJsxComponent(:jsxFunction="config.text")

  .footer.w-full.h-15.flex-shrink-0.px-6.py-3.flex-end
    .text-gray-300.mr-4(
      v-if='toast.delay || subButtonText',
      :class='{ "cursor-pointer": toast.subButtonCallback }',
      @click='onSubButtonSubmit',
    )
      | {{ subButtonText || `${time / 1000}秒后自动跳转` }}
    a-button(type='primary', @click='onSubmit', size='large') {{ buttonText || '关闭' }}

</template>

<style lang="stylus" scoped>
.primary
  color $primary-color
  cursor pointer
.ellipsis-4
  overflow hidden
  text-overflow ellipsis
  word-break break-all
  -webkit-box-orient vertical
  -webkit-line-clamp 4
</style>
