<script lang="ts">
import { VObject } from '@/lib/vails';
import { cloneDeep, groupBy, map, uniqBy } from 'lodash';
import { defineComponent, onMounted, ref } from 'vue';
import ComResMembershipIndex from '../memberships/ComResMembershipIndex.vue';

const ComResUserOrgDuties = defineComponent({
  name: 'ComResUserOrgDuties',
  components: {
    ComResMembershipIndex,
  },
  props: {
    store: { type: Object, required: true },
    user: { type: Object, required: true },
    org: { type: Object, required: false, default: () => ({}) },
    onlyShow: { type: Boolean, default: () => false },
  },
  setup(props, { emit }) {
    const loading = ref(false);
    const summary = ref<VObject>({
      orgs: [],
      duties: [],
    });
    const membershipStatus = (records: Array<VObject>) => {
      const currentTimeStamp = Date.now();
      const isCurrentTimeValid = records.some(interval => {
        // 如果 effective_at 和 invalid_at 都为 null，视为有效
        if (interval.effective_at === null && interval.invalid_at === null) {
          return true;
        }
        const effectiveTime = interval.effective_at
          ? new Date(interval.effective_at).getTime()
          : Number.NEGATIVE_INFINITY;
        const invalidTime = interval.invalid_at
          ? new Date(interval.invalid_at).getTime()
          : Number.POSITIVE_INFINITY;
        return currentTimeStamp >= effectiveTime && currentTimeStamp <= invalidTime;
      });
      return isCurrentTimeValid ? '正常' : '失效';
    };

    const loadData = async () => {
      loading.value = true;
      const { records } = await props.store.index({
        q: { user_id_eq: props.user.id },
        per_page: 99999,
      });

      const groupedDuties = groupBy(
        records.filter((record: any) => record.duty_id),
        record => `${record.duty_id}-${record.duty.name}`,
      );

      summary.value.duties = map(groupedDuties, (records, key) => {
        const orgNames = uniqBy(records, 'org_id')
          .map(record => record.org?.name)
          .join('、');
        const departmentNames = uniqBy(records, 'department_id')
          .filter((record: any) => record.department_id)
          .map(record => record.department?.name)
          .join('、');
        const [recordId, recordName] = key.split('-');
        const memberNames = uniqBy(records, 'member_id')
          .filter((record: any) => record.member_id)
          .map(record => record.member?.member_identity_name)
          .join('、');

        return {
          orgNames,
          departmentNames,
          memberNames,
          id: Number(recordId),
          name: recordName,
          membershipStatus: membershipStatus(records),
        };
      });

      const groupedOrgs = groupBy(records, record => `${record.org_id}-${record.org.name}`);

      summary.value.orgs = map(groupedOrgs, (records, key) => {
        const dutyNames = uniqBy(records, 'duty_id')
          .filter((record: any) => record.duty_id)
          .map(record => record.duty.name)
          .join('、');
        const departmentNames = uniqBy(records, 'department_id')
          .filter((record: any) => record.department_id)
          .map(record => record.department?.name)
          .join('、');
        const memberNames = uniqBy(records, 'member_id')
          .filter((record: any) => record.member_id)
          .map(record => record.member?.member_identity_name)
          .join('、');

        const [recordId, recordName] = key.split('-');

        return {
          id: Number(recordId),
          name: recordName,
          dutyNames,
          departmentNames,
          memberNames,
          membershipStatus: membershipStatus(records),
        };
      });

      loading.value = false;
    };

    onMounted(() => {
      loadData();
    });

    const store = cloneDeep(props.store);

    const visible = ref({
      formDrawer: false,
      indexDrawer: false,
    });

    const recordName = ref('');
    const initFormData = ref({});

    const onDutyRowClick = (record: VObject) => {
      if (!props.onlyShow) {
        recordName.value = record.name;
        store.api.params = {
          q: {
            user_id_eq: props.user.id,
            duty_id_eq: record.id,
          },
        };
        initFormData.value = {
          org_id: props.org?.id,
          duty_id: Number(record.id),
          user_id: props.user.id,
        };
        visible.value.indexDrawer = true;
      }
    };

    const onOrgRowClick = (record: VObject) => {
      if (!props.onlyShow) {
        recordName.value = record.name;
        store.api.params = {
          q: {
            user_id_eq: props.user.id,
            org_id_eq: record.id,
          },
        };
        initFormData.value = {
          org_id: Number(record.id),
          user_id: props.user.id,
        };
        visible.value.indexDrawer = true;
      }
    };

    const record = ref({});
    const onAddMembership = () => {
      record.value = store.new({
        user_id: props.user.id,
        org_id: props.org?.id,
      });
      visible.value.formDrawer = true;
    };

    const afterSave = () => {
      loadData();
      emit('afterSave');
    };

    return {
      summary,
      loading,
      loadData,
      store,
      visible,
      recordName,
      record,
      initFormData,
      onDutyRowClick,
      onOrgRowClick,
      onAddMembership,
      afterSave,
    };
  },
});

export default ComResUserOrgDuties;
</script>

<template lang="pug">
.flex.justify-between.items-center.mb-4.mt-10
  .flex.item-center
    .flex.lines.mr-1.items-center
      .line.bg-blue-200
      .line.h-4.bg-blue-700
      .line.bg-yellow-200
    .text-base.font-medium.text-gray-800 岗位信息
  a-button.save-button(v-if='!onlyShow', type='text', @click='onAddMembership()')
    .flex.items-center.text-blue-700
      TaIcon.w-4.h-4.mr-3(type='solid/plus')
      .text-xs.font-medium 添加

TaIndexTable.mt-6(
  :data='summary.duties',
  :paginationConfig='{ hide: true }',
  :loading='loading',
  @rowClick='onDutyRowClick'
)
  a-table-column(:autoHeight='true' title='岗位', dataIndex='name')
  a-table-column(:autoHeight='true' title='组织', dataIndex='orgNames')
  a-table-column(:autoHeight='true' title='部门', dataIndex='departmentNames')
  a-table-column(:autoHeight='true' title='身份', dataIndex='memberNames')
  a-table-column(:autoHeight='true' title='状态', dataIndex='membershipStatus')
.flex.justify-between.items-center.mb-4.mt-10
  .flex.item-center
    .flex.lines.mr-1.items-center
      .line.bg-blue-200
      .line.h-4.bg-blue-700
      .line.bg-yellow-200
    .text-base.font-medium.text-gray-800 组织信息
  a-button.save-button(v-if='!onlyShow', type='text', @click='onAddMembership()')
    .flex.items-center.text-blue-700
      TaIcon.w-4.h-4.mr-3(type='solid/plus')
      .text-xs.font-medium 添加

TaIndexTable.mt-6(
  :data='summary.orgs',
  :paginationConfig='{ hide: true }',
  :loading='loading',
  @rowClick='onOrgRowClick'
)
  a-table-column(:autoHeight='true' title='组织', dataIndex='name')
  a-table-column(:autoHeight='true' title='部门', dataIndex='departmentNames')
  a-table-column(:autoHeight='true' title='岗位', dataIndex='dutyNames')
  a-table-column(:autoHeight='true' title='身份', dataIndex='memberNames')
  a-table-column(:autoHeight='true' title='状态', dataIndex='membershipStatus')

a-drawer(
  v-model:visible='visible.indexDrawer',
  :closeable='false',
  title='详情',
  width='60%',
  @close='afterSave()'
)
  ComResMembershipIndex(
    :store='store',
    :recordName='recordName',
    :initFormData='initFormData',
    @afterSave='afterSave()',
    v-if='visible.indexDrawer'
  )

TaTemplateFormWithActionsDrawer(
  v-model:visible='visible.formDrawer',
  template='membership',
  :record='record',
  @afterSave='afterSave()'
)
</template>

<style lang="stylus" scoped>
.lines
  .bg-blue-200
    height 10px
    margin-top 4px
  .bg-yellow-200
    height 10px
    margin-top 2px
  .line
    width 2px
    margin-right 2px
</style>
