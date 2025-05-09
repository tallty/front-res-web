<script lang="ts">
import { ref, defineComponent, toRefs, computed, watch, PropType } from 'vue';
import { ResAdminUsersApi } from '@/res-core/apis/res/admin/users.api';
import { VStore } from '@/lib/vails';
import useTaBuilderCss from './useTaBuilderCss';
import {
  TaBuilderComponent,
  propIsSlotProp,
  TaBuilderSlotProp,
  propIsSimpleProp,
  propIsComplexProp,
  TaBuilderEvent,
} from '../types';
import { merge } from 'lodash';
import { onMounted } from '@vue/runtime-core';
import { injectTaBuilderDesignerActiveItem } from '../designer/useActiveItem';
import { injectTaBuilderPreview, usePreviewClickable } from './usePreview';
import { useScreenDataFetchCollectionInject } from '@/components/global/ta-component/TaBuilder/builder/useScreenDataFetchCollection';

export const taBuilderTreeNodeProps = {
  componentSchema: { type: Object as PropType<TaBuilderComponent>, required: true },
  slotArguments: { type: Object, default: () => ({}) },
  // nested: { type: Boolean, default: true },

  // // designer layer 会利用 default 插槽，换成 children 循环出的 TaBuilderDesignerCell
  isDesignerUseDefaultProps: { type: Boolean, default: false },
};

const TaBuilderTreeNode = defineComponent({
  name: 'TaBuilderTreeNode',
  components: {},
  props: taBuilderTreeNodeProps,
  emits: ['reportComponent', 'pop'],
  mounted() {
    if (this.activeItemMeta) {
      (this.activeItemMeta as any).renderComponents.push(this);
    }
  },
  setup(props, { emit }) {
    const componentRef = ref<any>(null);
    const { activeItemMeta } = injectTaBuilderDesignerActiveItem();

    const { cssId } = useTaBuilderCss(props);

    const slotProps = computed(() => {
      const allProps = props.componentSchema?.props || ({} as Record<string, TaBuilderSlotProp>);
      const fromProps = Object.keys(allProps).reduce((out, key) => {
        const prop = allProps[key];
        if (propIsSlotProp(prop)) {
          out[key] = prop;
        }
        return out;
      }, {} as Record<string, TaBuilderSlotProp>);
      // children 的塞到 default slot
      const fromChildren: Record<string, TaBuilderComponent[]> = {};

      if (props.componentSchema?.children) {
        props.componentSchema.children.forEach((item: TaBuilderComponent) => {
          const slotKey = props.isDesignerUseDefaultProps
            ? 'default'
            : item.slot && item.is_slot_root
            ? item.slot.split('@')[1]
            : 'default';

          if (!fromChildren[slotKey]) fromChildren[slotKey] = [];
          fromChildren[slotKey].push(item);
        });
      }

      return merge(fromChildren, fromProps);
    });

    // computed 里写 new Function，会失去响应式
    const bindProps = ref<Record<string, any>>({});
    const getBindProps = () => {
      const allProps = props.componentSchema?.props || {};
      const result = Object.keys(allProps).reduce((out, key) => {
        const prop = allProps[key];

        if (propIsSimpleProp(prop)) {
          out[key] = prop;
        }
        if (propIsComplexProp(prop)) {
          if (prop.type === 'function') {
            out[key] = new Function(`"use strict"; ${prop.value}`);
          } else if (prop.type === 'expression') {
            // out[key] = { store: new VStore(new ResAdminUsersApi()) };
            out[key] = new Function(
              'a',
              `"use strict"; ${
                prop.value.trim().startsWith('return ')
                  ? prop.value.trim()
                  : `return ${prop.value.trim()}`
              }`,
            ).call({ computed, VStore, ResAdminUsersApi, slot: props.slotArguments }, 1);
          } else {
            out[key] = prop.value;
          }
        }
        return out;
      }, {} as Record<string, any>);
      return result;
    };

    watch(
      () => props.componentSchema?.props,
      () => (bindProps.value = getBindProps()),
      { deep: true, immediate: true },
    );

    const bindPropsAllRequired = computed(() => {
      const allProps = props.componentSchema?.props || {};
      return Object.keys(bindProps.value)
        .filter(key => {
          const prop = allProps[key];
          return propIsComplexProp(prop) && prop.required;
        })
        .map(key => bindProps.value[key])
        .reduce((a, b) => a && b, true);
    });

    onMounted(() => {
      emit('reportComponent', componentRef.value);
    });

    const onPop = (key: string) => {
      emit('pop', key);
    };

    // 只保留最外层的 css， 大括号内的，转换为类，类赋到dom上
    const style = computed(() => {
      return `${props.componentSchema?.css?.replace(/\{(.|\n)+\}/g, '') || ''}`;
    });

    const { previewMeta } = injectTaBuilderPreview();

    const clickable = computed(() => {
      return (
        (props.componentSchema as any).click || (props.componentSchema?.events?.length || 0) > 0
      );
    });

    const { onClick: onPreviewClick } = usePreviewClickable(props);

    const onClick = () => {
      // 旧逻辑
      if (previewMeta && (props.componentSchema as any).click) {
        previewMeta.visibleMap[String((props.componentSchema as any).click)] = true;
        return;
      }

      // 新逻辑
      if (clickable.value) {
        props.componentSchema?.events?.forEach((event: TaBuilderEvent) => {
          onPreviewClick(event);
        });
      }
    };

    return {
      ...toRefs(props),
      cssId,
      slotProps,
      bindProps,
      bindPropsAllRequired,
      componentRef,
      onPop,
      style,
      activeItemMeta,
      visibleMap: previewMeta?.visibleMap || {},
      onClick,
      clickable,
    };
  },
});

export default TaBuilderTreeNode;
</script>

<template lang="pug">
component(
  ref='componentRef',
  v-if='bindPropsAllRequired',
  v-model:componentSchema='componentSchema',
  :slotProps='slotProps',
  v-bind='bindProps',
  :is='componentSchema.component',
  :style='style',
  :class='`${componentSchema.class || ""} ${cssId} ${clickable ? "clickable" : ""}`',
  :slotArguments='slotArguments',
  @pop='onPop',
  @click='onClick'
)
  template(v-for='(slotProp, key) in slotProps', v-slot:[key]='thisSlotArguments' )
    slot(:name='key')
      TaBuilderTreeNode(
        v-for='schema in slotProp',
        :componentSchema='schema',
        :slotArguments='thisSlotArguments'
        :class='{ ["!relative"]: key !== "default" }'
      )

</template>

<style lang="stylus" scoped>
.clickable
  @apply cursor-pointer
  &:hover
    text-shadow 0px 0px 1px rgb(255 255 255 / 20%), 0px 0px 1px rgb(255 255 255 / 10%);
</style>
