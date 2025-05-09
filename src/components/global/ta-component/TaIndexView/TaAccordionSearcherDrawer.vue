<script lang="ts">
import { ref, defineComponent, toRefs, computed, watch, PropType } from 'vue';
import { VObject } from '@/lib/vails/model/index';
import { isEqual, cloneDeep, merge } from 'lodash-es';
import { TaAccordionSearcherItemInterface } from './TaAccordionSearcher.vue';
import { mergeWithConcatArray } from './mergeWithConcatArray';
import { TaIndexSearcherOptionInterface } from './ta-index-view-core/types';

const TaAccordionSearcherDrawer = defineComponent({
  name: 'TaAccordionSearcherDrawer',
  components: {},
  props: {
    query: { type: Object, default: () => ({}) },
    options: { type: Array as PropType<VObject[]>, default: () => [] },
  },
  setup(props, { emit }) {
    const visible = ref(false);
    const onShowDrawer = () => {
      visible.value = true;
    };

    const localQuery = computed({
      get: () => props.query,
      set: val => emit('update:query', val),
    });

    // watch(
    //   localQuery,
    //   val => {
    //     if (!isEqual(val, queryCache.value)) {
    //       queryCache.value = cloneDeep(val);
    //     }
    //   },
    //   { immediate: true, deep: true },
    // );

    const onCancel = () => {
      key2Items.value = cloneDeep(key2ItemsOld.value);
      visible.value = false;
    };

    const onConfirm = () => {
      localQuery.value = cloneDeep(computedQuery.value);
      key2ItemsOld.value = cloneDeep(key2Items.value);
      visible.value = false;
    };

    const key2ItemsOld = ref<Record<string, TaAccordionSearcherItemInterface[]>>({});
    const key2Items = ref<Record<string, TaAccordionSearcherItemInterface[]>>({});

    const computedQuery = computed(() =>
      selectedItems.value.reduce(
        (out: VObject, item: TaAccordionSearcherItemInterface) =>
          mergeWithConcatArray(out, item.query),
        // merge({}, simpleSearchQuery.value),
        {},
      ),
    );

    const selectedItems = computed(() =>
      Object.keys(key2Items.value).reduce(
        (out: TaAccordionSearcherItemInterface[], key: string) => out.concat(key2Items.value[key]),
        [],
      ),
    );

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
      key2Items.value = {};
    };

    const group2Options = computed<VObject>(() =>
      props.options.reduce((out: VObject, opt: VObject) => {
        const key = opt.group || '高级搜索';
        if (!out[key]) out[key] = [];
        out[key].push(opt);
        return out;
      }, {} as VObject),
    );

    const activeTabKey = ref('');

    const tabs = computed(() =>
      Object.keys(group2Options.value).map((key: string) => ({
        key,
        label: key,
      })),
    );

    const active = computed(() => selectedItems.value.length > 0);

    return {
      ...toRefs(props),
      visible,
      onShowDrawer,
      onCancel,
      onConfirm,
      key2Items,
      computedQuery,
      selectedItems,
      deleteKey,
      onClearUp,
      group2Options,
      activeTabKey,
      active,
      tabs,
    };
  },
});
export default TaAccordionSearcherDrawer;
</script>

<template lang="pug">
.ta-accordion-searcher-drawer
  .rounded-lg.border.border-gray-200.px-3.py-1.space-x-2.text-gray-800.flex.items-center.cursor-pointer(
    :class="{ active }"
    @click='onShowDrawer'
  )
    svg(width="14" height="13" viewBox="0 0 14 13" fill="none")
      path(d="M2.99954 1.70039C2.99954 1.48822 2.91525 1.28473 2.76522 1.13471C2.6152 0.984676 2.41171 0.900391 2.19954 0.900391C1.98737 0.900391 1.78388 0.984676 1.63385 1.13471C1.48382 1.28473 1.39954 1.48822 1.39954 1.70039V7.51479C1.15633 7.65523 0.954365 7.8572 0.813948 8.10043C0.673532 8.34365 0.599609 8.61955 0.599609 8.90039C0.599609 9.18124 0.673532 9.45713 0.813948 9.70036C0.954365 9.94358 1.15633 10.1456 1.39954 10.286V11.3004C1.39954 11.5126 1.48382 11.716 1.63385 11.8661C1.78388 12.0161 1.98737 12.1004 2.19954 12.1004C2.41171 12.1004 2.6152 12.0161 2.76522 11.8661C2.91525 11.716 2.99954 11.5126 2.99954 11.3004V10.286C3.24275 10.1456 3.44471 9.94358 3.58513 9.70036C3.72555 9.45713 3.79947 9.18124 3.79947 8.90039C3.79947 8.61955 3.72555 8.34365 3.58513 8.10043C3.44471 7.8572 3.24275 7.65523 2.99954 7.51479V1.70039ZM7.79954 1.70039C7.79954 1.48822 7.71525 1.28473 7.56522 1.13471C7.4152 0.984676 7.21171 0.900391 6.99954 0.900391C6.78737 0.900391 6.58388 0.984676 6.43385 1.13471C6.28382 1.28473 6.19954 1.48822 6.19954 1.70039V2.71479C5.95633 2.85523 5.75436 3.0572 5.61395 3.30043C5.47353 3.54365 5.39961 3.81955 5.39961 4.10039C5.39961 4.38124 5.47353 4.65713 5.61395 4.90036C5.75436 5.14358 5.95633 5.34556 6.19954 5.48599V11.3004C6.19954 11.5126 6.28382 11.716 6.43385 11.8661C6.58388 12.0161 6.78737 12.1004 6.99954 12.1004C7.21171 12.1004 7.4152 12.0161 7.56522 11.8661C7.71525 11.716 7.79954 11.5126 7.79954 11.3004V5.48599C8.04275 5.34556 8.24471 5.14358 8.38513 4.90036C8.52555 4.65713 8.59947 4.38124 8.59947 4.10039C8.59947 3.81955 8.52555 3.54365 8.38513 3.30043C8.24471 3.0572 8.04275 2.85523 7.79954 2.71479V1.70039ZM11.7995 0.900391C12.0117 0.900391 12.2152 0.984676 12.3652 1.13471C12.5153 1.28473 12.5995 1.48822 12.5995 1.70039V7.51479C12.8428 7.65523 13.0447 7.8572 13.1851 8.10043C13.3255 8.34365 13.3995 8.61955 13.3995 8.90039C13.3995 9.18124 13.3255 9.45713 13.1851 9.70036C13.0447 9.94358 12.8428 10.1456 12.5995 10.286V11.3004C12.5995 11.5126 12.5153 11.716 12.3652 11.8661C12.2152 12.0161 12.0117 12.1004 11.7995 12.1004C11.5874 12.1004 11.3839 12.0161 11.2339 11.8661C11.0838 11.716 10.9995 11.5126 10.9995 11.3004V10.286C10.7563 10.1456 10.5544 9.94358 10.4139 9.70036C10.2735 9.45713 10.1996 9.18124 10.1996 8.90039C10.1996 8.61955 10.2735 8.34365 10.4139 8.10043C10.5544 7.8572 10.7563 7.65523 10.9995 7.51479V1.70039C10.9995 1.48822 11.0838 1.28473 11.2339 1.13471C11.3839 0.984676 11.5874 0.900391 11.7995 0.900391Z" fill="currentColor")
    div {{ active ? '已筛选' : '筛选' }}


  a-drawer(
    v-model:visible='visible',
    title='高级搜索',
    width='70vw',
    :closable='false',
    @close='onCancel'
  )
    .flex.flex-col.text-sm.text-gray-900.mb-2.pb-6.border-b.border-gray-200
      .selected-tags.flex
        .label.flex.items-center 已筛选条件：
        .content.flex.flex-wrap.items-center
          TaAccordionSearcherTag.cursor-pointer.flex-shrink-0.my-1(
            v-for='item in selectedItems',
            :active='true',
            @click.stop='deleteKey(item.key)'
          )
            | {{ item.label }}
          .clear.cursor-pointer.text-primary(v-if='selectedItems.length > 0', @click='onClearUp')
            | 清空筛选
          .empty.text-gray-400(v-if='selectedItems.length === 0')
            | 暂无

    TaTab(v-show='tabs.length > 1', v-model:value='activeTabKey', :tabs='tabs')
    table.w-full.transition-all.transition-all(v-for='(opts, key) in group2Options', v-show='key === activeTabKey')
      tbody
        tr(v-for='(opt, index) in opts')
          td.align-top
            .label.pt-4.py-2.flex.pr-4.rounded-lg
              .text-gray-900.flex-shrink-0.py-1.truncate
                | {{ opt.label }}：
          td
            TaAccordionSearcherCascader.my-1(
              v-if='opt.type === "cascader"'
              v-model:items='key2Items[`${key}-${index}`]'
              :searchKey='opt.key',
              :options='opt.options'
              :multiple='opt.multiple'
            )
            TaAccordionSearcherSelectGroup.my-1(
              v-if='opt.type === "select"'
              v-model:items='key2Items[`${key}-${index}`]'
              :searchKey='opt.key',
              :select='opt.select',
              :options='opt.options',
              :multiple='opt.multiple',
              :path='opt.path',
              :ransackStr='opt.ransackStr',
            )
            TaAccordionSearcherStringGroup.my-1(
              v-else-if='opt.type === "string"'
              v-model:items='key2Items[`${key}-${index}`]'
              :searchKey='opt.key',
              :searchLabel='opt.label',
              :options='opt.options',
              :hideCustom='opt.hide_custom',
            )
            TaAccordionSearcherNumberGroup.my-1(
              v-else-if='opt.type === "number"'
              v-model:items='key2Items[`${key}-${index}`]'
              :searchKey='opt.key',
              :searchLabel='opt.label',
              :options='opt.options',
              :hideCustom='opt.hide_custom',
              :useRange='opt.use_range',
            )
            TaAccordionSearcherDatetimeGroup.my-1(
              v-else-if='opt.type === "time" || opt.type === "date"'
              v-model:items='key2Items[`${key}-${index}`]'
              :searchKey='opt.key',
              :searchLabel='opt.label',
              :options='opt.options'
              :hideCustom='opt.hide_custom',
              :showTime='opt.type === "time"'
            )
            component.my-1(
              v-else-if='opt.type === "dynamicComponent"'
              v-bind='opt',
              :is='opt.component'
              v-model:items='key2Items[`${key}-${index}`]'
            )
    template(#footer)
      .flex.justify-end.px-4.py-2.space-x-4
        a-button(
          @click='onCancel'
        )
          | 取消
        a-button(
          type='primary',
          @click='onConfirm'
        )
          | 筛选
</template>

<style lang="stylus" scoped>
.active
  @apply bg-primary text-white
</style>
