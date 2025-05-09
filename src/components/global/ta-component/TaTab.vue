<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  PropType,
  Ref,
  ref,
  toRefs,
  watch,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { VObject } from '@/lib/vails/model';
import { isEqual } from 'lodash';
import { TaIndexViewTagInterface } from './TaIndexView/types';

export interface TaTabTabsInterface {
  key: string;
  label: string;
  num?: number;
  route?: string; // route name
  query?: VObject;
}

const TaTab = defineComponent({
  name: 'TaTab',
  props: {
    value: { type: String, default: '' },
    tabs: { type: Array as PropType<TaTabTabsInterface[]>, default: () => [] },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const cursorLeft = ref(0);
    const cursorWidth = ref(0);
    const paneRefs = ref<any>({});

    const activeTab = computed(() => props.tabs.find(tab => tab.key === props.value));

    const cursorStyle = computed(() => ({
      width: `${cursorWidth.value}px`,
      transform: `translate3d(${cursorLeft.value}px, 0px, 0px)`,
    }));

    watch(
      () => props.value,
      () => initActiveCursor(),
    );

    watch(
      () => props.tabs,
      (newValue: TaIndexViewTagInterface[], oldValue: TaIndexViewTagInterface[]) => {
        if (!isEqual(newValue, oldValue)) {
          matchTab();
          initActiveCursor();
        }
      },
    );

    onMounted(() => {
      matchTab();
      initActiveCursor();
    });

    const route = useRoute();

    const matchTab = () => {
      if (props.tabs && props.tabs[0]) {
        // 匹配路由
        const matchedTab = props.tabs.find(tab => tab.route === route.name);
        if (matchedTab) {
          emit('update:value', matchedTab.key);
        } else if (props.tabs.find(tab => tab.key === route.query.tab)) {
          emit('update:value', route.query.tab);
        } else if (props.value == undefined && props.tabs[0] && props.tabs[0].key !== props.value) {
          // 没有选中 tab ，且有传入 tabs 时，默认切换到第一个 tab
          emit('update:value', props.tabs[0].key);
        } else if (!props.tabs.find(tab => tab.key === props.value)) {
          // tabs 更改，导致 active key 没有匹配到 tab
          emit('update:value', props.tabs[0].key);
        }
      }
    };

    const initActiveCursor = () => {
      nextTick(() => {
        if (activeTab.value?.key !== undefined) {
          const pane = paneRefs.value[activeTab.value!.key] as HTMLElement;

          if (pane) {
            cursorLeft.value = pane.offsetLeft;
            cursorWidth.value = pane.clientWidth;
          }
        }
      });
    };

    const router = useRouter();

    const onTabChange = (key: string) => {
      const targetTab = props.tabs.find(tab => tab.key === key);

      // const pane = paneRefs.value[key] as HTMLElement;
      // console.log(pane, 'onTabChange pane');

      if (targetTab?.route) {
        router.replace({ name: targetTab.route, query: targetTab.query });
      } else {
        // 路由改变会自动切换
        emit('update:value', key);
      }
    };

    const isActivePane = (tab: TaTabTabsInterface) => {
      return props.value === tab.key;
    };

    return {
      ...toRefs(props),
      isActivePane,
      onTabChange,
      cursorStyle,
      paneRefs,
      activeTab,
    };
  },
});

export default TaTab;
</script>

<template lang="pug">
.ta-tab
  .tabs
    .pane(
      v-for='tab in tabs',
      :key='tab.key',
      :ref='el => paneRefs[tab.key] = el',
      @click='onTabChange(tab.key)'
    )
      slot(name='tab', :tab='tab', :isActive='isActivePane(tab)')
        .tab.flex-between(:class='{ "tab-active": isActivePane(tab) }')
          .tab-label {{ tab.label }}
    .cursor(:style='cursorStyle')
</template>

<style lang="stylus" scoped>
.ta-tab
  width 100%
  .tabs
    position relative
    display flex
    overflow-x auto
    .pane
      flex-shrink 0
      margin 0 15px
      cursor pointer
      &:first-child
        margin 0 15px 0 0
    .tab-active
      .tab-label
        color black
    .tab
      height 48px
      color #808080
      font-size 14px
      line-height 48px
  .cursor
    position absolute
    bottom 8px
    width 100%
    height 4px
    background $primary-color
    transition all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)
</style>
