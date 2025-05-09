<script lang="ts">
import { defineComponent, computed, toRefs, ref, watch } from 'vue';
import { VObject } from '@/lib/vails';
import { groupBy, map, cloneDeep } from 'lodash';
import ComResMembershipIndex from '../memberships/ComResMembershipIndex.vue';

const ComResDepartmentIndex = defineComponent({
  name: 'ComResDepartmentIndex',
  components: {
    ComResMembershipIndex,
  },
  props: {
    store: { type: Object, required: true },
    membershipStore: { type: Object, required: true },
    orgRecord: { type: Object, required: false, default: () => {} },
    query: { type: Object, required: false, default: () => {} },
  },
  setup(props, { emit }) {
    const formData = computed(() => {
      return {
        org_id: props.orgRecord?.id,
        parent_id: props.query?.departmentId ? Number(props.query?.departmentId) : null,
      };
    });

    const config = computed(() => ({
      recordName: '',
      store: props.store,
      template: 'department',
      formDataEncode: (payload: VObject) => {
        return { ...formData.value, ...payload };
      },
      mode: 'table',
      actions: [
        { key: 'create', enabled: true },
        { key: 'update', enabled: true },
        { key: 'delete', enabled: true },
        { key: 'import', enabled: false },
        { key: 'export', enabled: false },
      ],
      table: {
        scroll: { y: 'auto' },
        columns: [
          { dataIndex: 'name', title: '部门名称' },
          { dataIndex: 'userCount', title: '部门人数' },
          { dataIndex: 'userNames', title: '部门人员' },
        ],
      },
      searcherSimpleOptions: [{ key: 'name', label: '名称', type: 'string' }],
    }));

    const aggregation = ref<VObject[]>([]);

    const showAggregation = computed(() => {
      return (
        props.query.identityId || props.query.dutyId || props.query.dutyGroupId || props.query.tagId
      );
    });

    const loading = ref(false);

    const membershipStore = cloneDeep(props.membershipStore);
    const originalParams = membershipStore.api.params;

    const aggregationQuery = () => {
      const q: any = {
        org_id_eq: props.query.orgId,
        department_id_null: 0,
        member_member_identity_id_eq: props.query.identityId,
        duty_id_eq: props.query.dutyId,
        duty_duty_group_id_eq: props.query.dutyGroupId,
      };

      if (props.query.tagId) {
        q.user_res_tags_relations_tag_id_eq = props.query.tagId;
        q.user_res_tags_relations_org_id_eq = props.orgRecord?.id;
      }

      loading.value = true;
      membershipStore.index({ q, per_page: 999999 }).then((res: any) => {
        const _duties = groupBy(
          res.records.filter((record: any) => record.duty_id),
          'department_id',
        );

        aggregation.value = map(_duties, (records, key) => ({
          memberIdentity: {
            id: records[0].member?.member_identity_id,
            name: records[0].member?.member_identity_name,
          },
          tag: { id: props.query.tagId, name: props.query.node?.title },
          department: { id: records[0].department_id, name: records[0].department?.name },
          duty: { id: records[0].duty_id, name: records[0].duty.name },
          usersName: records.map(record => record.user?.name).join('、'),
          usersCount: records.length,
        }));
        loading.value = false;
      });
    };

    watch(
      () => props.query,
      () => aggregationQuery(),
    );

    const visible = ref(false);
    const recordName = ref('');
    const memberFormData = ref({});

    const onRowClick = (record: VObject) => {
      let departmentId = 0;
      if (record.department) {
        recordName.value = record.department.name;
        departmentId = record.department.id;
        memberFormData.value = {
          org_id: props.orgRecord?.id,
          department_id: record.department.id,
          duty_id: props.query?.dutyId ? record.duty?.id : null,
        };
      } else {
        recordName.value = record.name;
        departmentId = record.id;
        memberFormData.value = {
          org_id: props.orgRecord?.id,
          department_id: record.id,
        };
      }

      const q: any = {
        duty_id_eq: props.query?.dutyId,
        department_id_eq: departmentId,
        member_member_identity_id_eq: props.query?.identityId,
      };

      if (props.query.tagId) {
        q.user_res_tags_relations_tag_id_eq = props.query.tagId;
        q.user_res_tags_relations_org_id_eq = props.orgRecord?.id;
      }

      membershipStore.api.params = {
        ...originalParams,
        q,
        per_page: 15,
      };
      visible.value = true;
    };

    return {
      ...toRefs(props),
      config,
      aggregation,
      showAggregation,
      loading,
      onRowClick,
      membershipStore,
      recordName,
      memberFormData,
      visible,
    };
  },
});

export default ComResDepartmentIndex;
</script>

<template lang="pug">
.com-res-department-index.px-4
  TaIndexTable.mt-12(
    :data='aggregation',
    :paginationConfig='{ hide: true }',
    @rowClick='onRowClick',
    :loading='loading'
    v-if='showAggregation',
  )
    a-table-column(:autoHeight='true' title='岗位名称' v-if='query.dutyId || query.dutyGroupId')
      template(#default='{ record }')
        | {{ record.duty.name }}
    a-table-column(:autoHeight='true' title='身份名称' v-if='query.identityId')
      template(#default='{ record }')
        | {{ record.memberIdentity.name }}
    a-table-column(:autoHeight='true' title='标签名称' v-if='query.tagId')
      template(#default='{ record }')
        | {{ record.tag.name }}
    a-table-column(:autoHeight='true' title='部门名称')
      template(#default='{ record }')
        | {{ record.department.name }}
    a-table-column(:autoHeight='true' title='部门人数' dataIndex='usersCount')
    a-table-column(:autoHeight='true' title='岗位人员')
      template(#default='{ record }')
        | {{ record.usersName }}
  TaIndexView(:config='config', @onShow='onRowClick', v-bind='$attrs' v-else)

  a-drawer(
    v-model:visible='visible',
    :closeable='false',
    title='部门详情',
    width='60%'
  )
    ComResMembershipIndex(
      :store='membershipStore',
      :recordName='recordName',
      :initFormData='memberFormData',
      v-if='visible'
    )
</template>

<style lang="stylus" scoped>
.com-res-department-index
  height 100%
  width 100%
</style>
