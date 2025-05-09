<script lang="ts">
import { ResAdminDutiesApi } from '@/res-core/apis/res/admin/duties.api';
import { ResAdminDutyGroupsApi } from '@/res-core/apis/res/admin/duty_groups.api';
import { ResAdminMembershipsApi } from '@/res-core/apis/res/admin/memberships.api';
import { ResDutyModel } from '@/res-core/models/res/duty';
import { ResDutyGroupModel } from '@/res-core/models/res/duty_group';
import { ResMembershipModel } from '@/res-core/models/res/membership';
import { VObject, VStore } from '@/lib/vails';
import { computed, defineComponent, toRefs, ref } from 'vue';
import ComResDutyGroupTree from '../../duty_groups/ComResDutyGroupTree.vue';

const ComResAdminDutyIndex = defineComponent({
  name: 'ComResAdminDutyIndex',
  components: {
    ComResDutyGroupTree,
  },
  props: {},
  setup(props) {
    const treeNode = ref<VObject>({
      type: 'default',
      title: '',
      recordId: null,
    });

    const dutyTreeStore = new VStore(
      new ResAdminDutiesApi({
        params: {
          q: { org_id_null: 1 },
        },
      }),
      ResDutyModel,
    );

    const groupTreeStore = new VStore(
      new ResAdminDutyGroupsApi({
        params: {
          q: { org_id_null: 1 },
        },
      }),
      ResDutyGroupModel,
    );

    const membershipStore = computed(() => {
      const q = treeNode.value.type == 'duty' ? { duty_id_eq: treeNode.value.recordId } : {};
      return new VStore(
        new ResAdminMembershipsApi({
          params: { q },
        }),
        ResMembershipModel,
      );
    });

    const dutyStore = computed(() => {
      const q =
        treeNode.value.type == 'duty_group'
          ? { duty_group_id_eq: treeNode.value.recordId }
          : { org_id_null: 1 };
      return new VStore(
        new ResAdminDutiesApi({
          params: { q },
        }),
        ResDutyModel,
      );
    });

    const currentStore = computed(() => {
      if (treeNode.value.type == 'duty') {
        return membershipStore.value;
      }
      return dutyStore.value;
    });

    const recordName = computed(() => {
      if (['duty_group', 'duty'].includes(treeNode.value.type)) {
        return treeNode.value.title;
      }
      return '岗位管理';
    });

    const tableColumns = computed(() => {
      if (treeNode.value.type == 'duty') {
        return [
          { dataIndex: 'user.name', title: '姓名' },
          { dataIndex: 'user.account', title: '账号' },
          { dataIndex: 'member.member_identity_name', title: '身份' },
          { dataIndex: 'duty.name', title: '岗位' },
          { dataIndex: 'department.name', title: '部门' },
          { dataIndex: 'org.name', title: '组织' },
        ];
      }
      return [
        { dataIndex: 'name', title: '岗位' },
        { dataIndex: 'duty_group_name', title: '所属分组' },
        { dataIndex: 'userCount', title: '人数' },
        { dataIndex: 'used_by_orgs_count', title: '关联组织' },
      ];
    });

    const config = computed(() => ({
      recordName: treeNode.value.type == 'duty' ? '人员' : '岗位',
      store: currentStore.value,
      template: 'duty#default',
      actions: [
        { key: 'create', callback: onCreate, enabled: true },
        { key: 'update', callback: onUpdate, enabled: true },
        { key: 'delete', callback: onDelete, enabled: true },
        { key: 'import', enabled: false },
        { key: 'export', enabled: false },
      ],
      mode: 'table',
      table: {
        scroll: { y: 'auto' },
        columns: tableColumns.value,
      },
      searcherSimpleOptions: [{ key: 'name', label: '名称', type: 'string' }],
    }));

    const onDutySelect = (data: VObject) => {
      treeNode.value.type = data?.type;
      treeNode.value.title = data?.node?.title;
      treeNode.value.recordId = data?.dutyId || data?.dutyGroupId;
    };

    const treeKeyword = ref('');

    const taIndexView = ref<any>(null);
    const afterSave = () => {
      taIndexView.value.fetchData();
    };

    const formVisible = ref(false);
    const editRecord = ref<any>({});
    const formTemplate = ref('duty#default');
    const onCreate = () => {
      if (treeNode.value.type == 'duty') {
        editRecord.value = (currentStore.value as any).new({
          duty_id: Number(treeNode.value.recordId),
        });
        formTemplate.value = 'membership#admin_duty_batch';
      } else {
        const store = new VStore(new ResAdminDutiesApi(), ResDutyModel);
        editRecord.value = store.new({
          duty_group_id: treeNode.value.recordId ? Number(treeNode.value.recordId) : undefined,
        });
        formTemplate.value = 'duty#default';
      }
      formVisible.value = true;
    };

    const onUpdate = async (record: VObject) => {
      await record.fetch();
      editRecord.value = record;
      if (treeNode.value.type == 'duty') {
        formTemplate.value = 'membership#admin_duty';
      } else {
        formTemplate.value = 'duty#default';
      }
      formVisible.value = true;
    };

    const onDelete = (record: VObject) => {
      taIndexView.value?.onDelete(record);
    };

    return {
      ...toRefs(props),
      recordName,
      config,
      onDutySelect,
      dutyTreeStore,
      groupTreeStore,
      treeKeyword,
      onCreate,
      onUpdate,
      onDelete,
      formVisible,
      editRecord,
      formTemplate,
      taIndexView,
      afterSave,
    };
  },
});

export default ComResAdminDutyIndex;
</script>

<template lang="pug">
.com-res-admin-duty-index.flex.space-between.h-full
  .left-side.p-4.h-full
    .mb-4
      a-input(v-model:value='treeKeyword' placeholder='搜索岗位')
        template(#prefix)
          TaIcon.w-4.h-4.text-gray-300(type='solid/search')
    ComResDutyGroupTree(
      :keyword='treeKeyword',
      :dutyGroupStore='groupTreeStore',
      :dutyStore='dutyTreeStore',
      @selected='onDutySelect'
    )
  .right-side.h-full.flex.flex-col.border-l.border-solid.border-gray-200.pl-4
    .text-2xl.font-semibold.text-gray-900.mr-2.px-4.pt-4 {{ recordName }}
    TaIndexView.flex-auto(
      ref='taIndexView',
      :config='config',
    )
  TaTemplateFormWithActionsDrawer(
    v-model:visible='formVisible',
    :template='formTemplate',
    :record='editRecord',
    @afterSave='afterSave()',
  )
</template>

<style lang="stylus" scoped>
.com-res-admin-duty-index
  .left-side
    width 300px
  .right-side
    width calc(100% - 300px)
    >>>.table-header__title
      display none
</style>
