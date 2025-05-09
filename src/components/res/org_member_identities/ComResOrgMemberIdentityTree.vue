<script lang="ts">
import { defineComponent, ref, onMounted, toRefs } from 'vue';
import { VObject } from '@/lib/vails';
import { Modal } from 'ant-design-vue';
import ComResDirectoryTree from '../ComResDirectoryTree.vue';

const ComResOrgMemberIdentityTree = defineComponent({
  name: 'ComResOrgMemberIdentityTree',
  components: {
    ComResDirectoryTree,
  },
  props: {
    store: { type: Object, required: true },
    keyword: { type: String, required: false, default: '' },
  },
  setup(props, { emit }) {
    const identityTree = ref<VObject[]>([]);

    const loadData = async () => {
      const { records } = await props.store.index({ per_page: 99999 });

      identityTree.value = [
        {
          key: 'default',
          title: '默认',
          config: {
            icon: 'solid/folder',
            iconClass: '',
            actions: [{ key: 'create', label: '添加认证类型' }],
          },
          children: records.map((record: any) => ({
            key: `identity-${record.id}`,
            title: record.name,
            record: record,
            config: {
              icon: 'solid/user-circle',
              iconClass: '',
              actions: [
                { key: 'update', label: '编辑' },
                { key: 'delete', label: '删除' },
              ],
            },
          })),
        },
      ];
    };

    const onSelect = (e: VObject) => {
      const searchKey = e.node.key;
      if (searchKey && searchKey.includes('identity')) {
        const [type, identityId] = searchKey.split('-');
        emit('selected', { type, identityId, node: e.node, path_names: [e.node.record.name] });
      } else {
        emit('selected', {});
      }
    };

    const visible = ref(false);
    const record = ref({});

    const formTitle = ref('');

    const onCreate = (data: VObject) => {
      formTitle.value = '创建认证类型';
      record.value = props.store.new({});
      visible.value = true;
    };

    const onUpdate = (data: VObject) => {
      props.store.find(Number(data.record?.id)).then((res: any) => {
        formTitle.value = '编辑认证类型';
        record.value = props.store.new(res.data);
        visible.value = true;
      });
    };

    const onDelete = (data: VObject) => {
      Modal.confirm({
        title: '您确定要删除该认证类型？',
        content: '',
        onCancel() {},
        onOk: () => {
          props.store.delete(data.record?.id).then(() => {
            loadData();
          });
        },
      });
    };

    onMounted(() => {
      loadData();
    });

    return {
      ...toRefs(props),
      identityTree,
      record,
      visible,
      formTitle,
      loadData,
      onSelect,
      onCreate,
      onUpdate,
      onDelete,
    };
  },
});

export default ComResOrgMemberIdentityTree;
</script>

<template lang="pug">
.com-res-org-member-identity-tree
  .flex.justify-center.mb-4
    a-button(@click='onCreate()' style='width:90%')
      .text-gray-800.flex.items-center.justify-center
        TaIcon.w-4.h-4.mr-2(type='solid/plus')
        | 添加认证类型
  ComResDirectoryTree(
    :treeData='identityTree',
    :keyword='keyword',
    @select='onSelect',
    @create='onCreate',
    @update="onUpdate",
    @delete="onDelete",
  )
  TaTemplateFormWithActionsDrawer(
    v-model:visible='visible',
    template='org_member_identity',
    :record='record',
    :closable="false",
    :title='formTitle',
    @afterSave="loadData()",
  )
</template>
