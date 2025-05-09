<script lang="ts">
import { VObject } from '@/lib/vails';
import { computed, defineComponent, ref, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ComResDepartmentIndex from '../departments/ComResDepartmentIndex.vue';
import ComResDutyIndex from '../duties/ComResDutyIndex.vue';
import ComResDutyGroupTree from '../duty_groups/ComResDutyGroupTree.vue';
import ComResMemberIdentityTree from '../member_identities/ComResMemberIdentityTree.vue';
import ComResTagTree from '../tags/ComResTagTree.vue';
import ComResUserIndex from '../users/ComResUserIndex.vue';
import ComResOrgIndex from './ComResOrgIndex.vue';
import ComResOrgTree from './ComResOrgTree.vue';

const ComResOrgShow = defineComponent({
  name: 'ComResOrgShow',
  components: {
    ComResOrgTree,
    ComResDutyGroupTree,
    ComResMemberIdentityTree,
    ComResTagTree,
    ComResDutyIndex,
    ComResDepartmentIndex,
    ComResOrgIndex,
    ComResUserIndex,
  },
  props: {
    store: { type: Object, required: true },
    record: { type: Object, required: true },
    treeStores: { type: Object, required: true },
    indexStores: { type: Object, required: true },
    showTreeDefault: { type: Boolean, default: true },
  },
  emits: ['listModeChange', 'treeSelect'],
  setup(props, { emit }) {
    const activeListMode = ref('same_level');

    const listModes = [
      { label: '看本级', key: 'same_level' },
      { label: '看全部', key: 'subtree' },
    ];

    const onListModeChange = (mode: string) => {
      activeListMode.value = mode;
      listQuery.value = {};
      emit('listModeChange', mode);
    };

    const modes = [
      { key: 'org', label: '组织' },
      { key: 'duty', label: '岗位' },
      { key: 'member_identity', label: '身份' },
      { key: 'tag', label: '标签' },
    ];

    const activeMode = ref('org');

    const changeMode = (value: string) => {
      activeMode.value = value;
      emit('treeSelect', {});
    };

    const dutyIndex = ref<any>(null);
    const departmentIndex = ref<any>(null);

    const tabs = computed(() => {
      const usersCount = props.indexStores.user.totalCount;
      const dutyCount = dutyIndex.value?.showAggregation
        ? dutyIndex.value.aggregation.length
        : props.indexStores.duty.totalCount;
      const depCount = departmentIndex.value?.showAggregation
        ? departmentIndex.value.aggregation.length
        : props.indexStores.department.totalCount;
      const orgCount = props.indexStores.subOrg.totalCount;
      return [
        { key: 'users', label: '人员', width: '60px', num: usersCount },
        { key: 'duties', label: '岗位', width: '60px', num: dutyCount },
        { key: 'departments', label: '部门', width: '60px', num: depCount },
        { key: 'sub_orgs', label: '下级组织', num: orgCount },
      ];
    });

    const activeTab = ref('users');

    const listQuery = ref({});

    const onTreeSelect = (query: VObject) => {
      emit('treeSelect', query);
      listQuery.value = query;
    };

    const treeKeyword = ref('');

    const visibleForm = ref(false);

    const onEditOrg = () => {
      visibleForm.value = true;
    };

    const afterSave = () => {
      props.record.fetch();
    };

    const route = useRoute();
    const router = useRouter();

    const toOrg = (id: number) => {
      const res = route.path.match(/\/res\/.+\/orgs/);
      if (res) {
        router.push(`${res[0]}/${id}`);
      }
    };

    const leftHidden = ref(false);

    const toggleLeftSide = () => {
      leftHidden.value = !leftHidden.value;
    };

    const orgTree = ref<any>(null);

    const refresh = () => {
      orgTree.value?.loadData();
    };

    return {
      ...toRefs(props),
      record: props.store.record,
      modes,
      activeMode,
      changeMode,
      tabs,
      activeTab,
      onTreeSelect,
      treeKeyword,
      activeListMode,
      onListModeChange,
      listModes,
      onEditOrg,
      visibleForm,
      afterSave,
      listQuery,
      dutyIndex,
      departmentIndex,
      toOrg,
      leftHidden,
      toggleLeftSide,
      orgTree,
      refresh,
    };
  },
});
export default ComResOrgShow;
</script>

<template lang="pug">
.com-res-manage-org-show.rounded-lg.bg-white.flex.space-between.h-full(:class="{ 'no-left-side': leftHidden }")
  .left-side.p-4.h-full.transition-all
    .mb-4.input-group
      a-input-group.h-8(compact)
        a-select.h-8(v-model:value="activeMode", :bordered="false", size="small")
          a-select-option(v-for="mode in modes" :value="mode.key") {{ mode.label }}
        a-input.h-8(
          v-model:value="treeKeyword"
          placeholder="搜索..."
          style="width: calc(100% - 70px)")
    .flex.rounded-lg.border.border-solid.cursor-pointer.text-xs.font-medium.overflow-hidden.border-primary.text-primary
      .text-center.py-2(
        :class="{'w-1/3': true, 'bg-primary text-white': activeMode == mode.key, 'border-r border-primary border-solid': index != modes.length-1  }"
        @click="changeMode(mode.key)"
        v-for='(mode, index) in modes') {{ mode.label }}
    .mt-4(v-show='activeMode == "org"')
      ComResOrgTree(
        ref='orgTree',
        v-if='record.id',
        :org='record',
        :keyword='treeKeyword',
        :store='treeStores.department',
        @selected='onTreeSelect',
      )
    .mt-4(v-show='activeMode == "duty"')
      ComResDutyGroupTree(
        v-if='record.id',
        :org='record',
        :keyword='treeKeyword',
        :dutyGroupStore='treeStores.dutyGroup',
        :dutyStore='treeStores.duty',
        :showDefault='showTreeDefault',
        @selected='onTreeSelect'
      )
    .mt-4(v-show='activeMode == "member_identity"')
      ComResMemberIdentityTree(
        v-if='record.id',
        :org='record',
        :keyword='treeKeyword',
        :store='treeStores.identity',
        :showDefault='showTreeDefault',
        @selected='onTreeSelect'
      )
    .mt-4(v-show='activeMode == "tag"')
      ComResTagTree(
        v-if='record.id',
        :org="record",
        :keyword='treeKeyword',
        :store='treeStores.tag',
        :showDefault='showTreeDefault',
        @selected='onTreeSelect',
      )

  .right-side.h-full.flex.flex-col.border-l.border-solid.border-gray-200.transition-all
    .flex.px-4.pt-4.justify-between.items-center
      .flex.items-center
        TaIcon.w-5.h-5.text-gray-500.mr-2.cursor-pointer(:type='`solid/chevron-double-${leftHidden ? "right" : "left" }`' @click='toggleLeftSide()')
        .text-lg.font-semibold.text-gray-900.mr-2 {{ record.name }}
        .text-green-800.bg-green-100.rounded-md.py-1.px-2.mr-2.text-xs.font-medium(v-if='record.org_identity_name') {{ record.org_identity_name }}
        .bg-primary.text-white.flex.items-center.justify-center.rounded-lg.cursor-pointer.h-8.w-18(@click='onEditOrg()')
          TaIcon.w-4.h-4.mr-2(type='solid/pencil-alt')
          .text-xs.font-medium.whitespace-nowrap 编辑
      .flex.rounded-lg.border.border-solid.cursor-pointer.text-xs.font-medium.overflow-hidden.border-primary.text-primary
        .text-center.py-2.px-3(
          :class="{ 'w-1/2': true, 'bg-primary text-white': activeListMode == mode.key }",
          @click='onListModeChange(mode.key)',
          v-for='(mode, index) in listModes'
        ) {{ mode.label }}

    .mt-2.h-10.flex.items-center.pl-4
      template(v-for='(ancestor, index) in record.ancestors')
        TaIcon.text-gray-400.w-5.mx-4(type='solid/chevron-right' v-if='index > 0')
        TaIcon.w-5.mr-4(
          :class='{ "text-primary": ancestor.id != record.id, "text-gray-400": ancestor.id == record.id }',
          type='solid/home'
          v-if='index == 0'
        )
        .text-sm.font-medium.cursor-pointer(
          :class='{ "text-primary": ancestor.id != record.id }',
          @click='toOrg(ancestor.id)'
        ) {{ ancestor.name }}
      template(v-if='listQuery.path_names')
        template(v-for='name in listQuery.path_names')
          TaIcon.text-gray-400.w-5.mx-4(type='solid/chevron-right')
          .text-sm.font-medium.cursor-pointer {{ name }}

    .relative.flex-auto
      .absolute.z-10.left-4
        TaTab(v-model:value='activeTab', :tabs='tabs')
          template(#tab='{ tab, isActive }')
            .h-12.flex-between(
              :class='{ "text-black": isActive }',
            )
              .mr-1 {{ tab.label }}
              .w-4 {{ tab.num }}

      ComResUserIndex.px-4.flex-auto(
        :membershipStore='indexStores.membership',
        :tagRelationStore='indexStores.tagRelation',
        :memberStore='indexStores.member',
        :store='indexStores.user',
        :orgRecord='record',
        v-show='activeTab == "users"')
      ComResDutyIndex.px-4.flex-auto(
        ref='dutyIndex',
        :store='indexStores.duty',
        :orgRecord='record',
        :membershipStore='indexStores.membership'
        :query='listQuery',
        v-show='activeTab == "duties"')
      ComResDepartmentIndex.flex-auto(
        ref='departmentIndex',
        :store='indexStores.department',
        :orgRecord='record',
        :membershipStore='indexStores.membership'
        :query='listQuery',
        @afterSave='refresh()',
        v-show='activeTab == "departments"')
      ComResOrgIndex.px-4.flex-auto(
        :store='indexStores.subOrg',
        :parentRecord='record',
        v-show='activeTab == "sub_orgs"')

  TaTemplateFormWithActionsDrawer(
    v-model:visible='visibleForm',
    template='org',
    title='企业信息',
    :closable='false',
    :record='record',
    @afterSave='afterSave'
  )
</template>

<style lang="stylus" scoped>
.com-res-manage-org-show
  height 100%
  >>>.ant-select-single .ant-select-selector .ant-select-selection-item
    line-height 36px
  .left-side
    width 360px
    padding 16
    overflow-x hidden
  .text-primary
    color $primary-color
  .border-primary
    border-color $primary-color
  .bg-primary
    background $primary-color
  .right-side
    width calc(100% - 300px)

  &.no-left-side
    .left-side
      width 0
      padding: 0
    .right-side
      width 100%
</style>
