<script lang="ts">
import { TaIndexViewConfigInterface } from '@/components/global/ta-component/TaIndexView/types';
import { VStore } from '@/lib/vails';
import { defineComponent, toRefs, PropType, computed, ComputedRef, ref, Ref, watch } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { merge } from 'lodash';
import { VObject } from '@/lib/vails/model';
import { TaIndexViewAction, TaIndexViewTabInterface } from './TaIndexView/ta-index-view-core/types';

const ComIdentityEditor = defineComponent({
  name: 'ComIdentityEditor',
  components: {},
  props: {
    identityStore: { type: Object as PropType<VStore>, required: true },
    identityName: { type: String, default: '身份' },
    identityTemplate: { type: Object as PropType<TaTemplateFormItem>, required: true },
    identityDisabled: { type: Boolean, default: false },
    store: { type: Object as PropType<VStore>, required: true },
    recordName: { type: String, default: '身份' },
    recordTemplate: { type: Object as PropType<TaTemplateFormItem>, required: true },
    recordForeignKey: { type: String, default: null },
    leftWidth: { type: String, default: '200px' },
    draggable: { type: Boolean, default: false },
    // 需要嵌套路由时，传入 parentType，会自动加入 record Store
    parentType: { type: String, default: null },
    searchVariables: { type: Array, default: () => ['name'] },
    extraConfig: {
      type: Object as PropType<TaIndexViewConfigInterface>,
      default: () => ({}),
    },
    tabs: { type: Array as PropType<TaIndexViewTabInterface[]>, default: () => [] },
    actions: {
      type: [Object, Array],
      default: () => ({
        create: true,
        update: true,
        delete: true,
      }),
    },
  },
  setup(props, { slots, emit }) {
    const leftTaIndexView = ref(null);
    const rightTaIndexView = ref(null);
    const searcherQuery = ref({});
    const selectedRecords = ref([]);
    const activeIdentity: Ref<Partial<VObject>> = ref({});

    const identityConfig: ComputedRef<TaIndexViewConfigInterface> = computed(() => ({
      recordName: props.identityName,
      store: props.identityStore,
      template: props.identityTemplate,
      pagination: { perPage: 999999 },
      mode: slots['left-custom'] ? 'custom' : 'list',
      scrollLoading: true,
      list: {
        scroll: { y: 'auto', x: 'auto' },
      },
      form: {
        width: '60vw',
      },
    }));

    const recordFormDataEncode = (payload: VObject) => {
      return merge({ [props.recordForeignKey]: activeIdentity.value.id }, payload);
    };

    const config: ComputedRef<TaIndexViewConfigInterface> = computed(() =>
      merge(
        {
          recordName: props.recordName,
          store: props.store,
          mode: 'table',
          template: props.recordTemplate,
          formDataEncode: recordFormDataEncode,
          selection: {
            showByDefault: true,
          },
          pagination: {
            // hideOnSinglePage: true,
          },
          detail: {
            mode: 'auto',
            width: '70vw',
          },
          table: {
            scroll: { y: 'auto' },
          },
          draggable: props.draggable,
          actions: props.actions as VObject | TaIndexViewAction[],
        },
        props.extraConfig,
      ),
    );

    const temporaryQuery = computed(() => ({
      [`${props.recordForeignKey}_eq`]: activeIdentity.value.id,
    }));

    const onSelectIdentity = (record: VObject) => {
      activeIdentity.value = record;
      emit('selectIdentity', record);
      if (props.parentType) {
        const api = props.store.api;
        api.parents = [{ type: props.parentType, id: record.id }];
      }
    };

    const onEditIdentity = () => {
      (leftTaIndexView.value as any).onEdit(activeIdentity.value);
    };

    const fetchIdentity = () => {
      (leftTaIndexView.value as any).fetchData(1, searcherQuery.value);
    };

    watch(
      () => searcherQuery,
      () => fetchIdentity(),
      { deep: true },
    );

    const onIdentityIndex = () => {
      emit('identityIndex');
      if (props.identityStore.records.value[0]) {
        onSelectIdentity(props.identityStore.records.value[0]);
      }
    };

    const onTabChange = (tab: TaIndexViewTabInterface) => emit('tabChange', tab);

    return {
      ...toRefs(props),
      selectedRecords,
      identityConfig,
      config,
      leftTaIndexView,
      rightTaIndexView,
      activeIdentity,
      onSelectIdentity,
      onEditIdentity,
      searcherQuery,
      onIdentityIndex,
      temporaryQuery,
      onTabChange,
    };
  },
});
export default ComIdentityEditor;
</script>

<template lang="pug">
.com-identity-editer.h-full
  TaIndexView.left.h-full(
    ref='leftTaIndexView',
    :config='identityConfig',
    @onIndex='onIdentityIndex'
  )
    template(#header='{ actions }')
      .left-header
        .search-group
          TaSearcher(v-model:value='searcherQuery', :variables='searchVariables', tips='检索')
        .actions
          slot(name='actions')
          TaRoundButton.add-button(v-if='!identityDisabled', :style='{ width: "100%" }', @click='actions.onCreate') 新增{{ identityName }}
    template(#card='{ record, actions }')
      .clickable(@click='onSelectIdentity(record)')
        slot(
          name='identity',
          :record='record',
          :isActive='activeIdentity?.id === record.id',
          :actions='actions'
        )
    template(#content)
      slot(name='left-custom')
  .right.h-full
    TaIndexView(
      v-model:selectedRecords='selectedRecords',
      ref='rightTaIndexView',
      :config='config',
      :tabs='tabs',
      :autoFetch='false',
      :temporaryQuery='temporaryQuery',
      @tabChange='onTabChange'
    )
      template(#header)
        slot(name='right-header', :record='activeIdentity')
      template(#right-actions)
        slot(name='right-right-actions', :identity='activeIdentity')
      template(#table='{ actions }')
        slot(:actions='actions')
      template(#custom='{ actions }')
        slot(name='custom', :actions='actions')
</template>

<style lang="stylus" scoped>
.com-identity-editer
  display flex
  width 100%
  flex 1
  .left
    width v-bind(leftWidth)
    margin-right 24px
    .clickable
      margin-bottom 1px
    .left-header
      margin-bottom 10px
      width v-bind(leftWidth)
      .actions
        display flex
        margin-top 18px
        .add-button
          background $primary-color
          color white
      .search-group
        max-width v-bind(leftWidth)
        overflow hidden
        display flex
        align-items center
        padding 5px 10px
        height 34px
        width 100%
        border-radius 4px
        border 1px solid #C3C6CE
        .icon
          padding-right 5px
  .right
    width calc(100% - v-bind(leftWidth))
    flex 1
    .right-header
      display flex
      align-items center
      margin-bottom 6px
    .header
      height 38px
      width 100%
      background #eceff4
      line-height 38px
      padding 0 15px
      margin 8px 0
</style>
