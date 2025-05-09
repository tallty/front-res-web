<script lang="ts">
import { defineComponent, toRefs, watch, computed, ref } from 'vue';
import useNavigateTab from '@/components/global/ta-component/useNavigateTab';
import { useRoute } from 'vue-router';
import { VStore } from '@/lib/vails';
import { ResMemberDepartmentsApi } from '@/res-core/apis/res/member/departments.api';
import { VObject } from '@/lib/vails/model';
import { TaIndexTreeItem } from '@/components/global/ta-component/TaIndexTree.vue';
import { ResDepartment } from '@/res-core/types/model';
import ComResDepartmentsDetail from './ComResDepartmentsDetail.vue';

const ComResDepartmentsShow = defineComponent({
  name: 'ComResDepartmentsShow',
  components: {
    ComResDepartmentsDetail,
  },
  props: {
    store: { type: Object, required: true },
  },
  setup(props) {
    const { updateTitle } = useNavigateTab();
    const route = useRoute();

    const departmentStore = new VStore(
      new ResMemberDepartmentsApi({
        params: {
          per_page: 999999,
          q: { root_org_id_eq: props.store.record.value.id, s: ['position asc'] },
        },
      }),
    );

    const expendDepartmentStore = new VStore(new ResMemberDepartmentsApi());

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

    const departmentIds = computed(() =>
      departmentStore.records.value.map((department: ResDepartment) => department.id),
    );

    const treeItemGenerator = (record: ResDepartment): TaIndexTreeItem => ({
      record,
      idKey: record.id,
      // parentKey === -1 挂载根节点，下方 customFlatData 塞入的 org 对象
      parentKey:
        record.parent_id && departmentIds.value.includes(record.parent_id) ? record.parent_id! : -1,
      label: record.name,
      tag: record.department_identity_name,
      tag_color: record.department_identity_color,
      count: record.children_count,
    });

    const treeFreshFlag = ref(false);

    const customFlatData = computed(() => [
      ...departmentStore.records.value.map(treeItemGenerator),
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
    //     return Promise.resolve(departmentStore.records.value.map(treeItemGenerator));
    //   }
    //   return expendDepartmentStore
    //     .index({ per_page: 999999, q: { children_of: node.record.id } })
    //     .then(() => expendDepartmentStore.records.value.map(treeItemGenerator));
    // };

    const heTreeOptions = computed(() => ({
      draggable: false,
      // childrenLazyLoading: true,
      // childrenLoader,
      // defaultFolded: true,
      // loading: expendDepartmentStore.loading.value,
      loading: departmentStore.loading.value,
    }));

    return {
      ...toRefs(props),
      record: props.store.record,
      departmentStore,
      config,
      activeItem,
      treeItemGenerator,
      info,
      customFlatData,
      // childrenLoader,
      expendDepartmentStore,
      heTreeOptions,
    };
  },
});
export default ComResDepartmentsShow;
</script>

<template lang="pug">
.com-res-user-departments-show
  TaTreeSwitchLayout.ta-tree-switch-layout(
    v-model:activeItem='activeItem',
    :store='departmentStore',
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
      .tree-detail
        ComResDepartmentsDetail(
          v-if='activeItem.record',
          :record='activeItem.record',
          :tabs='info',
          :id='activeItem.record.id'
        )
</template>

<style lang="stylus" scoped>
.com-res-user-departments-show
  height 100%
  min-height calc(100vh - 50px)
  .tree-detail
    height 100%
    >>>.detail-main
      overflow-y scroll
      width 100%
</style>
