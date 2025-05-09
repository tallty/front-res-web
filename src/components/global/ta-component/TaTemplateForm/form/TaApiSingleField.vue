<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref } from 'vue';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import { TaSelectableFieldProps } from './selectable/TaSelectableField.vue';
import { TaIndexTreeItem } from '../../TaIndexView/ta-index-view-core/types';
import { VObject } from '@/lib/vails';

const TaApiSingleField = defineComponent({
  name: 'TaApiSingleField',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    value: { type: Number, default: null },
    path: { type: String, default: '' },
    ransackStr: { type: String, default: '' },
    model: { type: Object, default: undefined },
    ...TaSelectableFieldProps,
  },
  setup(props, { emit }) {
    const localValue = computed<number[]>({
      get: () => [props.value],
      set: val => emit('update:value', val[0] || null),
    });

    const onExpand = (expanded: boolean, record: VObject, item: TaIndexTreeItem) => {
      emit('expand', expanded, record, item);
    };

    const fieldRef = ref<any>(null);
    const store = computed(() => fieldRef.value?.store);

    const onOpen = () => {
      emit('open');
    };

    return {
      ...toRefs(props),
      localValue,
      onExpand,
      fieldRef,
      store,
      onOpen,
    };
  },
});
export default TaApiSingleField;
</script>

<template lang="pug">
.ta-api-single-field
  TaApiField(
    ref='fieldRef',
    v-bind='$props'
    v-model:value='localValue',
    @expand='onExpand',
    @open='onOpen',
  )
    template(#display='{ open }')
      slot(name='display', :open='open')

    template(#tags='{ records, actions }')
      slot(name='tags', :records='records', :actions='actions')

    template(#modal-header-left)
      slot(name='modal-header-left')

    template(#modal-header-right)
      slot(name='modal-header-right')

    template(#modal-header)
      slot(name='modal-header')

    template(#right-actions)
      slot(name='right-actions')

    template(#display-extra)
      slot(name='display-extra')
</template>

<style lang="stylus" scoped></style>
