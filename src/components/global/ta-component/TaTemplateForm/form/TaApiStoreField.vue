<script lang="ts">
import { defineComponent, PropType, computed, ref, toRefs } from 'vue';
import { VObject, VModel } from '@/lib/vails/model';
import useConfigurableApi from '../../ta-template-form-core/useConfigurableApi';
import { TaSelectableFieldProps } from './selectable/TaSelectableField.vue';
import { bookCanUse } from './TaSelectableBooksSelection.vue';
import { TaIndexViewTabInterface } from '../../TaIndexView/types';
import { TaIndexTreeItem } from '../../TaIndexView/ta-index-view-core/types';

// const isVModel = (obj: VObject | VModel<VObject>): obj is VModel<VObject> => {
//   return !!obj.rawData;
// };

const TaApiStoreField = defineComponent({
  name: 'TaApiStoreField',
  components: {},
  props: {
    value: { type: Array as PropType<VObject[]>, default: () => [] },
    path: { type: String, default: '' },
    ransackStr: { type: String, default: '' },
    bookSelectionConfig: { type: Array, default: undefined },
    ...TaSelectableFieldProps,
  },
  emits: [
    'onSelect',
    'update:value',
    'open',
    'ok',
    'cancel',
    'tabChange',
    'show',
    'selectedAdd',
    'selectedRemove',
    'selectedClearUp',
    'expand',
  ],
  setup(props, { emit }) {
    const { store } = useConfigurableApi(props);

    const localValue = computed({
      get: () => props.value?.filter((i?: VObject) => i) || [],
      set: val => {
        let result = [];
        try {
          result = val.map((i: VObject | VModel<VObject>) => i.rawData || i);
        } catch {
          result = val;
        }
        emit('update:value', result);
      },
    });

    const selectedRecords = ref<VObject[]>([]);

    const asyncToSelectedRecords = () => {
      selectedRecords.value = localValue.value;
    };

    const onSelectedAdd = (record: VObject) => {
      emit('selectedAdd', record);
    };

    const onSelectedRemove = (record: VObject, index: number) => {
      emit('selectedRemove', record, index);
    };

    const onSelectedClearUp = () => {
      emit('selectedClearUp');
    };

    const onTabChange = (tab: TaIndexViewTabInterface) => {
      emit('tabChange', tab);
    };

    const visibleBooks = ref(false);

    const selector = ref<any>(null);

    const onOk = () => emit('ok');

    const onExpand = (expanded: boolean, record: VObject, item: TaIndexTreeItem) => {
      emit('expand', expanded, record, item);
    };

    return {
      ...toRefs(props),
      store,
      selectedRecords,
      localValue,
      asyncToSelectedRecords,
      onSelectedAdd,
      onSelectedRemove,
      onSelectedClearUp,
      onTabChange,
      visibleBooks,
      bookCanUse,
      selector,
      onOk,
      onExpand,
    };
  },
});
export default TaApiStoreField;
</script>

<template lang="pug">
.ta-api-store-field
  TaSelectableField(
    ref='selector',
    v-bind='$props',
    v-model:value='localValue',
    v-model:selectedRecords='selectedRecords',
    :store='store',
    :resetValue='asyncToSelectedRecords',
    @selectedAdd='onSelectedAdd',
    @selectedRemove='onSelectedRemove',
    @selectedClearUp='onSelectedClearUp',
    @tabChange='onTabChange',
    @ok='onOk',
    @expand='onExpand',
  )
    template(#tags='{ records, actions }')
      slot(name='tags', :records='records', :actions='actions')

    template(#tag-text='{ record }')
      slot(name='tag-text', :record='record')

    template(#display='{ open }')
      slot(name='display', :open='open')

    template(#modal-header-right)
      slot(name='modal-header-left')
      .contact.text-sm.px-3.py-1.mx-2.rounded-4xl.cursor-pointer(
        v-if='bookCanUse',
        @click='() => visibleBooks = true'
      )
        | 通讯录
      slot(name='modal-header-right')

    template(#selected-display='{ record, index, attrs, value, ellipsisValue }')
      slot(
        name='selected-display',
        :record='record',
        :index='index',
        :attrs='attrs',
        :value='value',
        :ellipsisValue='ellipsisValue'
      )

  TaSelectableBooksSelection(
    v-model:visible='visibleBooks',
    v-model:selectedRecords='selectedRecords',
    :configAry='bookSelectionConfig || [{ store }]',
    @selectedAdd='onSelectedAdd',
  )
</template>

<style lang="stylus" scoped>
.contact
  color $primary-color
  border 0.08rem solid $primary-color
</style>
