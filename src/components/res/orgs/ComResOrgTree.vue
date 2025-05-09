<script lang="ts">
import { VObject } from '@/lib/vails';
import { Modal } from 'ant-design-vue';
import { computed, defineComponent, onMounted, ref, toRefs } from 'vue';
import ComResDirectoryTree from '../ComResDirectoryTree.vue';

const ComResOrgTree = defineComponent({
  name: 'ComResOrgTree',
  components: {
    ComResDirectoryTree,
  },
  props: {
    org: { type: Object, required: true },
    keyword: { type: String, required: false, default: '' },
    store: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const arrayToTree = (items: VObject[], root: any) => {
      const result: VObject[] = [];
      const map: VObject = {};

      items.forEach(
        item =>
          (map[item.id] = {
            title: item.name,
            key: `department-${item.id}`,
            record: item,
            config: {
              icon: 'solid/folder',
              iconClass: '',
              actions: [
                { key: 'create', label: '添加部门' },
                { key: 'update', label: '编辑' },
                { key: 'delete', label: '删除' },
              ],
            },
          }),
      );

      items.forEach(item => {
        const { id, parent_id } = item;
        if (item.parent_id == root) {
          result.push(map[id]);
        } else {
          map[parent_id].children
            ? map[parent_id].children.push(map[id])
            : (map[parent_id].children = [map[id]]);
        }
      });

      return result;
    };

    const orgTree = ref<VObject[]>([
      {
        key: `org-${props.org.id}`,
        title: props.org.name,
        record: props.org,
        config: {
          icon: 'ClusterOutlined',
          iconColor: '#03543F',
          actions: [{ key: 'create', label: '添加部门' }],
        },
      },
    ]);

    const loading = computed(() => props.store.loading.value);
    const loadingChildrenMap = ref<Record<string, boolean>>({});

    const loadData = async () => {
      const { records } = await props.store.index({
        q: { parent_id_null: 1, s: ['id asc'] },
        per_page: 99,
      });
      orgTree.value[0].children = arrayToTree(records, null);
    };

    const onLoadData = (treeNode: VObject) => {
      if (treeNode.dataRef?.children && treeNode.dataRef.children.length > 0) {
        return Promise.resolve();
      }

      const nodeKey = treeNode.dataRef.key;
      loadingChildrenMap.value[nodeKey] = true;

      return props.store
        .index({
          q: { parent_id_eq: treeNode.dataRef?.record?.id },
          silence: false,
        })
        .then(() => {
          const records = props.store.records?.value || [];
          treeNode.dataRef.children = arrayToTree(records, treeNode.dataRef.record.id);
          orgTree.value = [...orgTree.value];
        })
        .finally(() => {
          loadingChildrenMap.value[nodeKey] = false;
        });
    };

    const onSelect = (e: VObject) => {
      const selectedKey = e.node.key;
      if (selectedKey && selectedKey.startsWith('org')) {
        emit('selected', { type: 'org', orgId: e.node.record.id });
      } else if (selectedKey && selectedKey.startsWith('department')) {
        emit('selected', {
          type: 'department',
          departmentId: e.node.record.id,
          node: e.node,
          path_names: e.node.record.path_names?.reverse(),
        });
      } else {
        emit('selected', {});
      }
    };

    const record = ref({});
    const visible = ref(false);

    const onCreate = (data: VObject) => {
      record.value = props.store.new({
        parent_id: data.key.startsWith('department') ? data.record?.id : undefined,
        org_id: props.org?.id,
      });
      visible.value = true;
    };

    const onUpdate = (data: VObject) => {
      props.store.find(Number(data.record?.id)).then((res: any) => {
        record.value = props.store.new(res.data);
        visible.value = true;
      });
    };

    const onDelete = (data: VObject) => {
      Modal.confirm({
        title: '您确定要删除该部门？',
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
      orgTree,
      visible,
      record,
      loading,
      loadingChildrenMap,
      loadData,
      onLoadData,
      onCreate,
      onUpdate,
      onDelete,
      onSelect,
    };
  },
});

export default ComResOrgTree;
</script>

<template lang="pug">
.com-res-org-tree
  ComResDirectoryTree(
    :treeData='orgTree',
    :keyword='keyword',
    :loadData='onLoadData',
    :loading='loading',
    @select='onSelect',
    @create='onCreate',
    @update="onUpdate",
    @delete="onDelete",
  )
  TaTemplateFormWithActionsDrawer(
    v-model:visible='visible',
    template='department',
    :record='record',
    @afterSave="loadData()",
  )
</template>
