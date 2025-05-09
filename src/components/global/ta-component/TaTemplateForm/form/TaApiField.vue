<script lang="ts">
import { FormsResourceInfos } from '@/components/global/ta-component/ta-template-form-core/apis/forms/resource_infos';
import useGetFormValue from '@/components/global/ta-component/ta-template-form-core/useGetFormValue';
import { VObject } from '@/lib/vails/model';
import { cloneDeep, set } from 'lodash';
import { computed, defineComponent, PropType, ref, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import useConfigurableApi from '../../ta-template-form-core/useConfigurableApi';
import { useContextInject } from '../../ta-template-form-core/useContext';
import { TaIndexTreeItem } from '../../TaIndexView/ta-index-view-core/types';
import { TaSelectableFieldProps } from './selectable/TaSelectableField.vue';
import { bookCanUse } from './TaSelectableBooksSelection.vue';

const TaApiField = defineComponent({
  name: 'TaApiField',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    value: { type: Array as PropType<number[]>, default: () => [] },
    path: { type: String, default: '' },
    ransackStr: { type: String, default: '' },
    bookSelectionConfig: { type: Array, default: undefined },
    model: { type: Object, default: undefined },
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
    'expand',
  ],
  setup(props, { emit }) {
    const { store } = useConfigurableApi(props);
    const storeData = ref<VObject[]>([]);

    const ids = computed(() =>
      (props.value?.filter((i?: number) => i) || []).sort((a: number, b: number) => {
        return a - b;
      }),
    );

    const localValue = computed({
      get: () => storeData.value.filter((record: VObject) => props.value?.includes(record.id)),
      set: val => {
        setAttrsToContext(val);
        emit(
          'update:value',
          val.map((i: VObject) => i.id),
        );
      },
    });

    const { context } = useContextInject();
    const { valueKey } = useGetFormValue(props.item);

    const setAttrsToContext = (val: VObject[]) => {
      set(context, `__${valueKey.value}_attrs`, val);
    };

    const selectedRecords = ref<VObject[]>([]);

    const id2RemoteRecordMap = ref<VObject>({});

    const fetchRemoteRecords = async (page = 0, perPage = 15) => {
      const { data } = await new FormsResourceInfos().sendCollectionAction('find_by_ids', {
        data: {
          resource_info: {
            path: props.path,
            ids: page
              ? ids.value.slice((page - 1) * perPage, (page - 1) * perPage + perPage)
              : ids.value,
            attrs: props.attrs,
          },
        },
      });
      return data;
    };

    const fetchExistRecords = async () => {
      if (
        JSON.stringify([...(ids.value || [])].sort()) ===
        JSON.stringify(selectedRecords.value.map((i: VObject) => i.id).sort())
      )
        return;
      if (ids.value.length === 0) {
        selectedRecords.value = [];
      } else if (props.display === 'table') {
        selectedRecords.value = ids.value
          .map(
            (id: number) =>
              new Proxy(
                { id },
                {
                  get: (target, key) => {
                    if (key === 'id') {
                      return id;
                    }
                    return id2RemoteRecordMap.value[id]?.[key];
                  },
                },
              ),
          )
          .sort((a: { id: number }, b: { id: number }) => {
            return a.id - b.id;
          });

        storeData.value = cloneDeep(selectedRecords.value);

        const data = await fetchRemoteRecords(1);

        data.records.forEach((record: VObject) => {
          id2RemoteRecordMap.value[record.id] = record;
        });
        // storeData.value = cloneDeep(data.records);
        // setAttrsToContext(data.records);
      } else {
        const data = await fetchRemoteRecords();
        selectedRecords.value = data.records.sort((a: { id: number }, b: { id: number }) => {
          return a.id - b.id;
        });
        storeData.value = cloneDeep(data.records);
        setAttrsToContext(data.records);
      }
      if (props.callback) {
        props.callback(selectedRecords.value);
      }
    };

    watch(() => props.value, fetchExistRecords, { immediate: true });

    const onOk = (selectedRecords: VObject[]) => emit('ok', selectedRecords);

    const visibleBooks = ref(false);

    const onSelectedAdd = (record: VObject) => {
      emit('selectedAdd', record);
    };

    const onExpand = (expanded: boolean, record: VObject, item: TaIndexTreeItem) => {
      emit('expand', expanded, record, item);
    };

    const onOpen = () => {
      emit('open');
    };

    const onCancel = () => {
      emit('cancel');
    };

    const current = ref(1);

    const onTableChange = async (currentPage: number) => {
      current.value = currentPage;
      if (props.display !== 'table') return;

      setTimeout(async () => {
        const data = await fetchRemoteRecords(currentPage);
        data.records.forEach((record: VObject) => {
          id2RemoteRecordMap.value[record.id] = record;
        });
      });
    };

    const { t } = useI18n();

    return {
      ...toRefs(props),
      store,
      fetchExistRecords,
      selectedRecords,
      localValue,
      onOk,
      visibleBooks,
      bookCanUse,
      onSelectedAdd,
      onExpand,
      onOpen,
      onCancel,
      onTableChange,
      current,
      t,
    };
  },
});
export default TaApiField;
</script>

<template lang="pug">
.ta-api-field
  TaSelectableField(
    v-bind='$props',
    v-model:value='localValue',
    v-model:selectedRecords='selectedRecords',
    :store='store',
    :resetValue='fetchExistRecords',
    @open='onOpen',
    @ok='onOk',
    @expand='onExpand'
    @cancel='onCancel',
    @selectedRemove='onTableChange(current)',
    @selectedClearUp='onTableChange(current)',
    @tableChange='onTableChange'
  )
    template(#tags='{ records, actions }')
      slot(name='tags', :records='records', :actions='actions')

    template(#tag-text='{ record }')
      slot(name='tag-text', :record='record')

    template(#display='{ open }')
      slot(name='display', :open='open')

    template(#selected-display='{ record, index, attrs }')
      slot(name='selected-display', :record='record', :index='index', :attrs='attrs')

    template(#modal-header-right)
      slot(name='modal-header-left')
      .contact.text-sm.px-3.py-1.mx-2.rounded-4xl.cursor-pointer(
        v-if='bookCanUse && item?.options?.use_book',
        @click='() => (visibleBooks = true)'
      )
        | {{t('taComponent.Api.book')}}
      slot(name='modal-header-right')

    template(#modal-header)
      slot(name='modal-header')

    template(#right-actions)
      slot(name='right-actions')
    template(#search-right-actions)
      slot(name='search-right-actions')

    template(#modal-footer-left)
      slot(name='modal-footer-left')

    template(#display-extra)
      slot(name='display-extra')

    template(#table='{ records, searchKeyword, actions }')
      slot(
        name='table',
        :records='records',
        :searchKeyword='searchKeyword',
        :actions='actions'
      )

    template(#card='{ record, index, no, isActive, actions }')
      slot(
        name='card',
        :record='record',
        :index='record',
        :no='no',
        :isActive='isActive',
        :actions='actions'
      )

  TaSelectableBooksSelection(
    v-if='item?.options?.use_book',
    v-model:visible='visibleBooks',
    v-model:selectedRecords='selectedRecords',
    :configAry='bookSelectionConfig || [{ store }]',
    @selectedAdd='onSelectedAdd'
  )
</template>

<style lang="stylus" scoped>
.contact
  color $primary-color
  border 0.08rem solid $primary-color
</style>
