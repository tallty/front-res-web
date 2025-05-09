<script lang="ts">
import { ref, defineComponent, toRefs, PropType, nextTick, computed } from 'vue';
import { TaBuilderComponent, propIsSlotProp, TaBuilderSlotProp } from '../types';
import { injectTaBuilderDesignerActiveItem } from './useActiveItem';
import { initRoot } from './initRoot';
import useTaBuilderProcessItem from '../useTaBuilderProcessItem';

const TaBuilderDesignerParentBreadcrumb = defineComponent({
  name: 'TaBuilderDesignerParentBreadcrumb',
  components: {},
  props: {
    ancestryWithSelfChain: { type: Array as PropType<TaBuilderComponent[]>, default: () => [] },
  },
  setup(props) {
    const { activeItem, activeItemMeta, activeRootKey } = injectTaBuilderDesignerActiveItem();

    const onClick = (comp: TaBuilderComponent) => {
      activeRootKey.value = comp.key;
      activeSlotKey.value = comp.slot;
      nextTick(() => {
        if (activeItemMeta?.value) {
          activeItemMeta.value.drawerRef.$forceUpdate();
        }
      });
    };

    const self = computed(() => props.ancestryWithSelfChain[0] || {});

    const slotProps = computed(() =>
      Object.keys(self.value.props || {}).reduce((out, key) => {
        const prop = self.value.props?.[key];
        if (prop && propIsSlotProp(prop)) {
          out[key] = prop;
        }
        return out;
      }, {} as Record<string, TaBuilderSlotProp>),
    );

    const activeSlotKey = computed({
      get: () => activeItemMeta?.value?.activeSlotKey,
      set: val => {
        if (activeItemMeta?.value) {
          activeItemMeta.value.activeSlotKey = val;
        }
      },
    });

    // const onSlotTabReset = () => {
    //   activeSlotKey.value = '';
    // };

    const { generateKey } = useTaBuilderProcessItem();

    const onSlotTabClick = (slot: TaBuilderSlotProp, slotKey: string) => {
      if (activeSlotKey.value === slotKey) {
        activeSlotKey.value = '';
      } else if (activeItemMeta?.value) {
        const drawerRef = activeItemMeta.value.drawerRef;

        const parentKey = drawerRef.activeRoot.key;
        activeSlotKey.value = `${parentKey}@${slotKey}`;

        const existsItem = drawerRef.activeRoot.children.find(
          (item: TaBuilderComponent) =>
            item.slot === activeSlotKey.value && item.parent_key === drawerRef.activeRoot.key,
        );
        if (existsItem) {
          activeRootKey.value = existsItem.key;
        } else {
          const newItem = {
            ...initRoot,
            name: `${drawerRef.activeRoot.name}-${slotKey}插槽`,
            key: generateKey(),
            parent_key: activeRootKey.value,
            slot: activeSlotKey.value,
            is_slot_root: true,
          };
          drawerRef.localValue.push(newItem);
          activeRootKey.value = newItem.key;
        }
        nextTick(() => {
          if (activeItem) {
            activeItem.value = drawerRef.activeRoot;
          }
        });
      }
    };

    return {
      ...toRefs(props),
      onClick,
      slotProps,
      activeSlotKey,
      // onSlotTabReset,
      onSlotTabClick,
    };
  },
});
export default TaBuilderDesignerParentBreadcrumb;
</script>

<template lang="pug">
.ta-builder-designer-parent-breadcrumb.flex
  .flex.flex-row-reverse.py-2
    .breadcrumb.py-1.flex(
      v-for='(comp, index) in ancestryWithSelfChain',
      :class='{ "cursor-pointer": index !== 0 }',
      @click='() => onClick(comp)'
    )
      .name {{ comp.name }}
      .point.mx-2(v-if='index !== 0') >
  .flex.ml-2.my-2.space-x-2
    //- .slot-tab(
    //-   :class='{ "active-slot-tab": "" === activeSlotKey }'
    //-   @click='onSlotTabReset'
    //- )
    //-   | 主插槽
    .slot-tab(
      v-for='(slot, key) in slotProps',
      :class='{ "active-slot-tab": key === activeSlotKey }'
      @click='() => onSlotTabClick(slot, key)'
    )
      | {{ slot.condition?.complex_condition?.name ? `条件 ${slot.condition?.complex_condition?.name}` : key }} 插槽
</template>

<style lang="stylus" scoped>
.slot-tab
  @apply "rounded bg-gray-200 text-white flex items-center justify-center py-1 px-2 cursor-pointer"
.active-slot-tab
  background $primary-color
</style>
