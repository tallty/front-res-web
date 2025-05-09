<script lang="ts">
import { defineComponent, toRefs, ref, computed, PropType } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';

export interface TaCarouselSelectorOptionsInterface {
  label: string;
  value: string;
  component: string;
  overview?: string;
  form?: TaTemplateFormItem;
}

const TaCarouselSelector = defineComponent({
  name: 'TaCarouselSelector',
  components: {},
  props: {
    value: { type: String, default: '' },
    payload: { type: Object, default: () => ({}) },
    showForm: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    options: { type: Array as PropType<TaCarouselSelectorOptionsInterface[]>, required: true },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    // eslint-disable-next-line
    localValue.value || (localValue.value = props.options[0].value);

    const localPayload = computed({
      get: () => props.payload,
      set: val => emit('update:payload', val),
    });

    const current = ref(0);
    const activeForm = ref<TaTemplateFormItem | undefined>({});

    const beforeChange = (_: number, to: number) => {
      current.value = to;
      localValue.value = props.options[to].value;
      // @ts-ignore
      activeForm.value = props.options[to].form;
    };

    const existsIndex = props.options.findIndex(
      (opt: TaCarouselSelectorOptionsInterface) => opt.value === localValue.value,
    );

    if (existsIndex >= 0) {
      beforeChange(existsIndex, existsIndex);
    } else {
      beforeChange(current.value, current.value);
    }

    return {
      ...toRefs(props),
      beforeChange,
      current,
      activeForm,
      localPayload,
    };
  },
});
export default TaCarouselSelector;
</script>

<template lang="pug">
.ta-carousel-selector
  a-carousel(arrows, :beforeChange='beforeChange')
    template(#prevArrow)
      .custom-slick-arrow(v-if='!disabled', style="left: 10px")
        TaIcon.icon(type='LeftOutlined', :size='30', class='!text-gray-900')
    template(#nextArrow)
      .custom-slick-arrow(v-if='!disabled', style="right: 10px")
        TaIcon.icon(type='RightOutlined', :size='30', class='!text-gray-900')
    template(#customPaging='{ i }')
      .paging(
        v-if='!disabled || current === i',
        :style='(options.length - 1 === i || disabled) && "border-right: 0px solid #fff"'
        :class='{ "active-paging": current === i }'
      ) {{ options[i].label }}
    .item-shell(v-for='(item, index) in options', v-if='!disabled')
      .item
        img(v-if='item.overview', :src='item.overview')
        .placeholder(v-else) 暂无预览
    .item-shell(v-else)
      .item
        img(v-if='options[current].overview', :src='options[current].overview')
        .placeholder(v-else) 暂无预览

  TaTemplateForm.form(
    v-if='showForm',
    v-model:modelValue='localPayload',
    :template='activeForm',
  )
</template>

<style lang="stylus">
.ta-carousel-selector
  width 100%
  height 100%
  .custom-slick-arrow
    width 50px
    height 50px
    color #808080
    // background-color rgba(31, 45, 61, 0.11)
    opacity 0.3
    z-index 1
    &:before
      display none
    &:hover
      // background-color rgba(31, 45, 61, 0.11)
      color #808080
      opacity 1
  li
    width fit-content !important
    height fit-content !important
    text-indent 0 !important

  .paging
    color #808080 !important
    border-right 1px solid #808080
    padding 0 5px
    margin 5px 0
    height auto
    cursor pointer
    font-size 1rem
  .active-paging
    font-weight 600
    color #404040 !important
  .item-shell
    height 100%
  .item
    display flex !important
    justify-content center
    align-items center
    img
      max-width 600px
      max-height 300px
    .placeholder
      width 100%
      max-width 600px
      height 300px
      display flex
      justify-content center
      align-items center
  .form
    margin-top 40px
</style>
