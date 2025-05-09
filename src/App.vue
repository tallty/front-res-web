<template lang="pug">
a-config-provider(:locale='zhCN')
  router-view
</template>

<script lang="ts">
import { provide, computed } from '@vue/runtime-core';
import { useMultiTabStateProvider } from './components/multi-tab';
import zhCN from 'ant-design-vue/es/locale/zh_CN';

// import { computed, provide, watch } from 'vue';
// import { useStore } from 'vuex';
// import { STORAGE_LANG_KEY } from '@/store/mutation-type';
// import { localStorage } from '@/utils/local-storage';
// import useMediaQuery from '@/utils/hooks/useMediaQuery';
// import { useI18n } from 'vue-i18n';
import useMenuState, { MenuStateSymbol } from './layouts/use-menu-state';
import { HomeApp } from './types/model';

export default {
  name: 'App',
  setup() {
    useMultiTabStateProvider();

    // const store = useStore();
    // const i18n = useI18n();
    // const colSize = useMediaQuery();
    // const isMobile = computed(() => colSize.value === 'sm' || colSize.value === 'xs');

    const MenuStated = useMenuState({
      openKeys: [] as string[],
      selectedKeys: [] as string[],
      subMenus: [] as HomeApp[],
      subMenuClosed: false,
    });

    document
      .getElementsByTagName('html')[0]
      .setAttribute('data-pro-theme', 'antdv-pro-theme-custom');

    provide(MenuStateSymbol, MenuStated);

    return {
      zhCN,
    };
  },
};
</script>
