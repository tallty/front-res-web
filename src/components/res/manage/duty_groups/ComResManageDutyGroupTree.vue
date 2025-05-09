<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { VObject, VStore } from '@/lib/vails';
import { ResManageDutyGroupApi } from '@/res-core/apis/res/manage/duty_group.api';
import { ResManageDutyApi } from '@/res-core/apis/res/manage/duty.api';
import { ResDutyGroupModel } from '@/res-core/models/res/manage/duty_group';
import { ResDutyModel } from '@/res-core/models/res/manage/duty';
import { Modal } from 'ant-design-vue';
import { map, groupBy } from 'lodash';
import { deepFilter } from '../util';

const ComResManageDutyGroupTree = defineComponent({
  name: 'ComResManageDutyGroupTree',
  props: {
    org: { type: Object, required: true },
    searchKey: { type: String, required: false, default: '' },
  },
  setup(props, { emit }) {
    const dutyGroupApi = new ResManageDutyGroupApi({
      parents: [
        {
          type: 'orgs',
          id: props.org.id,
        },
      ],
    });

    const dutyApi = new ResManageDutyApi({
      parents: [
        {
          type: 'orgs',
          id: props.org.id,
        },
      ],
    });

    const dutiesTree = ref<VObject[]>([]);

    const loadDutyGroups = async () => {
      const [dutyGroupRes, dutyRes] = await Promise.all([
        dutyGroupApi.index({ q: { mode: 'with_default' }, per_page: 999 }),
        dutyApi.index({ q: { mode: 'with_default' }, per_page: 9999 }),
      ]);

      const groupedDuties = groupBy(
        dutyRes.data.records.map(record => ({
          title: record.name,
          key: `${record.org_id ? 'duty' : 'default_duty'}-${record.org_id}-${record.id}`,
          duty_group_id: record.duty_group_id,
        })),
        'duty_group_id',
      );

      const groupedDutyGroups = groupBy(
        dutyGroupRes.data.records.map(record => ({
          title: record.name,
          key: `${record.org_id ? 'duty_group' : 'default_group'}-${record.org_id}-${record.id}`,
          children: groupedDuties[record.id],
          org_id: record.org_id,
        })),
        'org_id',
      );

      dutiesTree.value = [
        {
          key: 'default',
          title: '默认',
          children: groupedDutyGroups['null'],
        },
        {
          key: `org-${props.org.id}`,
          title: props.org.name,
          children: groupedDutyGroups[props.org.id.toString()],
        },
      ];
    };

    loadDutyGroups();

    const treeData = computed(() => {
      return deepFilter(dutiesTree.value, props.searchKey);
    });

    const visible = ref(false);
    const template = ref('duty');
    const record = ref({});

    const dutyStore = new VStore(dutyApi, ResDutyModel);
    const dutyGroupStore = new VStore(dutyGroupApi, ResDutyGroupModel);

    const onCreate = (type: string) => {
      const [recordType, _, recordId] = selectedKey.value.split('-');

      record.value =
        type == 'duty'
          ? dutyStore.new({
              org_id: props.org.id,
              duty_group_id: recordType == 'duty_group' ? Number(recordId) : undefined,
            })
          : dutyGroupStore.new();
      template.value = type;
      visible.value = true;
    };

    const selectedKey = ref('');

    const onSelect = (selectedKeys: VObject) => {
      selectedKey.value = selectedKeys[0];
      if (selectedKey.value && selectedKey.value.includes('group')) {
        const [type, orgId, dutyGroupId] = selectedKey.value.split('-');
        emit('selected', { type, orgId, dutyGroupId });
      } else if (selectedKey.value && selectedKey.value.includes('duty-')) {
        const [type, orgId, dutyId] = selectedKey.value.split('-');
        emit('selected', { type, orgId, dutyId });
      } else {
        emit('selected', {});
      }
    };

    const onContextMenuClick = (treeKey: string, menuKey: string) => {
      const [type, orgId, recordId] = treeKey.split('-');
      const store = type == 'duty_group' ? dutyGroupStore : dutyStore;
      if (menuKey == 'add-duty') {
        record.value = dutyStore.new({ org_id: Number(orgId), duty_group_id: Number(recordId) });
        template.value = 'duty';
        visible.value = true;
      } else if (menuKey == 'edit') {
        template.value = type;
        store.find(Number(recordId)).then(({ data }) => {
          record.value = store.new(data);
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
    };
  },
});

export default ComResManageDutyGroupTree;
</script>

<template lang="pug">
.com-res-manage-duty-group-tree
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
.com-res-manage-duty-group-tree
  .fixed-width
    width 40%
    &:first-child
      margin-right 10px
</style>
