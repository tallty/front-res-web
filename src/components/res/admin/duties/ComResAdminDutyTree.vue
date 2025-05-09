<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { VObject, VStore } from '@/lib/vails';
import { Modal } from 'ant-design-vue';
import { groupBy } from 'lodash';
import { deepFilter } from '../../util';
import { ResAdminDutiesApi } from '@/res-core/apis/res/admin/duties.api';
import { ResDutyModel } from '@/res-core/models/res/duty';
import { ResAdminDutyGroupsApi } from '@/res-core/apis/res/admin/duty_groups.api';
import { ResDutyGroupModel } from '@/res-core/models/res/duty_group';

const ComResAdminDutyTree = defineComponent({
  name: 'ComResAdminDutyTree',
  props: {},
  setup(props, { emit }) {
    const dutiesTree = ref<VObject[]>([]);

    const dutyStore = new VStore(
      new ResAdminDutiesApi({
        params: {
          q: { org_id_null: 1 },
        },
      }),
      ResDutyModel,
    );

    const dutyGroupStore = new VStore(
      new ResAdminDutyGroupsApi({
        params: {
          q: { org_id_null: 1 },
        },
      }),
      ResDutyGroupModel,
    );

    const loadDutyGroups = () => {
      Promise.all([
        dutyGroupStore.index({ per_page: 9999 }),
        dutyStore.index({ per_page: 9999 }),
      ]).then(([dutyGroupRes, dutyRes]) => {
        const groupedDuties = groupBy(
          dutyRes.records.map((record: any) => ({
            title: record.name,
            key: `duty-${record.org_id}-${record.id}`,
            duty_group_id: record.duty_group_id,
          })),
          'duty_group_id',
        );

        const dutyGroups = dutyGroupRes.records.map((record: any) => {
          return {
            key: `duty_group-${record.org_id}-${record.id}`,
            title: record.name,
            children: groupedDuties[record.id],
          };
        });

        dutiesTree.value = [
          {
            key: 'default',
            title: '默认',
            children: dutyGroups,
          },
        ];
      });
    };

    onMounted(() => {
      loadDutyGroups();
    });

    const searchKey = ref('');

    const treeData = computed(() => {
      return deepFilter(dutiesTree.value, searchKey.value);
    });

    const visible = ref(false);
    const template = ref('duty');
    const record = ref({});

    const onCreate = (type: string) => {
      const [recordType, _, recordId] = selectedKey.value?.split('-');

      record.value =
        type == 'duty'
          ? dutyStore.new({
              duty_group_id: recordType == 'duty_group' ? Number(recordId) : undefined,
            })
          : dutyGroupStore.new();
      template.value = type == 'duty' ? 'duty#default' : type;
      visible.value = true;
    };

    const selectedKey = ref('');

    const onSelect = (selectedKeys: VObject, event: VObject) => {
      selectedKey.value = selectedKeys[0];
      const { selectedNodes } = event;
      const selectedNode = selectedNodes[0];
      if (selectedNode) {
        const { key, title } = selectedNode;
        const [type, _, recordId] = key.split('-');
        emit('selected', { type, recordId, title });
      } else {
        emit('selected', { type: 'default' });
      }
    };

    const onContextMenuClick = (treeKey: string, menuKey: string) => {
      const [type, orgId, recordId] = treeKey.split('-');
      const store = type == 'duty_group' ? dutyGroupStore : dutyStore;
      if (menuKey == 'add-duty') {
        record.value = dutyStore.new({ org_id: Number(orgId), duty_group_id: Number(recordId) });
        template.value = 'duty#default';
        visible.value = true;
      } else if (menuKey == 'edit') {
        template.value = type == 'duty' ? 'duty#default' : type;
        store.find(Number(recordId)).then((res: any) => {
          record.value = store.new(res.data);
          visible.value = true;
        });
      } else {
        onDelete(type, recordId, store);
      }
    };

    const onDelete = (type: string, recordId: string | number, store: VObject) => {
      const typeName = type == 'duty_group' ? '岗位组' : '岗位';
      Modal.confirm({
        title: `您确定要删除该${typeName}？`,
        content: '',
        onCancel() {},
        onOk: () => {
          store.delete(recordId).then(() => {
            loadDutyGroups();
          });
        },
      });
    };

    const afterSave = () => {
      loadDutyGroups();
    };

    return {
      visible,
      template,
      record,
      onCreate,
      onSelect,
      onContextMenuClick,
      dutiesTree,
      afterSave,
      treeData,
      searchKey,
    };
  },
});

export default ComResAdminDutyTree;
</script>

<template lang="pug">
.com-res-admin-duty-tree
  .mb-4
    a-input(v-model:value='searchKey' placeholder='搜索岗位')
  .flex.justify-center.mb-2
    a-button.fixed-width(@click='onCreate("duty_group")') 添加岗位组
    a-button.fixed-width(@click='onCreate("duty")') 添加岗位
  a-directory-tree(
    default-expand-all,
    :tree-data="treeData",
    show-icon,
    @select="onSelect",
    expand-action='dblclick',
  )      
    template(#icon)
    template(#title="{key: treeKey, title }")
      .flex.items-center.justify-between
        .flex.items-center
          TaIcon.text-blue-500.w-4.h-4.mr-1(type='solid/identification' v-if='treeKey.includes("duty-")')
          TaIcon.mr-1(type='FolderFilled' color='#1890ff' size='16px' v-else)
          span {{ title }}
        a-dropdown
          TaIcon(type='MoreOutlined' color='#D1D5DB' size='16px' v-if='treeKey.startsWith("duty")')
          template(#overlay)
            a-menu(@click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey)")
              a-menu-item(key='add-duty' v-if='treeKey.startsWith("duty_group")') 添加岗位
              a-menu-item(key='edit') 编辑
              a-menu-item(key='delete') 删除
  TaTemplateFormWithActionsDrawer(
    v-model:visible='visible',
    :template='template',
    :record='record',
    @afterSave="afterSave()",
  )
</template>

<style lang="stylus" scoped>
.com-res-admin-duty-tree
  .fixed-width
    width 40%
    &:first-child
      margin-right 10px
</style>
