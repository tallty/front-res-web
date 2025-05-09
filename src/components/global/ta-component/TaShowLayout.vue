<script lang="ts">
import { useMultiTab } from '@/components/multi-tab';
import { VStore } from '@/lib/vails';
import mitt from 'mitt';
import { PropType, computed, defineComponent, nextTick, onMounted, ref, toRefs, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { TaBreadcrumbInterface } from './TaBreadcrumb.vue';
import { TaIndexViewAction } from './TaIndexView/ta-index-view-core/types';
import useActions from './TaIndexView/ta-index-view-core/useActions';
import { TaTabTabsInterface } from './TaTab.vue';
import { TaTemplateFormItem } from './ta-template-form-core/types';
import useAutoTemplateForm from './ta-template-form-core/useAutoTemplateForm';
import useNavigateTab from './useNavigateTab';

export const TaShowLayoutEmitter = mitt();

export default defineComponent({
  name: 'TaShowLayout',
  components: {},
  props: {
    title: { type: String, default: '' },
    tabs: { type: Array as PropType<TaTabTabsInterface[]>, default: () => [] },
    breadcrumbs: { type: Array as PropType<TaBreadcrumbInterface[]>, default: () => [] },
    store: { type: Object as PropType<VStore>, required: true },
    template: {
      type: [Object, String] as PropType<TaTemplateFormItem | string>,
      required: true,
    },
    extendRoute: { type: String, default: '' },
    editable: { type: Boolean, default: true },
    showInfo: { type: Boolean, default: true },
    actions: { type: Array as PropType<TaIndexViewAction[]>, default: () => [] },
    shouldChangeTitle: { type: Boolean, default: true },
  },
  emits: ['afterDelete', 'afterExtend', 'afterSave'],
  setup(props, { emit }) {
    const activeTabKey = ref('');
    const activeTab = computed(
      () => props.tabs.find((tab: TaTabTabsInterface) => tab.key === activeTabKey.value) || {},
    );
    const visibleForm = ref(false);

    const { close: closeTab } = useMultiTab()[0];
    const route = useRoute();
    const router = useRouter();

    if (!props.extendRoute && props.shouldChangeTitle) {
      route.meta.keepTab = true;
    }

    const { updateTitle } = useNavigateTab();

    const layout = ref<any>(null);
    onMounted(() => {
      fetchTemplate();

      nextTick(() => {
        if (
          !props.extendRoute &&
          props.shouldChangeTitle &&
          document.getElementsByClassName('route-view__shell')[0]
        ) {
          (document.getElementsByClassName('route-view__shell')[0] as any).style.padding = '0';
        }
      });
    });

    watch(
      () => props.title,
      (newTitle, oldTitle) => {
        if (newTitle !== oldTitle && !props.extendRoute && props.shouldChangeTitle) {
          updateTitle(newTitle, route.fullPath);
        }
      },
      { immediate: true },
    );

    const onEdit = () => {
      visibleForm.value = true;
    };

    const onDelete = () => {
      props.store.record.value.delete();
      emit('afterDelete');
      if (!props.extendRoute) {
        closeTab(route.path);
      }
    };

    const slotActions = computed(() => ({
      onEdit,
      onDelete,
      update: onEdit,
      delete: onDelete,
    }));

    const { localTemplate, fetchTemplate } = useAutoTemplateForm(props);
    const localActions = computed(() => props.actions);
    const { activeActionsMemberActions } = useActions(localActions, slotActions, localTemplate);

    const onExtend = () => {
      if (typeof props.extendRoute === 'string') {
        router.push(props.extendRoute);
        emit('afterExtend');
      }
    };

    const onTabChange = (key: string) => {
      if (activeTabKey.value !== key && !props.extendRoute && props.shouldChangeTitle) {
        activeTabKey.value = key;
        router.replace({ query: { ...route.query, tab: key } });
      }
    };

    const extendRouteIsString = computed(
      () => typeof props.extendRoute === 'string' && props.extendRoute,
    );
    const afterSave = () => {
      emit('afterSave', props.store.record.value);
    };
    console.log('activeTabKey', activeTabKey.value);
    return {
      ...toRefs(props),
      activeTabKey,
      activeTab,
      record: props.store.record,
      visibleForm,
      onEdit,
      onDelete,
      onExtend,
      onTabChange,
      layout,
      localTemplate,
      activeActionsMemberActions,
      extendRouteIsString,
      afterSave,
    };
  },
});
</script>

<template lang="pug">
.ta-show-layout.h-full(ref='layout')
  .header
    ComHeaderEdit(:title='title', :breadcrumbs='breadcrumbs')
      template(#title)
        slot(name='title')
      template(#right)
        slot(name='right', :activeTab='activeTab', :actions='{ onEdit, onDelete }')
          slot(name='more-actions', :activeTab='activeTab')
          template(v-if='activeTabKey === "info" && showInfo')
            template(v-if='localTemplate.actions')
              TaIndexTableActionColumn.columns(
                :memberActions='activeActionsMemberActions',
                :store='store',
                :record='record',
                :showLabel='true'
              )
            template(v-else)
              //- 老版本，没有配置 actions
              ComIconText(v-if='editable', icon='EditOutlined', text='编辑', @click='onEdit')
              TaPopoverConfirm(
                v-if='editable',
                title='删除',
                content='您确认删除该数据吗？',
                @confirm='onDelete'
              )
                ComIconText(icon='DeleteOutlined', text='删除')
          template(v-if='extendRouteIsString')
            ComIconText(icon='FullscreenOutlined', text='独立窗口', @click='onExtend')
    slot(name='header-content')
    TaTab.ta-tab(v-model:value='activeTabKey', :tabs='tabs', @update:value='onTabChange')
  .background(:class='{ "background-white": extendRoute || !shouldChangeTitle }')
    .content(v-if='record.id')
      slot(v-if='activeTabKey !== "info"', :name='`${activeTabKey}_tab`', :activeTab='activeTab')
      slot(:name='`info_tab`', v-if='activeTabKey === "info" && showInfo')
        TaTemplateFormViewer.viewer(:template='localTemplate', :record='record')

  TaTemplateFormWithActionsDrawer(
    v-model:visible='visibleForm',
    :template='localTemplate',
    :record='record',
    @afterSave='afterSave'
  )
</template>

<style lang="stylus" scoped>
.ta-show-layout
  // height 100%
  // min-height 100vh
  width 100%
  display flex
  flex-direction column
  .columns
    margin-right 24px
  .header
    padding 0px 0 0 24px
  .background
    flex-grow 1
    padding 20px 24px
    width 100%
    min-height 0
    height 0
    display flex
    flex-direction column
    background #EFF3FD
    .content
      overflow auto
      background #fff
      min-height 0
      height 0
      flex-grow 1
      width 100%
      padding 10px 20px
      display flex
      flex-direction column
      .viewer
        padding 43px 26px
  .background-white
    background #fff
    padding 0
.ta-tab
  >>> .cursor
    bottom 0 !important
</style>
