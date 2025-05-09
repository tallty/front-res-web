<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed, onMounted, onUnmounted } from 'vue';
import {
  toastInterface,
  useToastCard,
} from '@/components/global/ta-component/TaIndexView/ta-index-view-core/useToast';
import { VObject } from '@/lib/vails/model';
import { useRouter } from 'vue-router';

const TaToastMiniCard = defineComponent({
  name: 'TaToastMiniCard',
  components: {},
  props: {
    toast: { type: Object as PropType<toastInterface>, required: true },
  },
  setup(props) {
    const iconConfig = computed(() => {
      return props.toast.type
        ? ({
            info: { type: 'solid/check-circle', colorClass: '!text-green-400' },
            error: { type: 'WarningOutlined', colorClass: '!text-red-400' },
            warning: { type: 'InfoCircleOutlined', colorClass: '!text-orange-400' },
          } as VObject)[props.toast.type]
        : {};
    });

    const router = useRouter();

    const {
      onSubmit,
      onSubButtonSubmit,
      contentConfig,
      onContentCallback,
      time,
      onCancel,
    } = useToastCard(props, (path: string) => router.push(path));

    return {
      ...toRefs(props),
      iconConfig,
      onSubmit,
      time,
      onCancel,
      onSubButtonSubmit,
      contentConfig,
      onContentCallback,
    };
  },
});
export default TaToastMiniCard;
</script>

<template lang="pug">
.ta-toast-mini-card.flex.w-fit.px-4.items-start.py-4.border-l.border-l-green-500.border-l-6.bg-white.shadow.rounded(
)
  .card__l.mr-2
    TaIcon.w-5.h-5(:type='iconConfig.type', :class='iconConfig.colorClass')
  .card__r.w-full
    .card__r-top.mb-3.flex.justify-between.w-full.items-center
      .card__title.text-sm.mr-4 {{ toast.title }}
      TaIcon(type='CloseOutlined',:size='14', @click='onCancel')
    .card__r-bottom.text-sm.text-gray-400.mr-4
      span.content-item(
        v-for='config in contentConfig',
        :style='config.css',
        :class='{ primary: config.type === "link" }'
        @click='() => onContentCallback(config)'
      )
        | {{ config.text }}

</template>

<style lang="stylus" scoped>
.w-fit
  width fit-content
.primary
  color $primary-color
  cursor pointer
</style>
