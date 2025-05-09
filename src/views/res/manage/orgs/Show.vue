<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import ComResOrgShow from '@/components/res/orgs/ComResOrgShow.vue';
import useManageOrg from './userManageOrg';

const ResManageOrgShow = defineComponent({
  name: 'ResManageOrgShow',
  components: {
    ComResOrgShow,
  },
  setup(props) {
    const {
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
    } = useManageOrg(props);

    return {
      ...toRefs(props),
      store,
      record: store.record,
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
  },
});

export default ResManageOrgShow;
</script>

<template lang="pug">
.res-manage-org-show
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
.res-manage-org-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
