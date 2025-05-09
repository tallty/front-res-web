<script lang="ts">
import { ResUserBooksApi } from '@/components/global/ta-component/ta-template-form-core/apis/res/user/books.api';
import { ResBook } from '@/res-core/types/model';
import { message } from 'ant-design-vue';
import { computed, defineComponent, PropType, ref, Ref, watch } from 'vue';
import { VObject } from '../../../../../lib/vails/model/index';
import { VStore } from '../../../../../lib/vails/store/index';

export const bookCanUse: Ref<undefined | boolean> = ref(undefined);

interface BooksSelectionConfig {
  store: VStore;
  sourceType?: string; // 用于 TaNestedAttributesPolymorphicField
  tabKey?: string; // 用于 TaNestedAttributesPolymorphicField
}

const TaSelectableBooksSelection = defineComponent({
  name: 'TaSelectableBooksSelection',
  components: {},
  props: {
    visible: { type: Boolean, default: false },
    selectedRecords: { type: Array, default: () => [] },
    configAry: { type: Object as PropType<BooksSelectionConfig[]>, default: () => ({}) },
  },
  setup(props, { emit }) {
    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });

    const localSelectedRecords = computed({
      get: () => props.selectedRecords,
      set: val => emit('update:selectedRecords', val),
    });

    const selectedBooks = ref<ResBook[]>([]);

    const apis = computed(() =>
      props.configAry.map((config: BooksSelectionConfig) => config.store.api.indexPath),
    );

    const bookStore = new VStore(
      new ResUserBooksApi({
        params: { q: { by_apis: apis.value } },
      }),
    );

    watch(
      () => apis,
      () => {
        bookStore.api = new ResUserBooksApi({
          params: { q: { by_apis: apis.value } },
        });
      },
    );

    // 测试 book api 是否可用
    if (bookCanUse.value === undefined) {
      bookCanUse.value = false;
      bookStore
        .index({ per_page: 1 })
        .then(() => {
          bookCanUse.value = true;
        })
        .catch(() => {});
    }

    const taIndexViewConfig = computed(() => ({
      recordName: '通讯录',
      store: bookStore,
      mode: 'table',
      pagination: { perPage: 15 },
      selection: { showByDefault: true },
      table: {
        rowSelectionType: 'radio',
      },
    }));

    const onBookOk = () => {
      if (selectedBooks.value[0]) {
        bookStore.find(selectedBooks.value[0].id).then(() => {
          const result = bookStore.record.value.book_relations.map(
            (rel: { source: VObject; source_type: string }) => ({
              ...rel.source,
              __TaIndexViewTabKey: props.configAry.find(
                (config: BooksSelectionConfig) => config.sourceType === rel.source_type,
              )?.tabKey,
            }),
          );

          result.forEach((record: any) => emit('selectedAdd', record));

          localSelectedRecords.value = result;

          message.success(
            `导入通讯录成功，共导入记录${bookStore.record.value.book_relations.length}条`,
          );
          localVisible.value = false;
        });
      }
    };

    return {
      localVisible,
      selectedBooks,
      bookStore,
      taIndexViewConfig,
      onBookOk,
      bookCanUse,
    };
  },
});
export default TaSelectableBooksSelection;
</script>

<template lang="pug">
.ta-selectable-books-selection
  a-modal(
    v-if='bookCanUse',
    v-model:visible='localVisible',
    :title='`选择通讯录`',
    width='90vw',
    :z-index='10001',
    @ok='onBookOk',
    @cancel='() => (localVisible = false)'
  )
    TaIndexView(
      v-if='localVisible',
      v-model:selectedRecords='selectedBooks',
      :config='taIndexViewConfig'
    )
      template(#table)
        a-table-column(dataIndex='name', title='名称')
        //- a-table-column(dataIndex='book_relations', title='名称')
</template>

<style lang="stylus" scoped></style>
