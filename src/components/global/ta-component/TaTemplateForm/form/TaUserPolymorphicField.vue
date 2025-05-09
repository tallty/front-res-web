<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed, watch } from 'vue';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import { VObject } from '@/lib/vails/model';
import { useContextInject } from '../../ta-template-form-core/useContext';
import { strInsertContext } from '../../ta-template-form-core/useConfigurableApi';

const TaUserPolymorphicField = defineComponent({
  name: 'TaUserPolymorphicField',
  components: {},
  props: {
    value: { type: Array as PropType<VObject[]>, default: () => [] },
    nestedAttributes: { type: Array as PropType<VObject>, default: () => [] },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    // multiple: { type: Boolean, default: false },
    paths: { type: Array as PropType<string[]>, default: () => [] },
    polymorphicKey: { type: String, default: 'user' },
  },
  setup(props, { emit }) {
    const { context } = useContextInject();

    const tabs = computed(() =>
      props.item.options?.nested_attributes_polymorphic_tabs
        ? props.item.options?.nested_attributes_polymorphic_tabs.map((tab: any) => ({
            ...tab,
            path: strInsertContext(tab.path, context),
          }))
        : [
            {
              key: 'user',
              label: '用户',
              path: strInsertContext(props.paths[0] || '/res/member/users', context),
              table_items: [{ name: '名称', type: 'string', search: true, data_index: 'name' }],
              ransackStr: '',
              polymorphicType: 'User',
              tagColor: 'rgba(59, 130, 246, 1)',
            },
            {
              key: 'org',
              label: '单位',
              path: strInsertContext(props.paths[1] || '/res/member/orgs', context),
              table_items: [{ name: '名称', type: 'string', search: true, data_index: 'name' }],
              ransackStr: '',
              polymorphicType: 'Org',
              tagColor: 'rgba(20, 184, 166, 1)',
            },
            {
              key: 'department',
              label: '部门',
              path: strInsertContext(props.paths[2] || '/res/member/departments', context),
              table_items: [{ name: '名称', type: 'string', search: true, data_index: 'name' }],
              ransackStr: '',
              polymorphicType: 'Department',
              tagColor: 'rgba(245, 158, 11, 1)',
            },
          ],
    );

    const localItem = computed(() => ({
      ...props.item,
      options: {
        ...props.item.options,
        nested_attributes_polymorphic_tabs: tabs.value,
        attrs: [`${props.polymorphicKey}.name`],
      },
    }));

    const localValue = computed({
      get: () => props.value,
      set: val => {
        emit('update:value', val);
      },
    });

    const localNestedAttributes = computed({
      get: () => props.nestedAttributes,
      set: val => {
        emit('update:nestedAttributes', val);
      },
    });

    const selectorRef = ref<any>(null);

    const selector = computed(() => selectorRef.value?.selector);

    const onOk = () => emit('ok');

    return {
      ...toRefs(props),
      tabs,
      localItem,
      localValue,
      selectorRef,
      selector,
      onOk,
      localNestedAttributes,
    };
  },
});
export default TaUserPolymorphicField;
</script>

<template lang="pug">
.ta-user-polymorphic-field
  TaNestedAttributesPolymorphicField(
    ref='selectorRef',
    v-bind='$props',
    v-model:value='localValue',
    v-model:nestedAttributes='localNestedAttributes',
    :item='localItem',
    @ok='onOk',
  )
    template(#display='{ open }')
      slot(name='display', :open='open')

    template(#tags='{ records, actions }')
      slot(name='tags', :records='records', :actions='actions')
</template>

<style lang="stylus" scoped></style>
