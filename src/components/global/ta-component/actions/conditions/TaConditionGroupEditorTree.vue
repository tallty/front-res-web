<script lang="ts">
import { defineComponent, toRefs, computed, onMounted } from 'vue';

const TaConditionGroupEditorTree = defineComponent({
  name: 'TaConditionGroupEditorTree',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
    dataFormOptions: { type: Array, default: () => [] },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    onMounted(() => {
      if (!localValue.value.actions) {
        localValue.value.actions = [];
      }
    });

    const onAddAction = () => {
      localValue.value.actions.push({
        condition: {},
        pipeline: {},
      });
    };

    const onChangeRelationType = () => {
      localValue.value.actions_relation_type =
        localValue.value.actions_relation_type === 'or' ? 'and' : 'or';
    };

    const onDelete = (index: number) => {
      localValue.value.actions.splice(index, 1);
    };

    return {
      ...toRefs(props),
      localValue,
      onAddAction,
      onChangeRelationType,
      onDelete,
    };
  },
});
export default TaConditionGroupEditorTree;
</script>

<template lang="pug">
.ta-condition-group-editor-tree.flex.items-center(v-if='localValue.actions')
  .flex.h-10.w-10.flex.justify-center.items-center.cursor-pointer(
    @click='onChangeRelationType'
)
    | {{ localValue.actions_relation_type === 'or' ? '或' : '且' }}
  .flex.flex-shrink-0
    .line.flex.flex-col.flex-shrink-0.w-8.w-full
      .line-bottom.grid.grid-cols-2.grid-rows-2.w-8.flex-shrink-0(class='h-1/2')
        .w-4.border-solid.border-l-4.border-primary.-ml-1.-mb-1px.col-start-2(
          class='rounded-tl-2/1'
        )
        .w-4.border-solid.border-r-4.border-primary(
          class='rounded-br-2/1'
        )
      .line-top.grid.grid-cols-2.grid-rows-2(class='h-1/2')
        .w-4.border-solid.border-r-4.border-primary(
          class='rounded-tr-2/1'
        )
        .w-4.border-solid.border-l-4.border-primary.-ml-1.-mt-1px.row-start-2.col-start-2(
          class='rounded-bl-2/1'
        )

    .condition-group.flex.flex-col
      .condition-item.flex-shrink-0.w-full.flex.items-center(v-for='(action, index) in localValue.actions')
        TaActionEditor.m-4.w-fit(
          v-model:value='localValue.actions[index]',
          :showTrigger='false',
          :dataFormOptions='dataFormOptions',
          @delete='onDelete(index)'
        )
          template(#condition-group)
            TaConditionGroupEditorTree(
              v-model:value='localValue.actions[index].condition',
              :dataFormOptions='dataFormOptions',
            )

      .condition-item-add.rounded.m-4.h-10.w-10.flex.items-center.justify-center.bg-gray-200.cursor-pointer(@click.stop='onAddAction')
        TaIcon(type='PlusOutlined')

</template>

<style lang="stylus" scoped>
.border-primary
  border-color $primary-color
.w-fit
  width fit-content
// .condition-item
//   .hover
</style>
