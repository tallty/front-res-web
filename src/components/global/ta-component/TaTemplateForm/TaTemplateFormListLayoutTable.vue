<script lang="ts">
import {
  defineComponent,
  toRefs,
  PropType,
  computed,
  ref,
  Ref,
  inject,
  onMounted,
  watch,
} from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { VObject } from '@/lib/vails/model';
import useProcessFields from '../ta-template-form-core/useProcessFields';
import { get } from 'lodash';

export interface TaTemplateFormListLayoutTableHeader {
  label: string;
  key: string;
  item: TaTemplateFormItem;
  isList?: boolean;
}

const TaTemplateFormListLayoutTable = defineComponent({
  name: 'TaTemplateFormListLayoutTable',
  components: {},
  props: {
    templateAry: { type: Array as PropType<TaTemplateFormItem[]>, default: () => [] },
    records: { type: Array as PropType<VObject[]>, default: () => [] },
    needTableActions: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update', 'delete', 'create'],
  setup(props, { emit }) {
    const { processField, getKey } = useProcessFields();

    const tableHeaders = computed(() => {
      const headersAry: TaTemplateFormListLayoutTableHeader[][] = props.templateAry.map(
        (item: TaTemplateFormItem) => {
          const headers: TaTemplateFormListLayoutTableHeader[] = [];
          processField(
            item,
            {},
            i => {
              if (item.key !== i.key && !['condition', 'list'].includes(i.type!)) {
                headers.push({
                  label: i.name!,
                  key: getKey(i),
                  item: { ...i, name: '' },
                });
              } else if (item.key !== i.key && i.type === 'list') {
                headers.push({
                  label: i.name!,
                  key: getKey(i),
                  item: { ...i, name: '' },
                  isList: true,
                });
              }
            },
            (i, parent) => {
              return !(parent.type === 'list' && parent.key !== item.key);
            },
            null,
            item,
          );

          return headers;
        },
      );

      const allHeaders = headersAry.reduce((out, headers) => out.concat(headers), []);
      const result: TaTemplateFormListLayoutTableHeader[] = allHeaders.filter(
        (header, index) => allHeaders.findIndex(h => h.key === header.key) === index,
      );

      return result;
    });

    const itemsRefs = ref<Record<string, Record<string, any>>>({});

    const setRefs = (el: any, header: TaTemplateFormListLayoutTableHeader, record: VObject) => {
      if (!itemsRefs.value[header.key]) itemsRefs.value[header.key] = {};
      itemsRefs.value[header.key][record._id] = el;
    };

    // const trigger = ref(false);
    // onMounted(() => (trigger.value = !trigger.value));

    const headerHiddenMapping = ref({});

    onMounted(() => (headerHiddenMapping.value = getHeaderHiddenMapping()));
    watch(
      () => props.records,
      () => (headerHiddenMapping.value = getHeaderHiddenMapping()),
      { deep: true },
    );

    const getHeaderHiddenMapping = () => {
      // trigger.value;
      return tableHeaders.value.map((header: TaTemplateFormListLayoutTableHeader) => {
        if (Object.values(itemsRefs.value[header.key] || {}).length === 0) return false;
        return Object.values(itemsRefs.value[header.key] || {})
          .map((r: any) => {
            return r?.hidden || r?.fieldValue === undefined;
          })
          .reduce((a: boolean, b: boolean) => a && b, true);
      });
    };

    const onEdit = (record: VObject) => emit('update', record);
    const onDelete = (index: number) => emit('delete', index);

    return {
      ...toRefs(props),
      tableHeaders,
      get,
      itemsRefs,
      setRefs,
      headerHiddenMapping,
      onEdit,
      onDelete,
    };
  },
});
export default TaTemplateFormListLayoutTable;
</script>

<template lang="pug">
.ta-template-form-list-layout-table
  table
    tr
      template(v-for='(header, index) in tableHeaders')
        th.p-4(
          v-show='!headerHiddenMapping[index]',
          class='!text-center'
        )
          | {{ header.label }}
      th.p-4(v-if='needTableActions && !disabled') 操作
    tr(v-for='record in records')
      template(v-for='(header, index) in tableHeaders')
        td.p-2(
          v-show='!headerHiddenMapping[index]',
        )
          TaTemplateFormListLayoutTableItem(
            :ref='el => setRefs(el, header, record)'
            :record='record',
            :template='header.item',
            :isList='header.isList'
          )
      td.p-2(v-if='needTableActions && !disabled')
        .flex-center
          TaIconTooltip.mr-2(icon='EditOutlined', tips='编辑', @click='() => onEdit(record)')
          TaPopoverConfirm(title='删除', tips='您确定删除该记录吗？', @confirm='() => onDelete(index)')
            TaIconTooltip(icon='DeleteOutlined', tips='删除')
</template>

<style lang="stylus" scoped></style>
