<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import { VObject } from '@/lib/vails';

const TaTagIndex = defineComponent({
  name: 'TaTagIndex',
  components: {},
  props: {
    store: { type: Object, default: () => ({}) },
    actions: { type: Object, default: () => ({}) },
    activeActionsKeyToItemMap: { type: Object, default: () => ({}) },
    config: {
      type: Object,
      default: () => ({
        rootName: '标签组',
        name: '标签',
      }),
    },
  },
  setup(props) {
    const defaultFilter = (record: VObject) => record.depth === 0;

    const rootRecords = computed(() =>
      props.store.records.value.filter(props.config.rootFilter || defaultFilter),
    );

    const parentId2Records = computed(() =>
      props.store.records.value.reduce((out: VObject, record: VObject) => {
        if (!out[String(record.parent_id)]) out[String(record.parent_id)] = [];
        out[String(record.parent_id)].push(record);
        return out;
      }, {}),
    );

    const rootRecordId2records = computed(() =>
      rootRecords.value.reduce((out: VObject, record: VObject) => {
        if (!out[String(record.id)]) out[String(record.id)] = [];
        out[String(record.id)].push(...(parentId2Records.value[String(record.id)] || []));
        return out;
      }, {}),
    );

    const onCreateRecord = (rootRecord: VObject) => {
      props.actions.onCreate({ initFormData: { parent_id: rootRecord.id } });
    };

    return {
      ...toRefs(props),
      rootRecords,
      rootRecordId2records,

      onCreateRecord,
    };
  },
});
export default TaTagIndex;
</script>

<template lang="pug">
.ta-tag-index.h-full.w-full.divide-y.divide-gray-200.space-y-4
  .group(v-for='rootRecord in rootRecords')
    .flex.justify-between.items-center
      .name.text-xl.font-medium.py-4.flex.items-center
        .color-point.h-2.w-2.rounded-full.mr-4.flex-shrink-0(v-if='rootRecord.color', :style='{ background: rootRecord.color }')
        .text-base {{ rootRecord.name }}
      .group-actions.space-x-2
        TaPolicyResources(
          v-if='activeActionsKeyToItemMap.create',
          actionKey='create',
          :store='store'
        )
          TaTextButton(icon='PlusCircleOutlined', @click='() => onCreateRecord(rootRecord)') 创建{{ config.name }}

        TaPolicyResources(
          v-if='activeActionsKeyToItemMap.update',
          actionKey='update',
          :store='store'
        )
          TaTextButton(icon='EditOutlined', @click='() => actions.onEdit(rootRecord)')  编辑{{ config.name }}

        TaPolicyResources(
          v-if='activeActionsKeyToItemMap.delete',
          actionKey='destroy',
          :store='store'
        )
          TaPopoverConfirm(
            title='删除',
            :content='`确认删除该${config.rootName}`',
            @confirm='() => actions.onDelete(rootRecord)'
          )
            TaTextButton(icon='DeleteOutlined', @click.stop='') 删除{{ config.name }}
    .records.grid.grid-cols-6.gap-2
      template(v-for='record in rootRecordId2records[String(rootRecord.id)] || []')
        slot(:record='record')
          .record.flex.items-center.justify-between.py-2.px-4.border.border-gray-200.bg-gray-100.rounded
            slot(name='name', :record='record')
              .name.flex.items-center.flex-grow.w-0
                .color-point.h-2.w-2.rounded-full.mr-4.flex-shrink-0(v-if='record.color', :style='{ background: record.color }')
                a-tooltip
                  template(#title) {{ record.name }}
                  .text-base.truncate {{ record.name }}
            .actions.flex.space-x-2.flex-shrink-0
              TaPolicyResources(
                v-if='activeActionsKeyToItemMap.update',
                actionKey='update',
                :store='store'
              )
                TaIcon(type='EditOutlined', @click='() => actions.onEdit(record)')

              TaPolicyResources(
                v-if='activeActionsKeyToItemMap.delete',
                actionKey='destroy',
                :store='store'
              )
                TaPopoverConfirm(
                  title='删除',
                  :content='`确认删除该${config.name}`',
                  @confirm='() => actions.onDelete(record)'
                )
                  TaIcon(type='DeleteOutlined', @click.stop='')



</template>

<style lang="stylus" scoped>
.group
  .group-actions
    display none
  &:hover
    .group-actions
      display flex

.record
  .actions
    display none
  &:hover
    .actions
      display flex
</style>
