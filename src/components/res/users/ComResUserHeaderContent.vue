<script lang="ts">
import { VObject } from '@/lib/vails';
import { cloneDeep, uniqBy } from 'lodash';
import { defineComponent, toRefs, ref, onMounted } from 'vue';

const ComCrmTargetHeaderContent = defineComponent({
  name: 'ComCrmTargetHeaderContent',
  props: {
    record: { type: Object, required: true },
    membershipStore: { type: Object, required: true },
    org: { type: Object, required: false, default: () => ({}) },
  },
  setup(props) {
    const summary = ref({
      orgNames: '-',
      departmentNames: '-',
      dutyNames: '-',
    });

    const membershipStore = cloneDeep(props.membershipStore);

    const loadData = async() => {
      const { records } = await membershipStore.index({ q: { user_id_eq: props.record.id, org_id_eq: props.org?.id }, per_page: 999 });
      summary.value.orgNames = uniqBy(
        records.filter((record: VObject) => record.org_id),
        'org_id'
      ).map((record: VObject) => record.org.name).join('、');
  
      summary.value.departmentNames = uniqBy(
        records.filter((record: VObject) => record.department_id),
        'department_id'
      ).map((record: VObject) => record.department.name).join('、');

      summary.value.dutyNames = uniqBy(
        records.filter((record: VObject) => record.duty_id),
        'duty_id'
      ).map((record: VObject) => record.duty.name).join('、');
    };

    onMounted(() => {
      loadData();
    });

    return {
      ...toRefs(props),
      summary,
      loadData,
    }
  }
});

export default ComCrmTargetHeaderContent;
</script>

<template lang="pug">
.my-6.p-4.rounded-lg.flex.flex-row.items-start.basic-info.mr-6
  .text-center.fixed-width
    .text-gray-400.text-xs.font-normal.mb-2 姓名
    a-tooltip
      template(#title) {{ record.name }}
      .flex.justify-center.items-center
        TaAvatar.mr-1(:user="record", :size="24")
        .text-gray-800.text-sm.font-medium {{ record.name }}
  .text-center.fixed-width
    .text-gray-400.text-xs.font-normal.mb-2 账号
    a-tooltip
      template(#title) {{ record.account }}
      .text-gray-500.text-base.font-medium.truncate {{ record.account }}
  .text-center.px-3.fixed-width
    .text-gray-400.text-xs.font-normal.mb-2 组织
    a-tooltip
      template(#title) {{ summary.orgNames }}
      .text-gray-500.text-base.font-medium.truncate {{ summary.orgNames }}
  .text-center.px-3.fixed-width
    .text-gray-400.text-xs.font-normal.mb-2 部门
    a-tooltip
      template(#title) {{ summary.departmentNames }}
      .text-gray-500.text-base.font-medium.truncate {{ summary.departmentNames }}
  .text-center.px-3.fixed-width
    .text-gray-400.text-xs.font-normal.mb-2 岗位
    a-tooltip
      template(#title) {{ summary.dutyNames }}
      .text-gray-500.text-base.font-medium.truncate {{ summary.dutyNames }}
</template>

<style lang="stylus" scoped>
.basic-info
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5.5px);
  .fixed-width
    width 20%
</style>