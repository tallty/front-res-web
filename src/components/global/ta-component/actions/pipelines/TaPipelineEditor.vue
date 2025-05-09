<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref } from 'vue';
import { VObject } from '@/lib/vails';
import { TaPipelineType, TaPipeline } from '../types';

export const TaPipelineTypeConfigMapping: VObject = {
  [TaPipelineType.DataForm]: {
    label: '表单',
    icon: 'FileTextOutlined',
  },
  [TaPipelineType.Jsonata]: {
    label: 'jsonata',
    icon: 'ItalicOutlined',
  },
  [TaPipelineType.Function]: {
    label: '类方法',
    icon: 'FunctionOutlined',
  },
  [TaPipelineType.SourceMethod]: {
    label: '关联对象方法',
    icon: 'LinkOutlined',
  },
  [TaPipelineType.Editor]: {
    label: '综合编辑器',
    icon: 'FormOutlined',
  },
  [TaPipelineType.None]: {
    label: '无数据处理逻辑',
    icon: 'MinusOutlined',
  },
};

const TaPipelineEditor = defineComponent({
  name: 'TaPipelineEditor',
  components: {},
  props: {
    value: { type: Object as PropType<TaPipeline>, required: true },
    disabled: { type: Boolean, default: false },
    dataFormOptions: { type: Array, default: () => [] },
  },
  emits: ['delete', 'update:value'],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const onChangeType = ({ key }: any) => {
      // if (key == '_delete') {
      //   emit('delete');
      // } else {
      localValue.value.type = key;
      // }
    };

    const onDelete = () => {
      emit('delete');
    };

    const editor = ref<any>(null);
    const activeDataFormOption = computed(() => editor.value?.activeDataFormOption);

    return {
      ...toRefs(props),
      localValue,
      onChangeType,
      TaPipelineTypeConfigMapping,
      TaPipelineType,
      onDelete,
      editor,
      activeDataFormOption,
    };
  },
});
export default TaPipelineEditor;
</script>

<template lang="pug">
.ta-pipeline-editor.flex.items-center.h-full
  .pipeline-label.flex-shrink-0.flex
    a-dropdown.switch.cursor-pointer
      .flex.items-center.justify-center.bg-primary.w-10.min-h-10.rounded-l
        TaIcon.text-white(
          v-if='TaPipelineTypeConfigMapping[localValue.type]?.icon',
          :type='TaPipelineTypeConfigMapping[localValue.type]?.icon',
          color='white',
        )
        .text-white.text-xs(v-else) 请选择
      template(#overlay)
        a-menu(@click='onChangeType')
          a-menu-item(v-for='(option, key) in TaPipelineTypeConfigMapping', :key='key')
            .flex.items-center
              TaIcon(:type='option.icon')
              span.ml-1 {{ option.label }}
          a-menu-item(key='_delete')
            TaPopoverConfirm(
              title='确定删除吗？',
              okText='确定',
              cancelText='取消',
              @click.stop='',
              @confirm='onDelete'
            )
              .flex.items-center.text-red-500
                TaIcon(type='DeleteOutlined')
                span.ml-1 删除

  .pipeline-content.items-center.flex.max-w-100.bg-primary-100.h-10
    template(v-if='value.type === TaPipelineType.DataForm')
      TaPipelineDataFormEditor.px-2(
        ref='editor',
        v-model:value='localValue',
        :disabled='disabled',
        :dataFormOptions='dataFormOptions'
      )
    template(v-else-if='value.type === TaPipelineType.Jsonata')
      TaPipelineJsonataEditor.px-2(
        ref='editor',
        v-model:value='localValue',
        :disabled='disabled',
      )
    template(v-else-if='value.type === TaPipelineType.Function')
      TaPipelineFunctionEditor.px-2(
        ref='editor',
        v-model:value='localValue',
        :disabled='disabled',
      )
    template(v-else-if='value.type === TaPipelineType.SourceMethod')
      TaPipelineSourceMethodEditor.px-2(
        ref='editor',
        v-model:value='localValue',
        :disabled='disabled',
      )
    template(v-else-if='value.type === TaPipelineType.Editor')
      TaPipelineEditorEditor.px-2(
        ref='editor',
        v-model:value='localValue',
        :disabled='disabled',
        :dataFormOptions='dataFormOptions'
      )
</template>

<style lang="stylus" scoped>
.bg-primary
  background $primary-color
.bg-primary-100
  background lighten($primary-color, 80%)
</style>
