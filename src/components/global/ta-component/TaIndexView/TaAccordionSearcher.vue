<script lang="ts">
import { VObject } from '@/lib/vails';
import { debounce, merge } from 'lodash';
import { PropType, computed, defineComponent, ref, toRefs, watch } from 'vue';
import clickOutside from '../directives/clickOutside';
import { mergeWithConcatArray } from './mergeWithConcatArray';
import { TaIndexSearcherOptionInterface } from './ta-index-view-core/types';

export interface TaAccordionSearcherItemInterface {
  label: string;
  key: string;
  query: VObject;
}

/*
{
  searcherSimpleOptions: [{ key: 'name', label: 'name', type: 'string' }],
  searcherComplicatedOptions: [{
    label: '测试',
    type: 'dynamicComponent',
    component: 'ComTestSearcher',
  }]
}
  type === 'dynamicComponent' 时，
  动态组件采用下列规则：
    v-model:items='' 绑定 { label: '标题', query: { 查询条件 } } 的数组，
    NOTE: item 需要有 唯一 key，否则会导致数据混乱。
    其余 TaIndexSearcherOptionInterface 值透传给动态组件。
    ComTestSearcher.md 为示例。

*/

const TaAccordionSearcher = defineComponent({
  name: 'TaAccordionSearcher',
  components: {},
  directives: {
    'click-outside': clickOutside,
  },
  props: {
    query: { type: Object, default: () => ({}) },
    simpleOptions: { type: Array as PropType<TaIndexSearcherOptionInterface[]>, default: () => [] },
    options: { type: Array as PropType<TaIndexSearcherOptionInterface[]>, default: () => [] },
    placeholder: { type: String, default: '请输入搜索关键字' },
    allowCollpase: { type: Boolean, default: () => true },
  },
  setup(props, { emit }) {
    const localQuery = computed({
      get: () => props.query,
      set: val => emit('update:query', val),
    });

    const simpleSearchQuery = ref<VObject>({});
    const simpleKeyword = ref('');

    const key2Items = ref<Record<string, TaAccordionSearcherItemInterface[]>>({});

    const computedQuery = computed(() =>
      selectedItems.value.reduce(
        (out: VObject, item: TaAccordionSearcherItemInterface) =>
          mergeWithConcatArray(out, item.query),
        merge({}, simpleSearchQuery.value),
      ),
    );

    const selectedItems = computed(() =>
      Object.keys(key2Items.value).reduce(
        (out: TaAccordionSearcherItemInterface[], key: string) => out.concat(key2Items.value[key]),
        [],
      ),
    );

    watch(computedQuery, () => (localQuery.value = { ...computedQuery.value }), { deep: true });

    const collapsed = ref(props.allowCollpase);

    const deleteKey = (key: string) => {
      Object.keys(key2Items.value).forEach((k: string) => {
        const itemAry: TaAccordionSearcherItemInterface[] = key2Items.value[k];
        const existIndex = itemAry.findIndex(item => item.key === key);
        if (existIndex > -1) {
          itemAry.splice(existIndex, 1);
        }
      });
    };

    const onClearUp = () => {
      simpleKeyword.value = '';
      onSimpleSearch();
      key2Items.value = {};
    };

    // -- simple search

    const simpleSearchKey = computed(() => {
      if (props.simpleOptions.length === 0) {
        return '';
      }
      return `${props.simpleOptions
        .map((i: TaIndexSearcherOptionInterface) => i.key)
        .join(`_or_`)}_cont_any`;
    });

    const onSimpleSearch = () => {
      const keywordArray = simpleKeyword.value
        ? simpleKeyword.value
            .trim()
            .toLocaleLowerCase()
            .replace(/\s{2,}/g, ' ')
        : // .split(' ')
          // : [];
          '';

      simpleSearchQuery.value = {
        // [simpleSearchKey.value]: keywordArray,
        [simpleSearchKey.value]: keywordArray,
      };
    };
    const debounceInput: any = debounce(onSimpleSearch, 500);

    // - simple search end

    const group2Options = computed(() =>
      props.options.reduce((out: VObject, opt: TaIndexSearcherOptionInterface) => {
        const key = opt.group || '高级搜索';
        if (!out[key]) out[key] = [];
        out[key].push(opt);
        return out;
      }, {}),
    );

    const activeTabKey = ref('');

    const tabs = computed(() =>
      Object.keys(group2Options.value).map((key: string) => ({
        key,
        label: key,
      })),
    );

    const onClickOutside = () => {
      collapsed.value = true;
    };

    return {
      ...toRefs(props),
      key2Items,
      deleteKey,
      onClearUp,
      collapsed,
      selectedItems,
      simpleKeyword,
      debounceInput,
      tabs,
      group2Options,
      activeTabKey,

      localQuery,
      computedQuery,
      onClickOutside,
    };
  },
});
export default TaAccordionSearcher;
</script>

<template lang="pug">
.ta-accordion-searcher(v-click-outside='onClickOutside')
  .shell-container.-mb-2.transition-all(:class='{ "shell-container-not-collapsed": !collapsed }')
    .input-container.shadow-md.rounded.border-2.border-transparent.shallow-xl.bg-white.transition-all.flex.px-4.py-1.flex.flex-col
      .h-12.flex.items-center.w-full
        TaIcon.flex-shrink-0.my-3.mr-4.h-6.w-6.text-primary(type='outline/search')
        input.w-full(
          v-model='simpleKeyword',
          class='focus:outline-none',
          :placeholder='placeholder',
          @input='debounceInput',
          @keyup.enter='onSimpleSearch',
          @focus='() => (collapsed = false)'
        )
        slot(name='custom')

      .flex.flex-wrap.mb-1
        TaAccordionSearcherTag.cursor-pointer.flex-shrink-0.my-1(
          v-for='item in selectedItems',
          :active='true',
          @click='() => deleteKey(item.key)'
        )
          | {{ item.label }}
    .tab-container.max-h-0.overflow-hidden.transition-all.py-2(v-if='tabs.length > 0')
      .px-4.relative.flex.justify-between
        .absolute.w-full.border-t.border-gray-200(class='bottom-[8px]')
        TaTab.flex-grow.w-0(v-model:value='activeTabKey', :tabs='tabs')
        .flex-shrink-0.space-x-2(v-if='!collapsed')
          a-button(@click='() => (collapsed = true)') 收起选项
          a-button(@click='onClearUp') 清空搜索
    .table-container.max-h-0.overflow-hidden.transition-all.py-2
      table.w-full.transition-all.transition-all(
        v-for='(opts, key) in group2Options',
        v-show='key === activeTabKey'
      )
        tbody
          tr(v-for='(opt, index) in opts')
            td
              .label.m-2.flex.items-center
                .text-blue-gray-500.flex-shrink-0.py-1.px-4.truncate
                  | {{ opt.label }}
            td
              TaAccordionSearcherCascader.my-1(
                v-if='opt.type === "cascader"',
                v-model:items='key2Items[`${key}-${index}`]',
                :searchKey='opt.key',
                :options='opt.options',
                :multiple='opt.multiple'
              )
              TaAccordionSearcherSelectGroup.my-1(
                v-if='opt.type === "select"',
                v-model:items='key2Items[`${key}-${index}`]',
                :searchKey='opt.key',
                :select='opt.select',
                :options='opt.options',
                :multiple='opt.multiple',
                :path='opt.path',
                :ransackStr='opt.ransackStr'
              )
              TaAccordionSearcherStringGroup.my-1(
                v-else-if='opt.type === "string"',
                v-model:items='key2Items[`${key}-${index}`]',
                :searchKey='opt.key',
                :searchLabel='opt.label',
                :options='opt.options',
                :hideCustom='opt.hide_custom'
              )
              TaAccordionSearcherNumberGroup.my-1(
                v-else-if='opt.type === "number"',
                v-model:items='key2Items[`${key}-${index}`]',
                :searchKey='opt.key',
                :searchLabel='opt.label',
                :options='opt.options',
                :hideCustom='opt.hide_custom',
                :useRange='opt.use_range'
              )
              TaAccordionSearcherDatetimeGroup.my-1(
                v-else-if='opt.type === "time" || opt.type === "date"',
                v-model:items='key2Items[`${key}-${index}`]',
                :searchKey='opt.key',
                :searchLabel='opt.label',
                :options='opt.options',
                :hideCustom='opt.hide_custom',
                :showTime='opt.type === "time"'
              )
              component.my-1(
                v-else-if='opt.type === "dynamicComponent"',
                v-bind='opt',
                :is='opt.component',
                v-model:items='key2Items[`${key}-${index}`]'
              )

    //- .button-container.max-h-0.overflow-hidden
    //-   .w-full.flex.justify-end.items-center.space-x-2.border-t.border-gray-200.px-2
</template>

<style lang="stylus" scoped>
.shell-container-not-collapsed
  @apply 'p-2 py-4 rounded shadow-md mb-2'
  .input-container
    @apply 'm-0 !shadow-none'
    border-color $primary-color
  .tab-container
    @apply 'max-h-screen'
  .table-container
    @apply 'max-h-screen'
  .button-container
    @apply 'max-h-screen'
</style>
