<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';

const TaTemplateFormDesignerSpanConfig = defineComponent({
  name: 'TaTemplateFormDesignerSpanConfig',
  components: {},
  props: {
    value: { type: Object as PropType<TaTemplateFormItem>, required: true },
  },
  setup(props, { emit }) {
    const visible = ref(false);

    const gridCols: number[] = Array(24)
      .fill(0)
      .map((o, i) => i + 1);

    const field = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const onGroupItem = (num: number) => {
      if (!field.value.options) {
        field.value.options = {};
      }
      field.value.options.span = num;
    };

    const showGrid = () => {
      visible.value = !visible.value;
    };

    return {
      ...toRefs(props),
      field,
      onGroupItem,
      visible,
      showGrid,
      gridCols,
    };
  },
});
export default TaTemplateFormDesignerSpanConfig;
</script>

<template lang="pug">
.ta-template-form-designer-span-config
  .form-item
    .label
      .form-item-label 表单占比宽度 ...%
      span.link.text-primary(@click='showGrid')
        | {{ visible ? "隐藏" : "显示更多" }}
    .group
      .group-item(
        v-for='num in [6, 8, 12, 24]',
        :key='num',
        :class='{ "group-item-active": field.options?.span === num }',
        @click='onGroupItem(num)'
      ) {{ ((num * 25) / 6).toFixed() }}
  .form-item(v-if='visible')
    .form-item-label 表单占列数
    a-row(:gutter='10')
      a-col(v-for='num in gridCols', :key='num', :span='4')
        .grid-item(
          :class='{ "grid-item-active": field.options?.span === num }',
          @click='onGroupItem(num)'
        )
          | {{ num }}
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-span-config
  .form-item
    margin-top 20px
    width 100%
    .label
      display flex
      justify-content space-between
    .form-item-label
      margin-bottom 8px
      color #808080
      font-weight 400
      font-size 14px
      line-height 20px
    .wechat-selector
      width 100%
    .condition-selector
      margin-bottom 20px
      width 100%
    .group
      display flex
      border 1px rgba(33, 34, 35, 0.1) solid
      border-radius 3px
      .group-item
        width 25%
        border-left 1px rgba(33, 34, 35, 0.1) solid
        text-align center
        line-height 32px
        cursor pointer
        &:first-child
          border none
      .group-item-active
        background $primary-color
        color #fff
    .grid-item
      margin-bottom 10px
      height 32px
      border 1px rgba(33, 34, 35, 0.1) solid
      text-align center
      line-height 32px
      cursor pointer
    .grid-item-active
      background $primary-color
      color #fff
</style>
