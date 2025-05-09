<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormTheme,
  defaultThemeImageUrl,
  defaultThemeBackgroundColor,
} from '../ta-template-form-core/types';
import FileServer from '@/components/global/ta-component/file/file';
import defaultTheme from './defaultTheme';

const TaTemplateFormThemeCard = defineComponent({
  name: 'TaTemplateFormThemeCard',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    useDefaultTheme: { type: Boolean, default: false },
    isParentContainer: { type: Boolean, default: false },
  },
  setup(props) {
    const fileServer = new FileServer();
    // none 时 返回 null
    const theme = computed<TaTemplateFormTheme | undefined | null>(() =>
      typeof props.item.options?.theme === 'string'
        ? props.item.options?.theme === 'none'
          ? null
          : undefined
        : (props.item.options?.theme as TaTemplateFormTheme),
    );

    const backgroundColor = computed(
      () =>
        theme.value?.background?.color ||
        (props.useDefaultTheme
          ? defaultTheme.value?.background?.color || defaultThemeBackgroundColor
          : props.item?.type === 'container_layout'
          ? 'rgb(243, 244, 246)'
          : props.item?.type === 'condition'
          ? 'transparent'
          : 'white'),
    );

    const formBackgroundColor = computed(
      () =>
        theme.value?.form?.background ||
        (props.useDefaultTheme
          ? defaultTheme.value?.form?.background || 'white'
          : props.item?.type === 'container_layout'
          ? 'rgb(243, 244, 246)'
          : props.item?.type === 'condition'
          ? 'transparent'
          : 'white'),
    );

    const radius = computed(() =>
      theme.value?.radius
        ? '12px'
        : props.useDefaultTheme
        ? defaultTheme.value?.radius || '12px'
        : '12px',
    );

    // const imageRadius = computed(() => (theme.value?.radius ? '12px 12px 0 0' : ''));
    const imageUrl = computed(() =>
      theme.value?.card?.image && theme.value?.card?.image?.length > 0
        ? fileServer.getCDNUrl(theme.value.card.image[0])
        : props.useDefaultTheme &&
          defaultTheme.value?.card?.image &&
          defaultTheme.value?.card?.image?.length > 0
        ? fileServer.getCDNUrl(defaultTheme.value.card.image[0])
        : '',
    );

    const hasCardContent = computed(
      () => theme.value?.card?.title || theme.value?.card?.content || theme.value?.card?.files,
    );

    return {
      ...toRefs(props),
      theme,
      backgroundColor,
      radius,
      imageUrl,
      hasCardContent,
      formBackgroundColor,
      defaultThemeImageUrl,
    };
  },
});
export default TaTemplateFormThemeCard;
</script>

<template lang="pug">
.ta-template-form-theme-card(v-if='(useDefaultTheme || theme !== null) && (theme?.card?.title || (theme?.card?.content && theme.card.content != "<p><br></p>"))')
  //- (v-if='Object.keys(theme || {}).length > 0 || imageUrl')
  .ta-template-form-theme-card__card__shell
    //- (v-if='Object.keys(theme?.card || {}).length > 0 || imageUrl')
    .ta-template-form-theme-card__card
      img.image(:src='imageUrl || (useDefaultTheme ? defaultThemeImageUrl : "")')
      .content(v-if='hasCardContent')
        .title(v-if='theme?.card?.title') {{ theme?.card?.title }}
        .html(v-if='theme?.card?.content && theme.card.content != "<p><br></p>"', v-html='theme?.card?.content')
        TaFileUploader.files(
          v-if='theme?.card?.files',
          :value='theme?.card?.files',
          :disabled='true'
        )

  .ta-template-form-theme-card__layout(
    :class='{ "is-parent-container": isParentContainer }',
  )
    slot
.ta-template-form-theme-card__default(v-else, :class='{ "is-parent-container": isParentContainer }')
  slot
</template>

<style lang="stylus" scoped>
.ta-template-form-theme-card
  width 100%
  height 100%
  border-radius v-bind(radius)
  // background-color v-bind(backgroundColor)
  .ta-template-form-theme-card__card, .ta-template-form-theme-card__layout
    background white
    border-radius v-bind(radius)
    overflow hidden
  .ta-template-form-theme-card__layout, .content
    padding 12px
  .ta-template-form-theme-card__layout
    background v-bind(formBackgroundColor)
  .ta-template-form-theme-card__card__shell
    // background-color v-bind(backgroundColor)
    // position sticky
    // top 0
    // z-index 99
    padding-bottom 12px
  .ta-template-form-theme-card__card
    .image
      width 100%
    .content
      .title
        font-size 18px
        font-weight 600
        color rgba(38, 38, 38, 0.85)
      .html
        margin 20px 0 12px 0
        white-space pre-wrap
.ta-template-form-theme-card__default
  background v-bind(formBackgroundColor)

.is-parent-container
  @apply m-4 rounded-xl
</style>
