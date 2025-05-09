<script lang="ts">
import ComResOrgShow from '@/components/res/orgs/ComResOrgShow.vue';
import { defineComponent, toRefs, onMounted, computed, ref, watch } from 'vue';
import { ResAdminOrgsApi } from '@/res-core/apis/res/admin/orgs.api';
import { ResOrgModel } from '@/res-core/models/res/org';
import { ResAdminDepartmentsApi } from '@/res-core/apis/res/admin/departments.api';
import { ResDepartmentModel } from '@/res-core/models/res/department';
import { ResAdminDutyGroupsApi } from '@/res-core/apis/res/admin/duty_groups.api';
import { ResDutyGroupModel } from '@/res-core/models/res/duty_group';
import { ResAdminDutiesApi } from '@/res-core/apis/res/admin/duties.api';
import { ResDutyModel } from '@/res-core/models/res/manage/duty';
import { ResAdminMemberIdentityApi } from '@/res-core/apis/res/admin/member_identity.api';
import { ResMemberIdentityModel } from '@/res-core/models/res/member_identity';
import { ResAdminMembershipsApi } from '@/res-core/apis/res/admin/memberships.api';
import { ResMembershipModel } from '@/res-core/models/res/membership';
import { ResAdminUsersApi } from '@/res-core/apis/res/admin/users.api';
import { ResUserModel } from '@/res-core/models/res/user';
import { VObject, VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';
import { ResAdminTagApi } from '@/res-core/apis/res/admin/tag.api';
import { ResTagModel } from '@/res-core/models/res/tag';
import { ResAdminTagsRelationApi } from '@/res-core/apis/res/admin/tags_relation.api';
import { ResTagsRelationModel } from '@/res-core/models/res/tags_relation';
import { ResAdminMembersApi } from '@/res-core/apis/res/admin/members.api';
import { ResMemberModel } from '@/res-core/models/res/member';
import useNavigateTab from '@/components/global/ta-component/useNavigateTab';

const ResAdminOrgShow = defineComponent({
  name: 'ResAdminOrgShow',
  components: {
    ComResOrgShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResAdminOrgsApi(), ResOrgModel);
    const { updateTitle } = useNavigateTab();

    onMounted(() => {
      store.find(Number(route.params.orgId)).then((res: any) => {
        updateTitle(res.data.name, route.fullPath);
      });
    });

    const listMode = ref('same_level');
    const listQuery = ref<VObject>({});

    const userApiConfig = computed(() => {
      const q =
        listMode.value === 'same_level'
          ? { orgs_id_eq: route.params.orgId }
          : { orgs_self_and_ancestors_id_eq: route.params.orgId };
      return {
        params: {
          q: {
            ...q,
            departments_id_eq: listQuery.value.departmentId,
            duties_id_eq: listQuery.value.dutyId,
            member_identities_id_eq: listQuery.value.identityId,
            res_tags_id_eq: listQuery.value.tagId,
          },
        },
      };
    });

    const userListStore = new VStore(
      new ResAdminUsersApi({ ...userApiConfig.value }),
      ResUserModel,
    );

    const departmentApiConfig = computed(() => {
      const q =
        listMode.value === 'same_level'
          ? { org_id_eq: route.params.orgId }
          : { org_self_and_ancestors_id_eq: route.params.orgId };
      return {
        parents: [
          {
            type: 'orgs',
            id: Number(route.params.orgId),
          },
        ],
        params: {
          q: {
            ...q,
            self_and_ancestors_id_eq: listQuery.value.departmentId,
          },
        },
      };
    });

    const departmentListStore = new VStore(
      new ResAdminDepartmentsApi({ ...departmentApiConfig.value }),
      ResDepartmentModel,
    );

    const dutyApiConfig = computed(() => {
      const q =
        listMode.value === 'same_level'
          ? { org_id_eq: route.params.orgId }
          : { org_self_and_ancestors_id_eq: route.params.orgId };
      return {
        params: {
          q: {
            ...q,
            duty_group_id_eq: listQuery.value.dutyGroupId,
            id_eq: listQuery.value.dutyId,
          },
        },
      };
    });

    const dutyListStore = new VStore(
      new ResAdminDutiesApi({ ...dutyApiConfig.value }),
      ResDutyModel,
    );

    const subOrgApiConfig = computed(() => {
      return listMode.value === 'same_level'
        ? { parent_id_eq: route.params.orgId }
        : { self_and_ancestors_id_eq: route.params.orgId, id_not_eq: route.params.orgId };
    });

    const subOrgListStore = new VStore(
      new ResAdminOrgsApi({ params: { q: subOrgApiConfig.value } }),
      ResOrgModel,
    );

    const memberStore = new VStore(new ResAdminMembersApi(), ResMemberModel);

    watch(
      () => [listMode.value, listQuery.value],
      () => {
        userListStore.api = new ResAdminUsersApi({ ...userApiConfig.value });
        departmentListStore.api = new ResAdminDepartmentsApi({ ...departmentApiConfig.value });
        dutyListStore.api = new ResAdminDutiesApi({ ...dutyApiConfig.value });
        subOrgListStore.api = new ResAdminOrgsApi({
          params: {
            q: subOrgApiConfig.value,
          },
        });
      },
    );

    const tagsRelationListStore = new VStore(
      new ResAdminTagsRelationApi({
        params: {
          q: {
            org_id_eq: Number(route.params.orgId),
          },
        },
      }),
      ResTagsRelationModel,
    );

    const membershipListStore = computed(() => {
      const q =
        listMode.value === 'same_level'
          ? { org_id_eq: route.params.orgId }
          : { org_self_and_ancestors_id_eq: route.params.orgId };
      return new VStore(new ResAdminMembershipsApi({ params: { q } }), ResMembershipModel);
    });

    const departmentTreeStore = new VStore(
      new ResAdminDepartmentsApi({
        parents: [
          {
            type: 'orgs',
            id: Number(route.params.orgId),
          },
        ],
      }),
      ResDepartmentModel,
    );

    const dutyGroupTreeStore = new VStore(
      new ResAdminDutyGroupsApi({
        params: {
          q: { org_id_eq: route.params.orgId, org_id_null: 1, m: 'or' },
        },
      }),
      ResDutyGroupModel,
    );

    const dutyTreeStore = new VStore(
      new ResAdminDutiesApi({
        params: {
          q: { org_id_eq: route.params.orgId, org_id_null: 1, m: 'or' },
        },
      }),
      ResDutyModel,
    );

    const identityTreeStore = new VStore(
      new ResAdminMemberIdentityApi({
        params: {
          q: { org_id_eq: route.params.orgId, org_id_null: 1, m: 'or' },
        },
      }),
      ResMemberIdentityModel,
    );

    const tagTreeStore = new VStore(
      new ResAdminTagApi({
        params: {
          q: { org_id_eq: route.params.orgId, org_id_null: 1, m: 'or' },
        },
      }),
      ResTagModel,
    );

    const onListModeChange = (val: string) => {
      listMode.value = val;
    };

    const onTreeSelect = (query: VObject) => {
      listQuery.value = query;
    };

    return {
      ...toRefs(props),
      store,
      record: store.record,
      userListStore,
      departmentListStore,
      dutyListStore,
      subOrgListStore,
      membershipListStore,
      tagsRelationListStore,
      departmentTreeStore,
      dutyGroupTreeStore,
      dutyTreeStore,
      identityTreeStore,
      tagTreeStore,
      memberStore,
      onListModeChange,
      onTreeSelect,
    };
  },
});

export default ResAdminOrgShow;
</script>

<template lang="pug">
.res-admin-org-show
  ComResOrgShow(
    v-if='record.id',
    :store='store',
    :record='record',
    :indexStores='{ user: userListStore, department: departmentListStore, duty: dutyListStore, subOrg: subOrgListStore, membership: membershipListStore, tagRelation: tagsRelationListStore, member: memberStore }',
    :treeStores='{ department: departmentTreeStore, dutyGroup: dutyGroupTreeStore, duty: dutyTreeStore, identity: identityTreeStore, tag: tagTreeStore }',
    @listModeChange='onListModeChange',
    @treeSelect='onTreeSelect',
  )
</template>

<style lang="stylus" scoped>
.res-admin-org-show
  height 100%
  width 100%
</style>
