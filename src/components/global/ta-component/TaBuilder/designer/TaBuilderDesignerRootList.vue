<script lang="ts">
import { ref, defineComponent, toRefs, nextTick, watch } from 'vue';
import { PropType } from 'vue';
import { TaBuilderComponent } from '../types';
import { injectTaBuilderDesignerActiveItem } from './useActiveItem';

const TaBuilderDesignerRootList = defineComponent({
  name: 'TaBuilderDesignerRootList',
  components: {},
  props: {
    rootItems: { type: Array as PropType<TaBuilderComponent[]>, default: () => [] },
  },
  setup(props) {
    const { activeItemMeta, activeRootKey } = injectTaBuilderDesignerActiveItem();

    const onClickRoot = (rootItem: TaBuilderComponent) => {
      if (activeItemMeta) {
        activeRootKey.value = rootItem.key;
        nextTick(() => {
          activeItemMeta.value.drawerRef.$forceUpdate();
        });
      }
    };

    watch(
      () => props.rootItems,
      () => {
        if (!activeRootKey.value) {
          activeRootKey.value = props.rootItems[0].key;
        }
      },
    );

    return {
      ...toRefs(props),
      onClickRoot,
    };
  },
});
export default TaBuilderDesignerRootList;
</script>

<template lang="pug">
.ta-builder-designer-component-list
  .root-item.py-2.px-4.cursor-pointer(v-for='item in rootItems', @click='onClickRoot(item)')
    TaDblclickInput(v-model:value='item.name')
</template>

<style lang="stylus" scoped></style>
