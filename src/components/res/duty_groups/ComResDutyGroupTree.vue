<script lang="ts">
import { VModel, VObject } from '@/lib/vails';
import { Modal } from 'ant-design-vue';
import { cloneDeep, groupBy } from 'lodash';
import { defineComponent, onMounted, ref, toRefs } from 'vue';
import ComResDirectoryTree from '../ComResDirectoryTree.vue';

const ComResDutyGroupTree = defineComponent({
  name: 'ComResDutyGroupTree',
  components: {
    ComResDirectoryTree,
  },
  props: {
    org: { type: Object, required: false, default: () => ({}) },
    dutyGroupStore: { type: Object, required: true },
    dutyStore: { type: Object, required: true },
    keyword: { type: String, required: false, default: '' },
    showDefault: { type: Boolean, default: true },
  },
  setup(props, { emit }) {
    const dutiesTree = ref<VObject[]>([]);

    const loadData = async () => {
      const [dutyGroupRes, dutyRes] = await Promise.all([
        props.dutyGroupStore.index({ q: { mode: 'with_default' }, per_page: 999 }),
        props.dutyStore.index({ q: { mode: 'with_default' }, per_page: 9999 }),
      ]);

      const groupedDuties = groupBy(
        dutyRes.records.map((record: any) => ({
          title: record.name,
          key: `duty-${record.id}`,
          record: record,
          config: {
            icon: 'solid/identification',
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
        'record.duty_group_id',
      );

      const groupedDutyGroups = groupBy(
        dutyGroupRes.records.map((record: any) => ({
          title: record.name,
          key: `group-${record.id}`,
          record: record,
          config: {
            icon: 'solid/folder',
            iconClass: '',
            actions:
              record.org_id == props.org?.id
                ? [
                    { key: 'create', label: '添加岗位' },
                    { key: 'update', label: '编辑' },
                    { key: 'delete', label: '删除' },
                  ]
                : null,
          },
          children: groupedDuties[record.id],
        })),
        'record.org_id',
      );

      dutiesTree.value = [];

      if (props.showDefault) {
        dutiesTree.value.push({
          key: 'default',
          title: '默认',
          config: {
            icon: 'solid/folder',
            iconClass: ['text-blue-500'],
            actions: props.org?.id ? null : [{ key: 'create', label: '添加岗位组' }],
          },
          children: groupedDutyGroups['null'],
        });
      }

      if (props.org?.id) {
        dutiesTree.value.push({
          key: `org-${props.org.id}`,
          title: props.org.name,
          record: props.org,
          config: {
            icon: 'solid/folder',
            iconClass: ['text-blue-500'],
            actions: [{ key: 'create', label: '添加岗位组' }],
          },
          children: groupedDutyGroups[props.org.id.toString()],
        });
      }
    };

    const selectedNode = ref<VObject>({});

    const onSelect = (e: VObject) => {
      selectedNode.value = e.node;
      if (selectedNode.value.key?.startsWith('group')) {
        emit('selected', {
          type: 'duty_group',
          orgId: selectedNode.value.record.org_id,
          dutyGroupId: selectedNode.value.record.id,
          node: e.node,
          path_names: [e.node.record.name],
        });
      } else if (selectedNode.value.key?.startsWith('duty')) {
        emit('selected', {
          type: 'duty',
          orgId: selectedNode.value.record.org_id,
          dutyId: selectedNode.value.record.id,
          node: e.node,
          path_names: [e.node.record.duty_group_name, e.node.record.name],
        });
      } else {
        emit('selected', {});
      }
    };

    const visible = ref(false);
    const template = ref('duty');
    const record = ref({});
    const formTitle = ref('');

    const onCreate = (data: VObject) => {
      record.value = data.key.startsWith('group')
        ? props.dutyStore.new({
            org_id: props.org.id,
            duty_group_id: data.key.startsWith('group') ? data.record.id : undefined,
          })
        : props.dutyGroupStore.new({ org_id: props.org.id });
      template.value = data.key.startsWith('group') ? 'duty' : 'duty_group';
      formTitle.value = data.key.startsWith('group') ? '新建岗位' : '新建岗位组';
      visible.value = true;
    };

    const onUpdate = (data: VObject) => {
      template.value = data.key.startsWith('group') ? 'duty_group' : 'duty';
      formTitle.value = data.key.startsWith('group') ? '编辑岗位组' : '编辑岗位';
      const store = data.key.startsWith('group') ? props.dutyGroupStore : props.dutyStore;
      store.find(data.record.id).then((res: any) => {
        record.value = store.new(res.data);
        visible.value = true;
      });
    };

    const onDelete = (data: VObject) => {
      const typeName = data.key.startsWith('group') ? '岗位组' : '岗位';
      const store = data.key.startsWith('group') ? props.dutyGroupStore : props.dutyStore;
      Modal.confirm({
        title: `您确定要删除该${typeName}？`,
        content: '',
        onCancel() {},
        onOk: () => {
          store.delete(data.record.id).then(() => {
            loadData();
          });
        },
      });
    };

    const onCreateGroup = () => {
      record.value = props.dutyGroupStore.new({ org_id: props.org?.id });
      template.value = 'duty_group';
      formTitle.value = '新建岗位组';
      visible.value = true;
    };

    const onCreateDuty = () => {
      const dutyGroupId =
        selectedNode.value.key?.startsWith('group') &&
        selectedNode.value.record?.org_id == props.org?.id
          ? selectedNode.value.record.id
          : undefined;
      record.value = props.dutyStore.new({
        org_id: props.org?.id,
        duty_group_id: dutyGroupId,
      });
      template.value = 'duty';
      formTitle.value = '新建岗位';
      visible.value = true;
    };

    const afterSaveAndCreateNext = (opts: any) => {
      loadData();
      const lastFormData = cloneDeep((record.value as VModel)?.lastFormData);
      const store = template.value == 'duty' ? props.dutyStore : props.dutyGroupStore;
      record.value = store.new(
        cloneDeep(opts?.keepDataOnNext ? { ...lastFormData, id: null } : {}),
      );
      visible.value = true;
    };

    onMounted(() => {
      loadData();
    });

    return {
      ...toRefs(props),
      dutiesTree,
      visible,
      template,
      record,
      loadData,
      onCreate,
      onUpdate,
      onDelete,
      onSelect,
      onCreateGroup,
      onCreateDuty,
      formTitle,
      afterSaveAndCreateNext,
    };
  },
});

export default ComResDutyGroupTree;
</script>

<template lang="pug">
.com-res-manage-duty-group-tree.h-full.overflow-auto
  .flex.justify-center.mb-2
    a-button(@click='onCreateGroup()', style='width: 45%; margin-right: 8px')
      .text-gray-800.flex.items-center.justify-center
        TaIcon.w-4.h-4.mr-2(type='solid/plus')
        | 添加岗位组
    a-button(@click='onCreateDuty()', style='width: 40%')
      .text-gray-800.flex.items-center.justify-center
        TaIcon.w-4.h-4.mr-2(type='solid/plus')
        | 添加岗位
  ComResDirectoryTree(
    :treeData='dutiesTree',
    :keyword='keyword',
    @select='onSelect',
    @create='onCreate',
    @update='onUpdate',
    @delete='onDelete'
  )
  TaTemplateFormWithActionsDrawer(
    v-model:visible='visible',
    :template='template',
    :record='record',
    :closable='false',
    :title='formTitle',
    :canSaveAndCreateNext='true',
    @afterSaveAndCreateNext='afterSaveAndCreateNext',
    @afterSave='loadData()'
  )
</template>
