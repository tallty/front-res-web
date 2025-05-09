<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { ResDutyGroup, ResDuty } from '@/res-core/model';
import { VStore, VModel } from '@/lib/vails';
import { TaIndexTreeItem } from '@/components/global/ta-component/TaIndexTree.vue';
import { ref } from '@vue/reactivity';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';

const ComDutyTreeList = defineComponent({
  name: 'ComDutyTreeList',
  components: {},
  props: {
    dutyStore: { type: Object as PropType<VStore<ResDuty>>, required: true },
    dutyGroupStore: { type: Object as PropType<VStore<ResDutyGroup>>, required: true },
    dutyTemplate: { type: Object as PropType<TaTemplateFormItem>, required: true },
    dutyGroupTemplate: { type: Object as PropType<TaTemplateFormItem>, required: true },
  },
  emits: ['clickDuty'],
  setup(props, { emit }) {
    const flatData = computed<TaIndexTreeItem[]>(() => [
      ...props.dutyGroupStore.records.value.map(
        (dutyGroup: VModel<ResDutyGroup> & ResDutyGroup) => ({
          idKey: `dutyGroup-${dutyGroup.id}`,
          parentKey: null,
          label: dutyGroup.name,
          record: dutyGroup,
          create: {
            store: props.dutyStore,
            template: props.dutyTemplate,
            encodeFormData: (item: TaIndexTreeItem) => ({
              duty_group_id: Number(`${item.idKey}`.replace('dutyGroup-', '')),
            }),
          },
          update: {
            template: props.dutyGroupTemplate,
          },
          delete: true,
        }),
      ),
      ...props.dutyStore.records.value.map((duty: VModel<ResDuty> & ResDuty) => ({
        idKey: duty.id,
        parentKey: `dutyGroup-${duty.duty_group_id}`,
        label: duty.name,
        record: duty,
        update: {
          template: props.dutyTemplate,
        },
        delete: true,
        icon: 'UserOutlined',
        meta: { type: 'duty' },
      })),
    ]);

    const onClick = (item: TaIndexTreeItem) => {
      if (item.meta?.type == 'duty') {
        emit('clickDuty', item.record);
      }
    };

    return {
      ...toRefs(props),
      onClick,
      flatData,
    };
  },
});
export default ComDutyTreeList;
</script>

<template lang="pug">
.com-duty-tree-list.h-full.overflow-auto
  TaIndexTree(:flatData='flatData', @select='onClick')
</template>

<style lang="stylus" scoped></style>
