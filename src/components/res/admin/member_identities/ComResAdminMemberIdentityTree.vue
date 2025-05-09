<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { VObject } from '@/lib/vails';
import { Modal } from 'ant-design-vue';
import { deepFilter } from '../../util';

const ComResAdminMemberIdentityTree = defineComponent({
  name: 'ComResAdminMemberIdentityTree',
  props: {
    org: { type: Object, required: true },
    identityStore: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const identityTree = ref<VObject[]>([]);

    const loadIdentities = async () => {
      const { records } = await props.identityStore.index({
        q: { org_id_null: 1 },
        per_page: 99999,
      });

      const identities = records.map((record: any) => ({
        title: record.name,
        key: `identity-${record.org_id}-${record.id}`,
      }));

      identityTree.value = [
        {
          key: 'default',
          title: '默认',
          children: identities,
        },
      ];
    };

    loadIdentities();

    const searchKey = ref('');

    const treeData = computed(() => {
      return deepFilter(identityTree.value, searchKey.value);
    });

    const visible = ref(false);
    const record = ref({});

    const onCreate = () => {
      record.value = props.identityStore.new();
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
        props.identityStore.find(Number(identityId)).then((res: any) => {
          record.value = props.identityStore.new(res.data);
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
          props.identityStore.delete(recordId).then(() => {
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

export default ComResAdminMemberIdentityTree;
</script>

<template lang="pug">
.com-res-admin-member-identity-tree
  .mb-4
    a-input(v-model:value='searchKey' placeholder='搜索身份')
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
.com-res-admin-member-identity-tree
  .fixed-width
    width 90%
</style>
