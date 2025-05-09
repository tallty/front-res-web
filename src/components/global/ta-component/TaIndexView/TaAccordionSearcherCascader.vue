<script lang="ts">
import { VObject } from "@/lib/vails";
import { defineComponent, PropType, computed, toRefs, ref, watch } from "vue"
import { TaAccordionSearcherItemInterface } from './TaAccordionSearcher.vue';
import { cloneDeep, last } from 'lodash';

const TaAccordionSearcherCascader = defineComponent({
  name: 'TaAccordionSearcherCascader',
  props: {
    items: { type: Array as PropType<TaAccordionSearcherItemInterface[]>, default: () => [] },
    searchKey: { type: String, required: true },
    options: { type: Array as PropType<{ label: string, value: string, children: VObject[] }[]>, default: () => [] },
    multiple: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const resultOptions = ref<any[]>([]);

    const flattenOptions = () => {
      resultOptions.value = [];
      const _options = cloneDeep(props.options);
      while (_options.length > 0) {
        let _option = _options.pop();
        resultOptions.value.push({
          key: `${props.searchKey}-select-${resultOptions.value.length}`,
          label: _option!.label,
          value: _option!.value,
          query: {
            [`${props.searchKey}_in`]: [_option!.value],
          }
        });

        if (_option!.children) {
          _options.push(...(_option!.children as []));
        }
      }
    }

    watch(() => props.options, () => flattenOptions(), { immediate: true });

    const selectedItems = ref([]);

    const setSelectedItems = () => {
      if (props.multiple) {
        const itemsValues = props.items.map(item => (item as any).value);
        selectedItems.value = selectedItems.value.filter((selectedItem: any) =>itemsValues.includes(last(selectedItem)));
      } else {
        if (props.items.length == 0) {
          selectedItems.value = [];
        }
      }
    }

    watch(() => props.items.length, () => setSelectedItems(), { immediate: true });

    const onChange = (_value: any, selectedOptions: any) => {
      if (props.multiple) {
        const options: any[] = [];
        _value.map((value: any) => last(value)).forEach((item: any) => {
          const option = resultOptions.value.find((opt) => opt.value == item);
          if (option) {
            options.push(option);
          }
        });
        emit('update:items', options);
      } else {
        const option = resultOptions.value.find((opt) => opt.value == _value[_value.length - 1]);
        emit('update:items', option ? [option] : []);
      }
    };

    return {
      ...toRefs(props),
      selectedItems,
      onChange,
    }
  }
});

export default TaAccordionSearcherCascader;
</script>

<template lang="pug">
.ta-accordion-searcher-cascader
  .flex.items-center.flex-wrap
    .mr-8.my-1(v-for='option in options')
      a-cascader(
        v-model:value='selectedItems',
        :options='[option]',
        :multiple='multiple',
        change-on-select,
        expand-trigger="hover",
        @change='onChange'
      )
        .flex.items-center.cursor-pointer
          .mr-1 {{ option.label }}
          TaIcon(type='CaretDownOutlined')

</template>