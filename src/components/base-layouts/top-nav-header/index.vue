<template>
  <div :class="classNames">
    <div ref="headRef" :class="headerClassName">
      <div :class="`${prefixedClassName}-main-left`" @click="handleMenuHeaderClick">
        <div :class="`${prefixedClassName}-logo`" key="logo" id="logo">
          <slot v-if="hasLogoSlot" name="logo" />
          <div v-else>
            <router-link :to="{ name: 'index' }">
              <img src="@/assets/logo.png" alt="logo" />
              <h1>Admin Pro</h1>
            </router-link>
          </div>
        </div>
      </div>
      <div :style="{ flex: 1 }" :class="`${prefixedClassName}-menu`">
        <base-menu
          v-if="menus && menus.length > 0"
          mode="horizontal"
          :i18n="i18n"
          :theme="theme"
          :menus="menus"
          :open-keys="openKeys"
          :selected-keys="selectedKeys"
          @update:openKeys="handleOpenKeys"
          @update:selectedKeys="handleSelectedKeys"
        />
      </div>
      <right-content>
        <slot name="rightContent" />
      </right-content>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';
import { useProProvider } from '../pro-provider/index';
import BaseMenu from '@/components/base-layouts/base-menu/index.vue';
import RightContent from '../top-nav-header/right-content.vue';

export default defineComponent({
  props: {
    prefixCls: {
      type: String,
      default: undefined,
    },
    layout: {
      type: String,
      default: 'side',
    },
    theme: {
      type: String,
      default: 'dark',
    },
    contentWidth: {
      type: String,
      default: 'Fluid',
    },

    // menu
    menus: {
      type: Array,
      default: (): Array<any> => [],
    },
    openKeys: {
      type: Array,
      required: true,
    },
    selectedKeys: {
      type: Array,
      required: true,
    },
  },
  emits: ['update:openKeys', 'update:selectedKeys'],
  setup(props, { slots, emit }) {
    const { theme, contentWidth, prefixCls: customizePrefixCls } = toRefs(props);
    const { i18n, getPrefixCls } = useProProvider();
    const prefixedClassName = customizePrefixCls.value || getPrefixCls('top-nav-header');

    const hasMix = computed(() => props.layout === 'mix');
    const classNames = computed(() => {
      return {
        [prefixedClassName]: true,
        ['light']: theme.value === 'light',
      };
    });
    const headerClassName = computed(() => {
      return {
        [`${prefixedClassName}-main`]: true,
        ['wide']: contentWidth.value === 'Fixed',
      };
    });
    const { logo: hasLogoSlot } = slots;

    /** events */
    const handleSelectedKeys = (selectedKeys: string[]): void => {
      emit('update:selectedKeys', selectedKeys);
    };
    const handleOpenKeys = (openKeys: string[]): void => {
      emit('update:openKeys', openKeys);
    };
    const handleMenuHeaderClick = (): void => {};

    return {
      i18n,

      classNames,
      headerClassName,
      prefixedClassName,
      hasMix,
      hasLogoSlot,

      handleSelectedKeys,
      handleOpenKeys,
      handleMenuHeaderClick,
    };
  },
  components: {
    BaseMenu,
    RightContent,
  },
});
</script>

<style lang="less">
@import url('./index.less');
</style>
