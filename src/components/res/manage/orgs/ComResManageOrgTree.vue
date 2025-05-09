<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { VObject, VStore } from '@/lib/vails';
import { ResManageDepartmentApi } from '@/res-core/apis/res/manage/department.api';
import { deepFilter } from '../util';
import { Modal } from 'ant-design-vue';
import { ResDepartmentModel } from '@/res-core/models/res/manage/department';

const ComResManageOrgTree = defineComponent({
  name: 'ComResManageOrgTree',
  props: {
    org: { type: Object, required: true },
    searchKey: { type: String, required: false, default: '' },
  },
  setup(props, { emit }) {
    const arrayToTree = (items: VObject[], root: any) => {
      const result: VObject[] = [];
      const map: VObject = {};

      items.forEach(
        item =>
          (map[item.id] = {
            ...item,
            title: item.name,
            key: `department-${item.org_id}-${item.id}`,
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
        title: props.org.name,
        key: `org-${props.org.id}`,
      },
    ]);

    const departemntApi = new ResManageDepartmentApi({
      parents: [
        {
          type: 'orgs',
          id: props.org.id,
        },
      ],
    });

    const loadData = async () => {
      const { data } = await departemntApi.index({ per_page: 99999 });
      orgTree.value[0].children = arrayToTree(data.records, null);
    };

    loadData();

    const onSelect = (selectedKeys: VObject) => {
      const searchKey = selectedKeys[0];
      if (searchKey && searchKey.startsWith('org')) {
        emit('selected', { orgId: searchKey.split('-')[1] });
      } else if (searchKey && searchKey.startsWith('department')) {
        emit('selected', { departmentId: searchKey.split('-')[2] });
      } else {
        emit('selected', {});
      }
    };

    const treeData = computed(() => {
      return deepFilter(orgTree.value, props.searchKey);
    });

    const record = ref({});
    const visible = ref(false);
    const departmentStore = new VStore(departemntApi, ResDepartmentModel);

    const onContextMenuClick = (treeKey: string, menuKey: string) => {
      const [type, orgId, departmentId] = treeKey.split('-');
      if (menuKey == 'add-department') {
        record.value = departmentStore.new({
          parent_id: departmentId ? Number(departmentId) : undefined,
          org_id: Number(orgId),
        });
        visible.value = true;
      } else if (menuKey == 'edit') {
        departmentStore.find(Number(departmentId)).then(({ data }) => {
          record.value = departmentStore.new(data);
          visible.value = true;
        });
      } else {
        onDelete(departmentId);
      }
    };

    const onDelete = (recordId: string | number) => {
      Modal.confirm({
        title: '您确定要删除该部门？',
        content: '',
        onCancel() {},
        onOk: () => {
          departmentStore.delete(recordId).then(() => {
            loadData();
          });
        },
      });
    };

    const afterSave = () => {
      loadData();
    };

    return {
      treeData,
      onSelect,
      orgTree,
      onContextMenuClick,
      visible,
      record,
      afterSave,
    };
  },
});

export default ComResManageOrgTree;
</script>

<template lang="pug">
.com-res-manage-department-tree
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
          TaIcon.mr-1(type='FolderFilled' color='#1890ff' size='16px' v-if='treeKey.startsWith("department")')
          TaIcon.mr-1(type='ClusterOutlined' color='#03543F' size='16px' v-if='treeKey.startsWith("org")')
          span {{ title }}
        a-dropdown
          TaIcon(type='MoreOutlined' color='#D1D5DB' size='16px')
          template(#overlay)
            a-menu(@click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey)")
              a-menu-item(key='add-department') 添加部门
              template(v-if='treeKey.startsWith("department")')
                a-menu-item(key='edit') 编辑
                a-menu-item(key='delete') 删除
  TaTemplateFormWithActionsDrawer(
    v-model:visible='visible',
    template='department',
    :record='record',
    @afterSave="afterSave",
  )
</template>
