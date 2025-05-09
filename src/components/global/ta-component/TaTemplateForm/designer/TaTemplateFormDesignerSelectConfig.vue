<script lang="ts">
import {
  defineComponent,
  toRefs,
  PropType,
  computed,
  WritableComputedRef,
  onMounted,
  ref,
} from 'vue';
import { TaTemplateFormSelect } from '@/components/global/ta-component/ta-template-form-core/types';
import draggable from 'vuedraggable';

const SPLIT_CHAR = '	';

const TaTemplateFormDesignerSelectConfig = defineComponent({
  name: 'TaTemplateFormDesignerSelectConfig',
  components: {
    draggable,
  },
  props: {
    value: {
      type: Object as PropType<{ select?: TaTemplateFormSelect[] }>,
      required: true,
    },
    importable: {
      type: Boolean,
      default: true,
    },
    addable: {
      type: Boolean,
      default: true,
    },
    initialValue: {
      type: Array as PropType<TaTemplateFormSelect[]>,
      default: () => [],
    },
    isSurvey: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const config: WritableComputedRef<{ select?: TaTemplateFormSelect[] }> = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });
    let uuid = 0;

    onMounted(() => {
      if (!config.value.select) {
        config.value.select = props.initialValue;
      }
    });

    const addOption = () => {
      config.value.select!.push({ label: '', value: '', _id: `${Date.now()}_${uuid++}` });
    };

    const deleteOption = (index: number) => {
      config.value.select!.splice(index, 1);
    };

    const text = ref('');
    const visibleImport = ref(false);

    const ImportOptionsByText = () => {
      const result: TaTemplateFormSelect[] = [];
      text.value.split('\n').forEach((line: string) => {
        const [label, value] = line.split(SPLIT_CHAR);
        result.push({ label, value, _id: `${Date.now()}_${uuid++}` });
      });

      config.value.select = result;
      visibleImport.value = false;
    };

    const openImport = () => {
      text.value = config.value
        .select!.map((select: TaTemplateFormSelect) =>
          [select.label, select.value].join(SPLIT_CHAR),
        )
        .join('\n');
      visibleImport.value = true;
    };

    return {
      ...toRefs(props),
      config,
      addOption,
      deleteOption,
      text,
      visibleImport,
      ImportOptionsByText,
      openImport,
    };
  },
});
export default TaTemplateFormDesignerSelectConfig;
</script>

<template lang="pug">
.ta-template-form-designer-select-config(v-if='config?.select')
  TaTextButton.button(v-if='importable',@click='openImport') 批量编辑
  draggable(:list='config.select')
    template(#item='{ element, index }' item-key='label')
      .option
        .item
          .label 名称
          a-input.input(v-model:value='element.label')
        .item(v-if='!isSurvey')
          .label 值
          a-input.input(v-model:value='element.value')
        .option-icon.delete(@click='deleteOption(index)')
          TaIcon(type='DeleteOutlined')
  .add-action(icon='plus', @click='addOption',v-if='addable')
    TaIcon(type='PlusOutlined')
    span(style='margin-left: 4px') 添加选项
  a-modal(v-model:visible='visibleImport', @ok='ImportOptionsByText', :closable='false')
    a-textarea.textarea(v-model:value='text', :autosize='{ minRows: 10 }')
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-select-config
  .button
    margin-bottom 12px
  .option
    position relative
    margin-bottom 10px
    padding 10px
    border 1px solid #bfcbd9
    border-radius 3px
    &:hover
      border 1px solid #f9ca48
      cursor pointer
      .option-icon
        display inline
    .option-item
      display flex
      align-items center
      .option-item-label
        width 64px
        color #808080
    .select
      width 150px
    .item
      display flex
      justify-content space-between
      padding 5px 0
      .label
        line-height 30px
      .input
        width 150px
  .option-icon
    position absolute
    top 0
    right 0
    display none
    padding 2px
    width 20px
    height 20px
    border-radius 0px
    background #f9ca48
    color #fff
    line-height 16px
  .add-action
    display flex
    justify-content center
    align-items center
    width 100%
    border 1px dashed #bfcbd9
    color #888
    font-size 12px
    line-height 32px
    &:hover
      border 1px dashed #20A0FF
      color #20A0FF
      cursor pointer
.textarea
  min-height 400px
</style>
