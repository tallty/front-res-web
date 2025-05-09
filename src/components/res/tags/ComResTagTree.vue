<script lang="ts">
import { defineComponent, toRefs, ref, onMounted } from 'vue';
import { VModel, VObject } from '@/lib/vails';
import ComResDirectoryTree from '../ComResDirectoryTree.vue';
import { Modal } from 'ant-design-vue';
import { cloneDeep, groupBy } from 'lodash';

const ComResTagTree = defineComponent({
  name: 'ComResTagTree',
  components: { ComResDirectoryTree },
  props: {
    store: { type: Object, required: true },
    keyword: { type: String, required: false, default: '' },
    org: { type: Object, required: false, default: () => ({}) },
    showDefault: { type: Boolean, default: true },
  },
  setup(props, { emit }) {
    const tagTree = ref<VObject[]>([]);

    const loadData = async () => {
      const { records } = await props.store.index({ q: { mode: 'with_default' }, per_page: 99999 });

      const groupedTags = groupBy(
        records.map((record: any) => ({
          key: `tag-${record.id}`,
          title: record.name,
          record,
          config: {
            icon: 'solid/hashtag',
            iconClass: '',
            actions:
              record.org_id == props.org?.id
                ? [
                    { key: 'update', label: '编辑' },
                    { key: 'delete', label: '删除' },
                  ]
                : null,
          },
        })),
        'record.org_id',
      );

      const actions = [{ key: 'create', label: '添加标签' }];

      if (!props.org?.id) {
        actions.push({ key: 'import', label: '导入标签' });
      }

      tagTree.value = [];

      if (props.showDefault) {
        tagTree.value.push({
          key: 'default',
          title: '默认',
          config: {
            icon: 'solid/folder',
            iconClass: '',
            actions: props.org?.id ? null : actions,
          },
          children: groupedTags['null'],
        });
      }

      if (props.org?.id) {
        tagTree.value.push({
          key: `org-${props.org.id}`,
          title: props.org.name,
          record: props.org,
          config: {
            icon: 'solid/folder',
            iconClass: '',
            actions,
          },
          children: groupedTags[props.org?.id?.toString()],
        });
      }
    };

    const onSelect = (e: VObject) => {
      const selectedKey = e.node.key;
      if (selectedKey && selectedKey.startsWith('org')) {
        emit('selected', { type: 'org', orgId: e.node.record.id });
      } else if (selectedKey && selectedKey.startsWith('tag')) {
        emit('selected', {
          type: 'tag',
          tagId: e.node.record.id,
          node: e.node,
          path_names: [e.node.record.name],
        });
      } else {
        emit('selected', {});
      }
    };

    const visible = ref(false);
    const record = ref({});
    const formTitle = ref('');

    const onCreate = (opts: VObject) => {
      const lastFormData = cloneDeep((record.value as VModel)?.lastFormData);
      record.value = props.store.new(
        cloneDeep(
          opts?.keepDataOnNext
            ? { ...lastFormData, id: null, org_id: props.org?.id }
            : { org_id: props.org?.id },
        ),
      );
      formTitle.value = '新建标签';
      visible.value = true;
      if (opts?.keepDataOnNext) loadData();
    };

    const onUpdate = (data: VObject) => {
      formTitle.value = '编辑标签';
      props.store.find(Number(data.record?.id)).then((res: any) => {
        record.value = props.store.new(res.data);
        visible.value = true;
      });
    };

    const onDelete = (data: VObject) => {
      Modal.confirm({
        title: '您确定要删除该标签？',
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

    const importer = ref<any>(null);

    const onImport = () => {
      importer.value?.onShow();
    };

    return {
      ...toRefs(props),
      tagTree,
      visible,
      record,
      loadData,
      onCreate,
      onUpdate,
      onDelete,
      onSelect,
      formTitle,
      onImport,
      importer,
    };
  },
});

export default ComResTagTree;
</script>

<template lang="pug">
.com-res-tag-tree
  .flex.justify-center.mb-4
    a-button.fixed-width(@click='onCreate()' style='width:90%')
      .text-gray-800.flex.items-center.justify-center
        TaIcon.w-4.h-4.mr-2(type='solid/plus')
        | 添加标签
  ComResDirectoryTree(
    :treeData='tagTree',
    :keyword='keyword',
    @select='onSelect',
    @create='onCreate',
    @update="onUpdate",
    @delete="onDelete",
    @import="onImport",
  )
  TaTemplateFormWithActionsDrawer(
    v-model:visible='visible',
    template='res_tag',
    :record='record',
    :title='formTitle',
    :closable='false',
    :canSaveAndCreateNext='true',
    @afterSaveAndCreateNext='onCreate',
    @afterSave="loadData()",
  )
  TaImport.hidden(ref='importer', :store='store', @success='loadData()')
</template>
