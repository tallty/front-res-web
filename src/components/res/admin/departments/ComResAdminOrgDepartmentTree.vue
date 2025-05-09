<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed, watch } from 'vue';
import { VStore } from '@/lib/vails';
import { ResDepartment, ResOrg } from '@/res-core/model';
import TaIndexTree, { TaIndexTreeItem } from '@/components/global/ta-component/TaIndexTree.vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';

const ComResAdminOrgDepartmentTree = defineComponent({
  name: 'ComResAdminOrgDepartmentTree',
  components: {
    TaIndexTree,
  },
  props: {
    org: { type: Object as PropType<ResOrg>, required: true },
    departmentStore: { type: Object as PropType<VStore<ResDepartment>>, required: true },
    departmentTemplate: { type: Object as PropType<TaTemplateFormItem>, required: true },
  },
  setup(props, { emit }) {
    const flatData = computed<TaIndexTreeItem[]>(() => [
      {
        record: props.org,
        parentKey: null,
        idKey: -1,
        label: props.org.name,
      },
      ...props.departmentStore.records.value.map((department: ResDepartment) => ({
        record: department,
        tag: department.department_identity_name,
        tag_color: department.department_identity_color,
        label: department.short_name,
        parentKey:
          department.parent_id && haveThisDepartmentId(department.parent_id)
            ? department.parent_id
            : -1,
        idKey: department.id,
        update: { template: props.departmentTemplate },
        create: { store: props.departmentStore, template: props.departmentTemplate },
        delete: true,
      })),
    ]);

    const departmentIdToRecordMapping = computed(() =>
      props.departmentStore.records.value.reduce(
        (out: Record<string, boolean>, record: ResDepartment) => {
          out[`${record.id}`] = true;
          return out;
        },
        {},
      ),
    );

    const haveThisDepartmentId = (departmentId: number) => {
      return departmentIdToRecordMapping.value[`${departmentId}`];
    };

    const onSelect = (item: TaIndexTreeItem) => {
      if (item.record.id) {
        emit('select', item.record);
      }
    };

    const activeItem = ref(flatData.value[0]);

    return {
      ...toRefs(props),
      flatData,
      onSelect,
      activeItem,
    };
  },
});
export default ComResAdminOrgDepartmentTree;
</script>

<template lang="pug">
.com-res-admin-department-tree
  TaIndexTree(:flatData='flatData', @select='onSelect', v-model:activeItem='activeItem')
</template>

<style lang="stylus" scoped>
.item
  cursor pointer
  color rgba(0, 0, 0, 0.65)
  padding 10px 20px
  .icon
    margin-right 10px
    transition all 0.4s
  .rotate
    transform rotate(90deg)
    transition all 0.4s
  .tag
    color white
    border 0px solid #fff
    display inline-block
    border-radius 4px
    padding 2px 5px
    font-size 12px
    margin-right 5px
</style>
