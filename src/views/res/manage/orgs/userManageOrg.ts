import { defineComponent, toRefs, onMounted, ref, computed, watch } from 'vue';
import { VObject, VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';
import { ResManageOrgApi } from '@/res-core/apis/res/manage/org.api';
import { ResOrgModel } from '@/res-core/models/res/org';
import { ResManageDepartmentApi } from '@/res-core/apis/res/manage/department.api';
import { ResDepartmentModel } from '@/res-core/models/res/department';
import { ResManageUserApi } from '@/res-core/apis/res/manage/user.api';
import { ResUserModel } from '@/res-core/models/res/user';
import { ResManageDutyGroupApi } from '@/res-core/apis/res/manage/duty_group.api';
import { ResDutyGroupModel } from '@/res-core/models/res/duty_group';
import { ResManageDutyApi } from '@/res-core/apis/res/manage/duty.api';
import { ResDutyModel } from '@/res-core/models/res/duty';
import { ResManageMemberIdentityApi } from '@/res-core/apis/res/manage/member_identity.api';
import { ResMemberIdentityModel } from '@/res-core/models/res/member_identity';
import { ResManageMembershipApi } from '@/res-core/apis/res/manage/membership.api';
import { ResMembershipModel } from '@/res-core/models/res/membership';
import { ResManageTagApi } from '@/res-core/apis/res/manage/tag.api';
import { ResTagModel } from '@/res-core/models/res/tag';
import { ResManageTagsRelationApi } from '@/res-core/apis/res/manage/tags_relation.api';
import { ResTagsRelationModel } from '@/res-core/models/res/tags_relation';
import { ResManageMemberApi } from '@/res-core/apis/res/manage/member.api';
import { ResMemberModel } from '@/res-core/models/res/member';
import useNavigateTab from '@/components/global/ta-component/useNavigateTab';

const useManageOrg = (props: any) => {
  const route = useRoute();
  const orgApi = route.meta.tanent
    ? new ResManageOrgApi({
        params: { q: { mode: 'tanent', tanents_code_eq: process.env.VUE_APP_TENENT_CODE } },
      })
    : new ResManageOrgApi();

  const store = new VStore(orgApi, ResOrgModel);
  const { updateTitle } = useNavigateTab();

  onMounted(() => {
    store.find(Number(route.params.orgId)).then((res: any) => {
      updateTitle(res.data.name, route.fullPath);
    });
  });

  const listMode = ref('same_level');
  const listQuery = ref<VObject>({});

  const userApiConfig = computed(() => {
    return {
      parents: [
        {
          type: 'orgs',
          id: Number(route.params.orgId),
        },
      ],
      params: {
        q: {
          mode: listMode.value,
          orgs_id_eq: listQuery.value.orgId,
          departments_id_eq: listQuery.value.departmentId,
          duties_id_eq: listQuery.value.dutyId,
          member_identities_id_eq: listQuery.value.identityId,
          res_tags_id_eq: listQuery.value.tagId,
        },
      },
    };
  });

  const userListStore = new VStore(
    new ResManageUserApi({
      ...userApiConfig.value,
    }),
    ResUserModel,
  );

  const departmentApiConfig = computed(() => {
    return {
      parents: [
        {
          type: 'orgs',
          id: Number(route.params.orgId),
        },
      ],
      params: {
        q: {
          mode: listMode.value,
          org_id_eq: listQuery.value.orgId,
          self_and_ancestors_id_eq: listQuery.value.departmentId,
        },
      },
    };
  });

  const departmentListStore = new VStore(
    new ResManageDepartmentApi({
      ...departmentApiConfig.value,
    }),
    ResDepartmentModel,
  );

  const dutyApiConfig = computed(() => {
    return {
      parents: [
        {
          type: 'orgs',
          id: Number(route.params.orgId),
        },
      ],
      params: {
        q: {
          mode: listMode.value,
          duty_group_id_eq: listQuery.value.dutyGroupId,
          id_eq: listQuery.value.dutyId,
        },
      },
    };
  });

  const dutyListStore = new VStore(
    new ResManageDutyApi({
      ...dutyApiConfig.value,
    }),
    ResDutyModel,
  );

  const subOrgApiConig = computed(() => {
    return listMode.value === 'same_level'
      ? { parent_id_eq: route.params.orgId }
      : { self_and_ancestors_id_eq: route.params.orgId, id_not_eq: route.params.orgId };
  });

  const subOrgListStore = new VStore(
    new ResManageOrgApi({
      params: {
        q: subOrgApiConig.value,
      },
    }),
    ResOrgModel,
  );

  watch(
    () => [listMode.value, listQuery.value],
    () => {
      userListStore.api = new ResManageUserApi({ ...userApiConfig.value });
      departmentListStore.api = new ResManageDepartmentApi({ ...departmentApiConfig.value });
      dutyListStore.api = new ResManageDutyApi({ ...dutyApiConfig.value });
      subOrgListStore.api = new ResManageOrgApi({
        params: {
          q: subOrgApiConig.value,
        },
      });
    },
  );

  const tagsRelationListStore = new VStore(
    new ResManageTagsRelationApi({
      parents: [
        {
          type: 'orgs',
          id: Number(route.params.orgId),
        },
      ],
    }),
    ResTagsRelationModel,
  );

  const membershipListStore = new VStore(
    new ResManageMembershipApi({
      parents: [
        {
          type: 'orgs',
          id: Number(route.params.orgId),
        },
      ],
    }),
    ResMembershipModel,
  );

  const departmentTreeStore = new VStore(
    new ResManageDepartmentApi({
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
    new ResManageDutyGroupApi({
      parents: [
        {
          type: 'orgs',
          id: Number(route.params.orgId),
        },
      ],
    }),
    ResDutyGroupModel,
  );

  const dutyTreeStore = new VStore(
    new ResManageDutyApi({
      parents: [
        {
          type: 'orgs',
          id: Number(route.params.orgId),
        },
      ],
    }),
    ResDutyModel,
  );

  const identityTreeStore = new VStore(
    new ResManageMemberIdentityApi({
      parents: [
        {
          type: 'orgs',
          id: Number(route.params.orgId),
        },
      ],
    }),
    ResMemberIdentityModel,
  );

  const tagTreeStore = new VStore(
    new ResManageTagApi({
      parents: [
        {
          type: 'orgs',
          id: Number(route.params.orgId),
        },
      ],
    }),
    ResTagModel,
  );

  const memberStore = new VStore(
    new ResManageMemberApi({
      parents: [
        {
          type: 'orgs',
          id: Number(route.params.orgId),
        },
      ],
    }),
    ResMemberModel,
  );

  const onListModeChange = (val: string) => {
    listMode.value = val;
  };

  const onTreeSelect = (query: VObject) => {
    listQuery.value = query;
  };

  return {
    store,
    userListStore,
    departmentListStore,
    dutyListStore,
    subOrgListStore,
    tagsRelationListStore,
    membershipListStore,
    departmentTreeStore,
    dutyGroupTreeStore,
    dutyTreeStore,
    identityTreeStore,
    tagTreeStore,
    memberStore,
    onListModeChange,
    onTreeSelect,
  };
};

export default useManageOrg;
