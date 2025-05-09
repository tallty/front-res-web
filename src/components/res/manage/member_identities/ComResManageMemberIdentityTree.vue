<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { VObject, VStore } from '@/lib/vails';
import { ResManageMemberIdentityApi } from '@/res-core/apis/res/manage/member_identity.api';
import { ResMemberIdentityModel } from '@/res-core/models/res/manage/member_identity';
import { Modal } from 'ant-design-vue';
import { groupBy } from 'lodash';
import { deepFilter } from '../util';

const ComResManageMemberIdentityTree = defineComponent({
  name: 'ComResManageMemberIdentityTree',
  props: {
    org: { type: Object, required: true },
    searchKey: { type: String, required: false, default: '' },
  },
  setup(props, { emit }) {
    const identityApi = new ResManageMemberIdentityApi({
      parents: [
        {
          type: 'orgs',
          id: props.org.id,
        },
      ],
    });

    const identityTree = ref<VObject[]>([]);

    const loadIdentities = async () => {
      const { data } = await identityApi.index({ q: { mode: 'with_default' }, per_page: 99999 });

      const groupedIdentities = groupBy(
        data.records.map(record => ({
          title: record.name,
          key: `${record.org_id ? 'identity' : 'default_identity'}-${record.org_id}-${record.id}`,
          org_id: record.org_id,
        })),
        'org_id',
      );

      identityTree.value = [
        {
          key: 'default',
          title: '默认',
          children: groupedIdentities['null'],
        },
        {
          key: `org-${props.org.id}`,
          title: props.org.name,
          children: groupedIdentities[props.org.id.toString()],
        },
      ];
    };

    loadIdentities();

    const treeData = computed(() => {
      return deepFilter(identityTree.value, props.searchKey);
    });

    const visible = ref(false);
    const record = ref({});

    const identityStore = new VStore(identityApi, ResMemberIdentityModel);

    const onCreate = () => {
      record.value = identityStore.new();
      visible.value = true;
    };

    const afterSave = (record: VObject) => {
      loadIdentities();
    };

    const onSelect = (selectedKeys: VObject) => {
      const searchKey = selectedKeys[0];
      if (searchKey && searchKey.includes('identity')) {
        const [type, _, identityId] = searchKey.split('-');
        emit('selected', { type, identityId });
      } else {
        emit('selected', {});
      }
    };

    const onContextMenuClick = (treeKey: string, menuKey: string) => {
      const [type, orgId, identityId] = treeKey.split('-');
      if (menuKey == 'edit') {
        identityStore.find(Number(identityId)).then(({ data }) => {
          record.value = identityStore.new(data);
          visible.value = true;
        });
      } else {
        onDelete(identityId);
      }
    };

    const onDelete = (recordId: string | number) => {
      Modal.confirm({
        title: '您确定要删除该身份？',
        content: '',
        onCancel() {},
        onOk: () => {
          identityStore.delete(recordId).then(() => {
            loadIdentities();
          });
        },
      });
    };

    return {
      identityTree,
      onCreate,
      record,
      visible,
      afterSave,
      onSelect,
      onContextMenuClick,
      treeData,
    };
  },
});

export default ComResManageMemberIdentityTree;
</script>

<template lang="pug">
.com-res-manage-member-identity-tree
  .flex.justify-center.mb-4
    a-button.fixed-width(@click='onCreate()') 添加身份
  a-directory-tree(
    default-expand-all
    :tree-data="treeData",
    show-icon,
    @select="onSelect",
    expand-action='dblclick',
  )
    template(#icon)
    template(#title="{key: treeKey, title }")
      .flex.items-center.justify-between
        .flex.items-center
          TaIcon.w-5.h-5.text-blue-500.mr-1(type='solid/user-circle' v-if='treeKey.startsWith("identity")')
          TaIcon.mr-1(type='FolderFilled' color='#1890ff' size='16px' v-else)
          span {{ title }}
        a-dropdown
          TaIcon(type='MoreOutlined' color='#D1D5DB' size='16px' v-if='treeKey.startsWith("identity")')
          template(#overlay)
            a-menu(@click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey)")
              a-menu-item(key='edit') 编辑
              a-menu-item(key='delete') 删除
  TaTemplateFormWithActionsDrawer(
    v-model:visible='visible',
    template='member_identity',
    :record='record',
    @afterSave="afterSave",
  )
</template>
<style lang="stylus" scoped>
.com-res-manage-member-identity-tree
  .fixed-width
    width 90%
</style>
