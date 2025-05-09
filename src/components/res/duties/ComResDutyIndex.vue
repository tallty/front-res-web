<script lang="ts">
import { defineComponent, computed, toRefs, ref, watch } from 'vue';
import { VObject } from '@/lib/vails';
import { groupBy, map, cloneDeep } from 'lodash';
import ComResMembershipIndex from '../memberships/ComResMembershipIndex.vue';

const ComResDutyIndex = defineComponent({
  name: 'ComResDutyIndex',
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
      const type = props.query?.type;
      if (!type || type.includes('default')) {
        return { org_id: props.orgRecord?.id };
      }
      return {
        org_id: props.orgRecord?.id,
        duty_group_id: props.query?.dutyGroupId ? Number(props.query?.dutyGroupId) : null,
      };
    });

    const config = computed(() => ({
      recordName: '岗位',
      store: props.store,
      template: 'duty',
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
          { dataIndex: 'name', title: '岗位名称' },
          { dataIndex: 'userCount', title: '岗位人数' },
          { dataIndex: 'userNames', title: '岗位人员' },
        ],
      },
      searcherSimpleOptions: [{ key: 'name', label: '名称', type: 'string' }],
    }));

    const aggregation = ref<VObject[]>([]);

    const showAggregation = computed(() => {
      return props.query.identityId || props.query.departmentId || props.query.tagId;
    });

    const loading = ref(false);

    const membershipStore = cloneDeep(props.membershipStore);
    const originalParams = membershipStore.api.params;

    const aggregationQuery = () => {
      const q: any = {
        duty_id_null: 0,
        org_id_eq: props.query.orgId,
        member_member_identity_id_eq: props.query.identityId,
        department_id_eq: props.query.departmentId,
      };

      if (props.query.tagId) {
        q.user_res_tags_relations_tag_id_eq = props.query.tagId;
        q.user_res_tags_relations_org_id_eq = props.orgRecord?.id;
      }

      loading.value = true;
      membershipStore.index({ q, per_page: 999999 }).then((res: any) => {
        const _duties = groupBy(
          res.records?.filter((record: any) => record.duty_id),
          'duty_id',
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

    const onDutyRowClick = (record: VObject) => {
      let dutyId = 0;
      if (record.duty) {
        recordName.value = record.duty.name;
        dutyId = record.duty.id;
        memberFormData.value = {
          org_id: props.orgRecord?.id,
          duty_id: record.duty.id,
          department_id: props.query?.departmentId ? record.department?.id : null,
        };
      } else {
        recordName.value = record.name;
        dutyId = record.id;
        memberFormData.value = {
          org_id: props.orgRecord?.id,
          duty_id: record.id,
        };
      }

      const q: any = {
        duty_id_eq: dutyId,
        department_id_eq: props.query?.departmentId,
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
      onDutyRowClick,
      membershipStore,
      recordName,
      memberFormData,
      visible,
    };
  },
});

export default ComResDutyIndex;
</script>

<template lang="pug">
.com-res-duty-index
  TaIndexTable.mt-12.h-full(
    :data='aggregation',
    :paginationConfig='{ hide: true }',
    @rowClick='onDutyRowClick',
    :loading='loading'
    v-if='showAggregation',
  )
    a-table-column(:autoHeight='true' title='部门名称' v-if='query.departmentId')
      template(#default='{ record }')
        | {{ record.department.name }}
    a-table-column(:autoHeight='true' title='身份名称' v-if='query.identityId')
      template(#default='{ record }')
        | {{ record.memberIdentity.name }}
    a-table-column(:autoHeight='true' title='标签名称' v-if='query.tagId')
      template(#default='{ record }')
        | {{ record.tag.name }}
    a-table-column(:autoHeight='true' title='岗位名称')
      template(#default='{ record }')
        | {{ record.duty.name }}
    a-table-column(:autoHeight='true' title='岗位人数' dataIndex='usersCount')
    a-table-column(:autoHeight='true' title='岗位人员')
      template(#default='{ record }')
        | {{ record.usersName }}
  TaIndexView(:config='config' @onShow='onDutyRowClick' v-else)

  a-drawer(
    v-model:visible='visible',
    :closeable='false',
    title='岗位详情',
    width='60%'
  )
    ComResMembershipIndex(
      :store='membershipStore',
      :recordName='recordName',
      :initFormData='memberFormData',
      v-if='visible',
    )
</template>

<style lang="stylus" scoped>
.com-res-duty-index
  height 100%
  width 100%
  >>>.table-header__title
    display none
</style>
