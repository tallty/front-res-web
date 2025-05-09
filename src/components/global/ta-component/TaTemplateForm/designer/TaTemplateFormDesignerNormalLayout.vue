<script lang="ts">
import draggable from 'vuedraggable';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { toRefs, onMounted, PropType, defineComponent, ref, computed } from 'vue';
import useActiveField from './useActiveField';
import useDraggableLanding from './useDraggableLanding';
import useOptionsConfig from '@/components/global/ta-component/ta-template-form-core/useOptionsConfig';
import useModelKeyPrefix from './useModelKeyPrefix';

const TaTemplateFormDesignerNormalLayout = defineComponent({
  name: 'TaTemplateFormDesignerNormalLayout',
  components: {
    draggable,
  },
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    top: { type: Boolean, default: false },
    isSurvey: { type: Boolean, default: false },
    // second: { type: Boolean, default: false }, // second 表示第二层，新版第二层都是 normal layout，且不可拖动
    modelKeyPrefix: { type: String, default: '' },
    resetModelKeyPrefix: { type: Boolean, default: false },
    cardEditable: { type: Boolean, default: true },
  },
  emits: ['update:item', 'addSecondNormalLayout'],
  setup(props, { emit }) {
    // onMounted(() => {
    //   if (!props.item.fields) {
    //     updateFields([]);
    //   }
    // });

    const updateFields = (fields: TaTemplateFormItem[]) => {
      emit('update:item', {
        ...props.item,
        fields,
      });
    };

    useModelKeyPrefix(props, props.resetModelKeyPrefix);

    const { clone, destroy } = useActiveField();

    const onCopy = (field: TaTemplateFormItem) => {
      updateFields(clone(field, props.item));
    };

    const onDelete = (field: TaTemplateFormItem) => {
      updateFields(destroy(field, props.item));
    };

    const draggable = computed(() => {
      return !(props.top && props.item?.type === 'container_layout');
    });

    const { onMove, onDragEnd } = useDraggableLanding(draggable);

    const optionsReactive = computed(() => props.item.options);
    useOptionsConfig(optionsReactive);

    const background = computed(() => {
      // console.log(props.item?.options);
      return (
        (typeof props.item?.options?.theme === 'object' &&
          props.item?.options?.theme?.background?.color) ||
        (props.item?.type === 'container_layout' ? 'rgb(243, 244, 246)' : 'white')
      );
    });

    const onAddSecondNormalLayout = () => {
      emit('addSecondNormalLayout');
    };

    return {
      ...toRefs(props),
      onCopy,
      onDelete,
      onMove,
      onDragEnd,
      background,
      onAddSecondNormalLayout,
    };
  },
});

export default TaTemplateFormDesignerNormalLayout;
</script>

<template lang="pug">
.ta-template-form-designer-normal-layout(v-if='item?.fields', :class='{ "auto-height": top }')
  .name {{ item.name }}
  TaTemplateFormDesignerNormalLayoutThemeEditor.theme-editor(
    v-if='cardEditable',
    v-model:item='item'
  )
  div(:class='{ "drag-area-padding": item.type === "layout" ||  item.type === "container_layout" }')
    draggable.drag-area(
      handle='.ta-template-form-designer-drag-shell',
      :ghost='null',
      chosenclass='red',
      :list='item.fields',
      tag='div',
      group='widgets',
      item-key='key',
      direction='horizontal',
      ghost-class='ghost-class',
      :animation='200'
      :move='onMove',
      @end='onDragEnd'
    )
      template(#item='{ element }')
        a-col.col(:span='element.options?.span || 24')
          TaTemplateFormDesignerDragShell(
            :closable='!top',
            :item='element',
            :isSurvey='isSurvey'
            @copy='onCopy',
            @delete='onDelete'
          )
            template(v-if='element.type === "layout" || element.type === "container_layout"')
              TaTemplateFormDesignerNormalLayout(
                :item='element',
                :cardEditable='false',
              )
            template(v-else-if='element.type === "condition"')
              TaTemplateFormDesignerConditionLayout(:item='element')
            template(v-else-if='["list", "nested_attributes"].includes(element.type)')
              TaTemplateFormDesignerNormalLayout(
                :item='element',
                :resetModelKeyPrefix='true',
                :cardEditable='false'
              )
            template(v-else-if='element.type === "key_layout"')
              TaTemplateFormDesignerNormalLayout(
                :item='element',
                :modelKeyPrefix='element.model_key'
                :cardEditable='false'
              )
            template.bg-gray-100(v-else)
              .field-color-shell
                TaTemplateFormField.field(v-prevent, :item='element')

    .bg-gray-100.py-4(v-if='top && item?.type === "container_layout"')
      .add-field.border.border-gray-200.rounded-xl.h-10.w-full.flex.items-center.justify-center.text-gray-500.text-xl.bg-white.cursor-pointer(
        @click='onAddSecondNormalLayout'
      )
        | +


</template>

<style scoped lang="stylus">
.ta-template-form-designer-normal-layout
  width 100%
  height 100%
  position relative
  background v-bind(background)
  display flex
  flex-direction column
  margin-top 12px
  .name
    padding 0px 24px 12px 24px
    font-size 14px
    font-weight 500
    color rgba(38, 38, 38, 0.85)
  .theme-editor
    margin 20px 20px 0 20px
  .drag-area
    min-height 100px
    // padding 20px 0
    display flex
    flex-wrap wrap
    align-content flex-start
    // row-gap 0px
  .drag-area-padding
    margin 12px 20px
    flex-grow 1
    // background white
    border-radius 12px
.auto-height
  height auto
.ghost-class
  // display none
  width 100%
  background #EFF3FD
  overflow hidden
  color rgba(89, 89, 89, 0.65)
  border 1px solid rgba(89, 89, 89, 0.65)
  display flex
  justify-content center
  align-items center
  border-radius 12px
  min-height 100px

.col
  height fit-content
</style>
