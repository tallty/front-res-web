<script lang="ts">
import { defineComponent, toRefs, watch, computed, ref } from 'vue';
import useNavigateTab from '@/components/global/ta-component/useNavigateTab';
import { useRoute } from 'vue-router';
import { VStore } from '@/lib/vails';
import { VObject } from '@/lib/vails/model';
import { TaIndexTreeItem } from '@/components/global/ta-component/TaIndexTree.vue';
import { ResOrg } from '@/res-core/types/model';
import ComResOrgsDetail from './ComResOrgsDetail.vue';
import { ResMemberOrgsApi } from '@/res-core/apis/res/member/orgs.api';
const ComResOrgsShow = defineComponent({
  name: 'ComResOrgsShow',
  components: {
    ComResOrgsDetail,
  },
  props: {
    store: { type: Object, required: true },
  },
  setup(props) {
    const { updateTitle } = useNavigateTab();
    const route = useRoute();

    const orgStore = new VStore(
      new ResMemberOrgsApi({
        params: {
          per_page: 999999,
          q: {
            root_org_id_eq: props.store.record.value.id,
            s: ['position asc'],
          },
        },
      }),
    );

    const expendOrgStore = new VStore(new ResMemberOrgsApi());

    watch(
      () => props.store.record.value.name,
      () => {
        if (props.store.record.value.name) {
          updateTitle(props.store.record.value.name, route.fullPath);
        }
      },
      { immediate: true },
    );

    const config = computed(() => ({
      recordName: props.store.record.value.name
        ? `${props.store.record.value.name} - 组织结构`
        : '组织结构',
      searcherSimpleOptions: [
        { key: 'name', label: '名称', type: 'string' },
        { key: 'short_name', label: '简称', type: 'string' },
        { key: 'code', label: '代码', type: 'string' },
      ],
    }));

    const activeItem = ref<VObject>({});

    const orgIds = computed(() => orgStore.records.value.map((org: ResOrg) => org.id));

    const treeItemGenerator = (record: ResOrg): TaIndexTreeItem => ({
      record,
      idKey: record.id,
      // parentKey === -1 挂载根节点，下方 customFlatData 塞入的 org 对象
      parentKey:
        record.parent_id && orgIds.value.includes(record.parent_id) ? record.parent_id! : -1,
      label: record.name,
      tag: record.org_identity_name,
      tag_color: '#60a5fa',
      count: record.children_count,
    });

    const treeFreshFlag = ref(false);

    const customFlatData = computed(() => [
      ...orgStore.records.value.map(treeItemGenerator),
      {
        idKey: -1,
        label: props.store.record.value.name,
        key: treeFreshFlag.value,
      },
    ]);

    const info = [
      {
        label: '代码',
        key: 'code',
        icon: 'BarcodeOutlined',
      },
      {
        label: '简称',
        key: 'short_name',
        icon: 'IdcardOutlined',
      },
    ];

    // const childrenLoader = (node: any) => {
    //   if (node.idKey === -1) {
    //     return Promise.resolve(orgStore.records.value.map(treeItemGenerator));
    //   }
    //   return expendOrgStore
    //     .index({ per_page: 999999, q: { children_of: node.record.id } })
    //     .then(() => expendOrgStore.records.value.map(treeItemGenerator));
    // };

    const heTreeOptions = computed(() => ({
      draggable: false,
      // childrenLazyLoading: true,
      // childrenLoader,
      // defaultFolded: true,
      // loading: expendOrgStore.loading.value,
      loading: orgStore.loading.value,
    }));

    return {
      ...toRefs(props),
      record: props.store.record,
      orgStore,
      config,
      activeItem,
      treeItemGenerator,
      info,
      customFlatData,
      // childrenLoader,
      expendOrgStore,
      heTreeOptions,
    };
  },
});
export default ComResOrgsShow;
</script>

<template lang="pug">
.com-res-user-orgs-show
  TaTreeSwitchLayout.ta-tree-switch-layout(
    v-model:activeItem='activeItem',
    :store='orgStore',
    :customFlatData='customFlatData',
    :config='config',
    :heTreeOptions='heTreeOptions'
  )
    template(#table)
      a-table-column(:autoHeight='true' title='名称', dataIndex='name')
      a-table-column(:autoHeight='true' title='代码', dataIndex='code')
      a-table-column(:autoHeight='true' title='简称', dataIndex='short_name')
      a-table-column(:autoHeight='true' title='路径', dataIndex='path_names')
        template(#default='{ value }')
          span {{ value.join(" > ") }}
    template(#tree-detail)
      .detail-main
        ComResOrgsDetail(
          v-if='activeItem.record',
          :record='activeItem.record',
          :tabs='info',
          :id='activeItem.record.id'
        )
</template>

<style lang="stylus" scoped>
.com-res-user-orgs-show
  height 100%
  min-height calc(100vh - 160px)
.detail-main
  height 100%
  overflow auto
</style>
