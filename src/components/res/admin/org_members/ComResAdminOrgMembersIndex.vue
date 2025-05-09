<script lang="ts">
import { TaIndexViewTabInterface } from '@/components/global/ta-component/TaIndexView/types';
import { VObject, VStore } from '@/lib/vails';
import { computed, defineComponent, ref, toRefs, watch } from 'vue';
import ComResOrgMemberIdentityTree from '../../org_member_identities/ComResOrgMemberIdentityTree.vue';
import ComResUserOrgRequest from '../../users/ComResUserOrgRequest.vue';
import { ResAdminOrgRequestsApi } from '@/res-core/apis/res/admin/org_requests.api';
import { ResOrgRequestModel } from '@/res-core/models/res/org_request';
import ComBpmInstanceDetailDialog from '@/engines/bpm/components/ComBpmInstanceDetailDialog.vue';

const ComResAdminOrgMembersIndex = defineComponent({
  name: 'ComResAdminOrgMembersIndex',
  components: {
    ComResOrgMemberIdentityTree,
    ComResUserOrgRequest,
    ComBpmInstanceDetailDialog,
  },
  props: {
    store: { type: Object, required: true },
    identityStore: { type: Object, required: true },
    identityId: { type: Number, default: null },
    leftHide: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onIdentitySelect'],
  setup(props, { emit }) {
    const identityId = ref(props.identityId || null);

    const identityRecord = ref<VObject>({});

    const findIdentityRecord = () => {
      props.identityStore.find(identityId.value).then((res: any) => {
        identityRecord.value = res.data;
      });
    };

    const config = computed(() => ({
      recordName: identityRecord.value.name || '企业认证',
      store: props.store,
      detail: {
        mode: 'drawer',
        width: '1100px',
      },
      template: identityRecord.value.form,
      params: {
        q: { org_member_identity_id_eq: identityId.value },
      },
      mode: 'table',
      actions: [
        { key: 'create', enabled: false },
        { key: 'update', enabled: false },
        { key: 'delete', enabled: false },
        { key: 'import', enabled: false },
        { key: 'export', enabled: false },
      ],
      table: {
        scroll: { y: 'auto' },
      },
    }));

    const taIndexView = ref<any>(null);
    const drawerTitle = ref('');
    const editRecord = ref<VObject>({});
    const visible = ref(false);

    const onUpdate = (record: VObject) => {
      if (identityId.value) {
        drawerTitle.value = '编辑企业认证';
        editRecord.value = record.value;
        visible.value = true;
        formUserId.value = record.userId;
      }
    };

    const onCreate = () => {
      if (identityId.value) {
        editRecord.value = props.identityStore.new({});
        formUserId.value = null;
        drawerTitle.value = '新建企业认证类型';
        visible.value = true;
      }
    };

    const formUserId = ref(null);

    watch(
      () => editRecord.value,
      () => {
        const dirty = editRecord.value.dirty();
        if (dirty.user_id && formUserId.value !== dirty.user_id) {
          props.store.find(dirty.user_id).then((res: any) => {
            editRecord.value.formData.user = res.data;
            formUserId.value = dirty.user_id;
          });
        }
      },
      {
        deep: true,
      },
    );

    const onIdentitySelect = (data: VObject) => {
      emit('onIdentitySelect', data);
      identityId.value = data.identityId;
      if (identityId.value) {
        findIdentityRecord();
      }
    };

    const treeKeyword = ref('');

    const afterSave = () => {
      taIndexView.value?.fetchData();
    };

    const requestStore = new VStore(new ResAdminOrgRequestsApi(), ResOrgRequestModel);

    const tabs = computed<TaIndexViewTabInterface[]>(() => [
      {
        key: 'request',
        label: '申请记录',
        store: requestStore,
        mode: 'table',
        detail: {},
        table: {
          scroll: { y: 'auto' },
          columns: [
            { title: '企业名称', dataIndex: 'name' },
            { title: '企业标识', dataIndex: 'code' },
            { title: '申请人', dataIndex: 'user.name' },
            { title: '申请时间', dataIndex: 'created_at' },
            { title: '状态', dataIndex: 'stateConfig.text' },
            { title: '审批', dataIndex: '' },
          ],
        },
      },
      ...(identityId.value
        ? [
            {
              key: 'member',
              label: '已认证',
            },
          ]
        : []),
    ]);

    const instanceId = ref(null);
    const instanceVisible = ref(false);
    const showInstance = (record: any) => {
      instanceId.value = record.create_instance_id;
      instanceVisible.value = true;
    };

    return {
      ...toRefs(props),
      config,
      taIndexView,
      treeKeyword,
      identityId,
      onUpdate,
      onCreate,
      onIdentitySelect,
      editRecord,
      visible,
      drawerTitle,
      afterSave,

      tabs,
      instanceId,
      instanceVisible,
      showInstance,
    };
  },
});

export default ComResAdminOrgMembersIndex;
</script>

<template lang="pug">
.com-res-admin-org-members-index.flex.space-between.h-full.bg-white.rounded
  .left-side.p-4.h-full(v-if='!leftHide')
    .mb-4
      a-input(v-model:value='treeKeyword', placeholder='搜索')
        template(#prefix)
          TaIcon.w-4.h-4.text-gray-300(type='solid/search')
    ComResOrgMemberIdentityTree(
      :keyword='treeKeyword',
      :store='identityStore',
      @selected='onIdentitySelect'
    )

  .right-side.h-full.flex.flex-col.border-l.border-solid.border-gray-200.pl-4
    //- .text-2xl.font-semibold.text-gray-900.mr-2.pt-4 企业认证管理
    TaIndexView.flex-auto(
      ref='taIndexView',
      :config='config',
      :tabs='tabs',
      @onCreate='onCreate',
      @onUpdate='onUpdate'
    )
      template(#bodyCell='{ text, record, index, column }')
        .primary-color.cursor-pointer(v-if="column.title == '审批'" @click='showInstance(record)') 查看流程
      template(#detail='{ record, onClose }')

  //- TaTemplateFormWithActionsDrawer(
  //-   v-model:visible='visible',
  //-   :template='mergedTemplate',
  //-   :record='editRecord',
  //-   :title='drawerTitle',
  //-   :closable='false',
  //-   width='1100px',
  //-   @afterSave='afterSave'
  //- )

  ComBpmInstanceDetailDialog(
    v-if='instanceVisible',
    v-model:visible='instanceVisible',
    :instanceId='instanceId'
  )
</template>

<style lang="stylus" scoped>
.primary-color
  color: $primary-color
.route-view__shell
  padding: 0px
.com-res-admin-org-members-index
  height 100%
  width 100%
  .left-side
    width 250px
  .right-side
    width calc(100% - 250px)
  >>>.com-res-directory-tree .title
    max-width: 122px;
</style>
