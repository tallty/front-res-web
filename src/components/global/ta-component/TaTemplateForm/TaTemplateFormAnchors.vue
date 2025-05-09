<script lang="ts">
import { defineComponent, toRefs, computed, PropType, ref, watch, nextTick } from 'vue';
import useProcessFields from '../ta-template-form-core/useProcessFields';
import { TaTemplateFormItem } from '../ta-template-form-core/types';

interface TaTemplateFormAnchorInterface {
  key: string;
  label: string;
}
const TaTemplateFormAnchors = defineComponent({
  name: 'TaTemplateFormAnchors',
  components: {},
  emits: [],
  props: {
    formComponent: { type: Object, default: undefined },
  },
  setup(props) {
    const template = computed(() => props.formComponent?.localTemplate);

    const { processField } = useProcessFields();
    const anchors = computed(() => {
      const result: TaTemplateFormAnchorInterface[] = [];
      if (template.value && typeof template.value === 'object') {
        processField(template.value, (item: TaTemplateFormItem) => {
          if (item.options?.anchor) {
            result.push({ key: item.key!, label: item.name! });
          }
        });
      }
      return result;
    });

    const visible = ref(true);
    const activeAnchor = ref<Partial<TaTemplateFormAnchorInterface>>({});

    const onClickAnchor = (anchor: TaTemplateFormAnchorInterface) => {
      scrollIntoViewCallbackLocked.value = true;
      activeAnchor.value = anchor;
      props.formComponent?.scrollIntoViewByKey(anchor.key, 'always');
      setTimeout(() => (scrollIntoViewCallbackLocked.value = false), 500);
    };

    const cursorStyle = computed(() => {
      const index = anchors.value.findIndex(anchor => anchor.key == activeAnchor.value.key);
      return index > -1 ? { top: `${index * 32}px` } : { display: 'none' };
    });

    const scrollIntoViewCallbackLocked = ref(false);

    const generateScrollIntoViewCallback = (fieldComponent: any) => {
      return (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && !scrollIntoViewCallbackLocked.value) {
          activeAnchor.value = { key: fieldComponent.item.key };
        }
      };
    };

    // const observers: any[] = [];

    const anchorFields = computed(
      () =>
        props.formComponent?.fieldComponents?.filter(
          (fieldComponent: any) => fieldComponent.item.options?.anchor,
        ) || [],
    );

    watch(
      anchorFields,
      () => {
        anchorFields.value.forEach((fieldComponent: any) => {
          const observer = new IntersectionObserver(
            generateScrollIntoViewCallback(fieldComponent),
            { threshold: 1.0 },
          );
          observer.observe(fieldComponent.$el);
        });
      },
      { immediate: true },
    );

    const visibleTooltip = ref(true);

    return {
      ...toRefs(props),
      visible,
      anchors,
      onClickAnchor,
      activeAnchor,
      cursorStyle,
      visibleTooltip,
    };
  },
});
export default TaTemplateFormAnchors;
</script>

<template lang="pug">
.ta-template-form-anchors(v-if='anchors.length > 0', @transitionend='() => visibleTooltip = false')
  .switch
    a-tooltip(
      v-model:visible='visibleTooltip',
      :title='visible ? "点击收起" : "点击展开"',
    )
      img.icon(
        src='https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/public/%E9%94%9A%E7%82%B9.png',
        @click='() => visible = !visible'
      )
    .list.flex(:class='{ tiny: !visible }')
      .line
        .cursor(:style='cursorStyle')
      .anchors
        .anchor(
          v-for='anchor in anchors',
          :class='{ "active-anchor": anchor.key === activeAnchor.key }'
          @click='onClickAnchor(anchor)'
        )
          | {{ anchor.label }}
</template>

<style lang="stylus" scoped>
.ta-template-form-anchors
  .switch
    width 34px
    height 34px
    background white
    position relative
    .icon
      width 34px
      height 34px
      display flex
      justify-content center
      align-items center
      cursor pointer
    .list
      position absolute
      right 44px
      top 0
      width 158px
      padding 20px
      background white
      transition all 0.3s
      overflow hidden
      .line
        position relative
        display flex
        justify-content center
        width 2px
        margin-right 21px
        background rgba($primary-color, 0.1)
        .cursor
          position absolute
          background $primary-color
          width 4px
          height 26px
          border-radius 2px
          transition all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)
      .anchor
        font-size 14px
        font-weight 400
        color rgba(89, 89, 89, 0.65)
        line-height 20px
        cursor pointer
        margin-bottom 12px
        white-space nowrap
        text-overflow ellipsis
        overflow hidden
        width 94px
        &:last-child
          margin-bottom 0
      .active-anchor
        font-weight 500
        color rgba(38, 38, 38, 0.85)
    .tiny
      width 0
      padding 0
      overflow hidden
</style>
