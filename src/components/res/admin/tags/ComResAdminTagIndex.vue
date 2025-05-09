<script lang="ts">
import { ResAdminMembershipsApi } from '@/res-core/apis/res/admin/memberships.api';
import { ResAdminTagApi } from '@/res-core/apis/res/admin/tag.api';
import { ResAdminTagsRelationApi } from '@/res-core/apis/res/admin/tags_relation.api';
import { ResAdminUsersApi } from '@/res-core/apis/res/admin/users.api';
import { ResMembershipModel } from '@/res-core/models/res/membership';
import { ResTagModel } from '@/res-core/models/res/tag';
import { ResTagsRelationModel } from '@/res-core/models/res/tags_relation';
import { ResUserModel } from '@/res-core/models/res/user';
import { VObject, VStore } from '@/lib/vails';
import { defineComponent, computed, toRefs, ref } from 'vue';
import ComResTagTree from '../../tags/ComResTagTree.vue';
import ComResAdminTagShow from './ComResAdminTagShow.vue';

const ComResAdminTagIndex = defineComponent({
  name: 'ComResAdminTagIndex',
  components: {
    ComResAdminTagShow,
    ComResTagTree,
  },
  setup() {
    const tagId = ref(null);

    const tagStore = new VStore(
      new ResAdminTagApi({
        params: {
          q: {
            org_id_null: 1,
          },
        },
      }),
      ResTagModel,
    );

    const tagRelationStore = computed(() => {
      return new VStore(
        new ResAdminTagsRelationApi({
          params: {
            q: {
              tag_id_eq: tagId.value,
            },
          },
        }),
        ResTagsRelationModel,
      );
    });
    const membershipStore = new VStore(new ResAdminMembershipsApi(), ResMembershipModel);

    const userStore = new VStore(new ResAdminUsersApi({}), ResUserModel);

    const config = computed(() => ({
      recordName: '标签关联',
      store: tagRelationStore.value,
      template: 'res_tags_relation',
      formDataEncode: (payload: VObject) => {
        return { ...formData.value, ...payload };
      },
      detail: {
        mode: 'drawer',
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
          { dataIndex: 'tag.name', title: '标签' },
          { dataIndex: 'user.name', title: '用户姓名' },
          { dataIndex: 'user.account', title: '用户账号' },
          { dataIndex: 'org.name', title: '组织' },
        ],
      },
      searcherSimpleOptions: [
        { key: 'tag.name', label: '标签名', type: 'string' },
        { key: 'user.name', label: '用户姓名', type: 'string' },
        { key: 'user.account', label: '用户账号', type: 'string' },
      ],
    }));

    const formData = computed(() => {
      return { tag_id: tagId.value };
    });

    const onTreeSelect = (data: VObject) => {
      tagId.value = data.tagId;
    };

    const treeKeyword = ref('');

    return {
      tagStore,
      tagRelationStore,
      membershipStore,
      userStore,
      config,
      onTreeSelect,
      treeKeyword,
    };
  },
});

export default ComResAdminTagIndex;
</script>

<template lang="pug">
.com-res-admin-tag-index.flex.space-between.h-full
  .left-side.p-4.h-full
    .mb-4
      a-input(v-model:value='treeKeyword' placeholder='搜索标签')
        template(#prefix)
          TaIcon.w-4.h-4.text-gray-300(type='solid/search')
    ComResTagTree(
      :keyword='treeKeyword',
      :store='tagStore',
      @selected='onTreeSelect',
    )

  .right-side.h-full.flex.flex-col.border-l.border-solid.border-gray-200
    .text-2xl.font-semibold.text-gray-900.mr-2.px-4.pt-4 标签管理
    TaIndexView.flex-auto(:config='config')
      template(#detail='{ record }')
        ComResAdminTagShow(
          v-if='record.id',
          :record='record',
          :tagRelationStore='tagRelationStore',
          :membershipStore='membershipStore',
          :userStore='userStore'
        )
</template>

<style lang="stylus" scoped>
.com-res-admin-tag-index
  height 100%
  width 100%
  .left-side
    width 260px
  .right-side
    width calc(100% - 300px)
  >>>.table-header__title
    display none
</style>
