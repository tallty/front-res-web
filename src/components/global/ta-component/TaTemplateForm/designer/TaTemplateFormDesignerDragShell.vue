<script lang="ts">
import {
  defineComponent,
  toRefs,
  PropType,
  computed,
  inject,
  Ref,
  watch,
  ref,
  onMounted,
} from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormLayoutTypeAry,
} from '@/components/global/ta-component/ta-template-form-core/types';
import useActiveField, { useActiveFieldKey } from './useActiveField';
import useModelKeyPrefix from './useModelKeyPrefix';
import { merge } from 'lodash';
import elementDetectorGenerator from 'element-resize-detector';

const TaTemplateFormDesignerDragShell = defineComponent({
  name: 'TaTemplateFormDesignerDragShell',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    closable: { type: Boolean, default: false },
    isSurvey: { type: Boolean, default: false },
  },
  emits: ['copy', 'delete', 'update:item'],
  setup(props, { emit }) {
    const activeField = inject(useActiveFieldKey) as Ref<TaTemplateFormItem>;

    const active = computed(() => activeField.value.key === props.item.key);
    // const color = computed(() => {
    //   if (['list', 'condition', 'layout'].includes(props.item.type as string)) {
    //     return '#2AA1FF';
    //   }

    //   return '#2AA1FF';
    // });

    const { modelKeyPrefix } = useModelKeyPrefix();

    watch(
      modelKeyPrefix,
      () => {
        emit('update:item', merge(props.item, { model_key_prefix: modelKeyPrefix.value }));
      },
      { deep: true, immediate: true },
    );

    const onClick = () => {
      activeField.value = props.item;
    };

    const onCopy = () => {
      emit('copy', props.item);
    };

    const { reset } = useActiveField();

    const onDelete = () => {
      emit('delete', props.item);
      reset(activeField);
    };

    const buttons = computed(() =>
      hover.value
        ? [
            {
              key: 'key',
              label: props.item.model_key,
              hover: true,
            },
            {
              key: 'copy',
            },
            {
              key: 'delete',
            },
          ]
        : [],
    );

    const border = computed(() => TaTemplateFormLayoutTypeAry.includes(props.item.type!));
    const hover = ref(false);

    const innerComponentDiv = ref<any>(null);
    const lowerComponentDiv = ref<any>(null);

    const componentHeight = ref('');

    onMounted(() => {
      if (
        innerComponentDiv.value &&
        TaTemplateFormLayoutTypeAry.includes(props.item.type as string)
      ) {
        componentHeight.value = `${innerComponentDiv.value.offsetHeight}px`;
        const elementDetector = elementDetectorGenerator({
          strategy: 'scroll',
        });
        elementDetector.listenTo(innerComponentDiv.value, (element: any) => {
          componentHeight.value = `${element.clientHeight}px`;
        });
      }
    });

    return {
      ...toRefs(props),
      // color,
      active,
      onClick,
      onDelete,
      onCopy,
      buttons,
      border,
      TaTemplateFormLayoutTypeAry,
      innerComponentDiv,
      componentHeight,
      lowerComponentDiv,
      hover,
    };
  },
});
export default TaTemplateFormDesignerDragShell;
</script>

<template lang="pug">
.ta-template-form-designer-drag-shell(
  :class='{ active, border, hover }',
  @click.stop='onClick',
  @mouseenter.stop='() => hover = true',
  @mouseleave.stop='() => hover = false'
)
  //- TaIcon.drag-handler(v-if='active', type='DragOutlined') +
  .ta-template-form-designer-drag-shell__cover
    TaCapsuleMultiButton.ta-template-form-designer-drag-shell__actions(
      :buttons='buttons',
      :shadow='true',
      size='middle',
      v-if='!isSurvey'
    )
      template(#key='{ item }')
        .key {{ item.label }}
      template(#copy )
        TaIconTooltip.tooltip(icon='CopyOutlined', tips='复制', @click='onCopy')
      template(#delete)
        TaIconTooltip.tooltip(icon='DeleteOutlined', tips='删除', @click='onDelete')
    .component.min-h-10(
      v-if='TaTemplateFormLayoutTypeAry.includes(item.type)',
      ref='innerComponentDiv'
    )
      slot
  .component.lower-component.min-h-10(
    ref='lowerComponentDiv',
    :style='{ height: componentHeight }'
  )
    slot(
      v-if='!TaTemplateFormLayoutTypeAry.includes(item.type)',
    )
</template>

<style lang="stylus" scoped>
.opacity
  opacity 0
.ta-template-form-designer-drag-shell
  width calc(100% - 24px)
  height fit-content
  border-radius 12px
  position relative
  padding 12px 0
  margin 12px
  background white
  // min-height 100px
  display flex
  align-items center
  overflow hidden
  cursor all-scroll
  >>> .ta-template-form-field
    margin-bottom 0
  >>> .ta-template-form-field__item
    margin-bottom 0

  .ta-template-form-designer-drag-shell__cover
    z-index 2
    position absolute
    // background red
    top 0
    left 0
    width 100%
    height 100%
    .ta-template-form-designer-drag-shell__actions
      position absolute
      top 8px
      right 13px
      z-index 20
      // >>> .ta-capsule-multi-button__key
      //   display none

  .component
    width 100%
    height fit-content
    padding 0 12px
    z-index 1

.hover
  background rgb(243, 244, 246)
  // .ta-template-form-designer-drag-shell__actions
  //   >>> .ta-capsule-multi-button__key
  //     display flex

.active
  background #EFF3FD

.border
  border 1px dashed $primary-color
  border-radius 0

.key
  padding 4px
  color $primary-color
</style>
