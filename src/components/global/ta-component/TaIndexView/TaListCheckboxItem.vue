<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from 'vue';
import { VModel } from '@/lib/vails/model';
import type { IRowSection } from './TaSidebarList.vue';

const TaListCheckboxItem = defineComponent({
  name: 'TaListCheckboxItem',
  props: {
    index: { type: Number, default: 0 },
    tree: { type: Object, required: false },
    record: { type: Object, required: true },
    rowKey: { type: String, default: 'id' },
    disabled: { type: Boolean, default: false },
    disable_tree_parent: { type: Boolean, default: false },
    showCheckbox: { type: Boolean, default: true },
    rowSelection: { type: Object as PropType<IRowSection<number, VModel>>, required: true },
    indeterminate: { type: Boolean, default: false },
  },
  emits: ['change', 'rowClick'],
  setup(props, { emit }) {
    const checked = computed(() => {
      if (Array.isArray(props.rowSelection.selectedRowKeys)) {
        const key = props.record[props.rowKey];
        return props.rowSelection.selectedRowKeys.indexOf(key) > -1;
      }

      return false;
    });

    const handleCheckboxChange = () => {
      emit('change', props.record[props.rowKey], props.record);
    };

    const rowClick = () => {
      emit('rowClick', props.record);
    };

    const disableItem = computed(() => {
      if (props.disabled) return true;
      if (props?.disable_tree_parent) {
        if ((props.tree?.$children || []).length > 0) return true;
      }
      return false;
    });

    return {
      ...toRefs(props),
      checked,
      handleCheckboxChange,
      rowClick,
      disableItem,
    };
  },
});

export default TaListCheckboxItem;
</script>

<template lang="pug">
.ta-list-checkbox-item
  .control(v-if='showCheckbox')
    a-checkbox(
      :checked='checked',
      :disabled='disableItem',
      :indeterminate='indeterminate',
      @change='handleCheckboxChange'
    )
  .list-card(@click='rowClick')
    slot(:record='record', :index='index', :isActive='checked')
</template>

<style lang="stylus" scoped>
.ta-list-checkbox-item
  display flex
  // padding 5px 0
  width 100%
  .control
    flex 0 0 25px
    align-self center
  .list-card
    flex 1
    width 100%
</style>
