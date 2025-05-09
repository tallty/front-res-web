<script lang="ts">
import { defineComponent, computed, onMounted, ref, watch } from 'vue';
import { VStore } from '@/lib/vails';
import { orgIdentityTemplate, orgTemplate } from './template';
import ComResAdminOrgDepartmentTree from '../departments/ComResAdminOrgDepartmentTree.vue';
import { ResAdminDepartmentsApi } from '@/res-core/apis/res/admin/departments.api';
import { useRoute } from 'vue-router';
import { ResAdminMemberIdentitiesApi } from '@/res-core/apis/res/admin/member_identities.api';
import { ResAdminMembersApi } from '@/res-core/apis/res/admin/members.api';
import {
  orgShowMemberTemplate,
  orgShowDepartmentTemplateFunc,
  orgShowMembershipCreateTemplateFunc,
  orgShowOrgTemplate,
  orgShowMembershipTemplateFunc,
} from './orgShowTemplate';
import { ResMemberIdentity, ResDepartment } from '@/res-core/model';
import { ResAdminOrgsApi } from '@/res-core/apis/res/admin/orgs.api';
import { TaIndexViewTabInterface } from '@/components/global/ta-component/TaIndexView/types';
import { ResAdminMembershipsApi } from '@/res-core/apis/res/admin/memberships.api';
import { ResAdminSubtreeMembersApi } from '@/res-core/apis/res/admin/subtree/members.api';
import { ResAdminSubtreeMembershipsApi } from '@/res-core/apis/res/admin/subtree/memberships.api';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { VObject } from '@/lib/vails/model';
import ComDepartmentShowUnderOrg from '../departments/ComDepartmentShowUnderOrg.vue';
import { ResOrg } from '@/res-core/model';
import useNavigateTab from '@/components/global/ta-component/useNavigateTab';

const ComResAdminOrgIdentitiesIndex = defineComponent({
  name: 'ComResAdminOrgIdentitiesIndex',
  components: {
    ComResAdminOrgDepartmentTree,
    ComDepartmentShowUnderOrg,
  },
  setup() {
    const route = useRoute();
    const id = Number(route.params.orgId);
    const { updateTitle } = useNavigateTab();
    // apis

    const memberApi = new ResAdminMembersApi({
      parents: [{ type: 'orgs', id }],
    });
    const memberSubtreeApiComputed = computed(() => {
      return new ResAdminSubtreeMembersApi({
        parents: [
          { type: activeLeftIsOrg.value ? 'orgs' : 'departments', id: activeLeft.value.id },
        ],
      });
    });
    const membershipApi = new ResAdminMembershipsApi({
      parents: [{ type: 'orgs', id }],
    });

    const membershipSubtreeApiComputed = computed(() => {
      return new ResAdminSubtreeMembershipsApi({
        parents: [
          { type: activeLeftIsOrg.value ? 'orgs' : 'departments', id: activeLeft.value.id },
        ],
      });
    });

    const departmentApi = new ResAdminDepartmentsApi({ parents: [{ type: 'orgs', id }] });
    const departmentSubtreeApiComputed = computed(() => {
      return new ResAdminDepartmentsApi({
        parents: [{ type: 'orgs', id }],
        params: activeLeftIsOrg.value
          ? { q: { roots: true, s: ['position asc'] } }
          : { q: { children_of: activeLeft.value.id, s: ['position asc'] } },
      });
    });

    const orgApi = new ResAdminOrgsApi({ params: { q: { descendants_of: id } } });
    const orgSubtreeApi = new ResAdminOrgsApi({ params: { q: { children_of: id } } });
    // stores

    const orgStore = new VStore(new ResAdminOrgsApi());
    const departmentStore = new VStore(
      new ResAdminDepartmentsApi({
        parents: [{ type: 'orgs', id }],
        params: { per_page: 9999999, q: { s: ['position asc'] } },
      }),
    );

    const rightDepartmentStore = new VStore(departmentApi);
    const rightOrgStore = new VStore(orgApi);

    const memberIdentityStore = new VStore(new ResAdminMemberIdentitiesApi());
    const memberStore = new VStore(memberApi);
    const membershipStore = new VStore(membershipApi);

    // storeSwitch
    const storeSwitch = [
      { label: '看全部', key: 'all' },
      { label: '看本级', key: 'self' },
    ];

    const activeStoreSwitchKey = ref('all');

    const onClickStoreSwitch = (item: { label: string; key: string }) => {
      activeStoreSwitchKey.value = item.key;
      if (item.key === 'all') {
        memberStore.api = memberApi;
        membershipStore.api = membershipApi;
        rightDepartmentStore.api = departmentApi;
        rightOrgStore.api = orgApi;
      } else {
        memberStore.api = memberSubtreeApiComputed.value;
        membershipStore.api = membershipSubtreeApiComputed.value;
        rightDepartmentStore.api = departmentSubtreeApiComputed.value;
        rightOrgStore.api = orgSubtreeApi;
      }
    };

    // left part
    const activeLeft = ref<any>({});
    const onLeftClick = (record: ResOrg | ResDepartment) => {
      activeLeft.value = record;
    };

    const activeLeftIsOrg = computed(() => !(activeLeft.value.org_type === undefined));

    //
    onMounted(async () => {
      await Promise.all([orgStore.find(id), memberIdentityStore.index(), departmentStore.index()]);
      activeLeft.value = orgStore.record.value;
    });

    const visibleMembershipCreate = ref(false);
    const editMembershipRecord = ref<any>({});

    const onMembershipCreate = () => {
      visibleMembershipCreate.value = true;
      editMembershipRecord.value = membershipStore.new({});
    };

    const tabs = computed(() => {
      const memberTags = memberIdentityStore.records.value.map(
        (memberIdentity: ResMemberIdentity) => ({
          key: `${memberIdentity.id}`,
          label: memberIdentity.name,
          query: { member_identity_id_eq: memberIdentity.id } as VObject,
        }),
      );

      memberTags.unshift({
        key: '-1',
        label: '全部',
        query: {},
      });

      const membershipTags = memberIdentityStore.records.value.map(
        (memberIdentity: ResMemberIdentity) => ({
          key: `${memberIdentity.id}`,
          label: memberIdentity.name,
          query: { member_member_identity_id_eq: memberIdentity.id } as VObject,
        }),
      );

      membershipTags.unshift({
        key: '-1',
        label: '全部',
        query: {},
      });

      const result: TaIndexViewTabInterface[] = [
        {
          key: 'member',
          label: '成员',
          store: memberStore,
          tags: memberTags,
          template: orgShowMemberTemplate,
          actions: {
            delete: true,
          },
          detail: { mode: undefined },
          query: activeLeftIsOrg.value ? {} : { departments_id_eq: activeLeft.value.id },
        },
        {
          key: 'membership',
          label: '岗位',
          store: membershipStore,
          tags: membershipTags,
          template: membershipTemplate.value,
          formDataEncode: val => ({ ...val, org_id: id }),
          actions: [
            { key: 'create', enabled: false },
            { key: 'update', enabled: true },
            { key: 'delete', enabled: true },
            { key: 'import', enabled: false },
            { key: 'export', enabled: false },
            {
              key: 'custom_create',
              label: '创建',
              icon: 'PlusCircleOutlined',
              callback: onMembershipCreate,
              enabled: true,
              action_type: 'collection',
            },
          ],
          query: activeLeftIsOrg.value ? {} : { department_id_eq: activeLeft.value.id },
          searcherSimpleOptions: [
            { label: '用户名', key: 'member_user_name', type: 'string' },
            { label: '账号', key: 'member_user_account', type: 'string' },
          ],
        },
      ];

      if (activeLeftIsOrg.value) {
        result.push({
          key: 'org',
          label: '下级组织',
          store: rightOrgStore,
          template: orgShowOrgTemplate,
          formDataEncode: val => ({ ...val, parent_id: id }),
          actions: {
            create: true,
            delete: true,
          },
        });
        result.push({
          key: 'department',
          label: '部门管理',
          store: rightDepartmentStore,
          template: departmentTemplate.value,
          actions: {
            update: true,
            create: true,
            delete: true,
          },
          searcherSimpleOptions: [
            { label: '名称', key: 'name', type: 'string' },
            { label: '代号', key: 'code', type: 'string' },
            { label: '简称', key: 'short_name', type: 'string' },
          ],
        });
      } else {
        result.push({
          key: 'departmentShow',
          label: '部门详情',
          mode: 'custom',
        });
      }
      return result;
    });

    // templates
    const departmentSelect = computed(() => [
      { label: '空', value: null },
      ...departmentStore.records.value.map((department: ResDepartment) => ({
        value: department.id,
        label: `${department.name}(${department.code})`,
      })),
    ]);

    const departmentTemplate = computed<TaTemplateFormItem>(() => {
      return orgShowDepartmentTemplateFunc(
        departmentSelect.value,
        activeLeftIsOrg.value ? undefined : activeLeft.value.id,
      );
    });

    // const mountTree = (item: TaTemplateFormItemTreeData, ary: TaTemplateFormItemTreeData[]) => {
    //   item.children = ary.filter(i => i.parent_id === item.value).map(i => mountTree(i, ary));
    //   return item;
    // };

    const memberIdentitySelect = computed(() =>
      memberIdentityStore.records.value.map((record: ResMemberIdentity) => ({
        label: record.name,
        value: record.id,
      })),
    );

    const membershipCreateTemplate = computed<TaTemplateFormItem>(() => {
      return orgShowMembershipCreateTemplateFunc(
        orgStore.record.value,
        memberIdentitySelect.value,
        departmentSelect.value,
        activeLeftIsOrg.value ? undefined : activeLeft.value.id,
      );
    });

    const membershipTemplate = computed<TaTemplateFormItem>(() => {
      return orgShowMembershipTemplateFunc(orgStore.record.value, departmentSelect.value);
    });
    const stopNameWatcher = watch(
      () => activeLeft.value,
      () => {
        if (activeLeft.value.name) {
          updateTitle(activeLeft.value.name, route.fullPath);
          stopNameWatcher();
        }
      },
    );

    return {
      departmentStore,
      orgTemplate,
      orgIdentityTemplate,
      tabs,
      org: orgStore.record,
      onLeftClick,
      activeLeft,
      departmentTemplate,
      storeSwitch,
      activeStoreSwitchKey,
      onClickStoreSwitch,
      visibleMembershipCreate,
      editMembershipRecord,
      membershipCreateTemplate,
    };
  },
});

export default ComResAdminOrgIdentitiesIndex;
</script>

<template lang="pug">
.com-res-admin-org-show
  ComIdentityEditor(
    recordName='组织详情',
    :store='departmentStore',
    :recordTemplate='{}',
    identityName='部门',
    :identityStore='departmentStore',
    :identityTemplate='departmentTemplate',
    :tabs='tabs',
    :actions='null',
    leftWidth='300px'
  )
    template(#left-custom)
      .tree-shell
        ComResAdminOrgDepartmentTree(
          :org='org',
          :departmentStore='departmentStore',
          :departmentTemplate='departmentTemplate',
          @select='onLeftClick'
        )
    template(#right-header)
      .header
        .active-title
          ComIconText(:text='activeLeft.name')
        .right
          .switch(
            v-for='item in storeSwitch',
            @click='onClickStoreSwitch(item)',
            :class='{ "active-switch": item.key === activeStoreSwitchKey }'
          )
            | {{ item.label }}
    template(#custom='{ actions }')
      ComDepartmentShowUnderOrg(:department='activeLeft')
  TaTemplateFormWithActionsDrawer(
    title='创建岗位',
    v-model:visible='visibleMembershipCreate',
    :template='membershipCreateTemplate',
    :record='editMembershipRecord'
  )
</template>

<style lang="stylus" scoped>
.com-res-admin-org-show
  height 100%
  width 100%
  flex 1
.tree-shell
  height 70%
  overflow-y auto
.card
  height 38px
  width 100%
  padding 0 40px
  display flex
  align-items center
  font-size 14px
  font-family PingFangSC-Regular, PingFang SC
  font-weight 400
  color #262626
  cursor pointer
  .icon-box
    margin-right 6px
    color #83C6EF
    font-size 16px
.active-card
  background #E3F7FF
.card:hover
  background #E3F7FF
.header
  display flex
  justify-content space-between
  .active-title
    display flex
    align-items center
    font-size 20px
    font-family PingFangSC-Regular, PingFang SC
    font-weight 400
    color #595959
    .text
      .name
        margin-right 6px
    .icon-box
      margin-right 6px
      color #83C6EF
      font-size 22px
  .right
    display flex
    .switch
      padding 10px 20px
      display flex
      justify-content center
      align-items center
      color $primary-color
      border 1px solid $primary-color
    .active-switch
      color white
      background $primary-color
</style>
