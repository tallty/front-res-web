<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed, watch } from 'vue';
import { TaTemplateFormItem, TaTemplateFormRule } from '../../ta-template-form-core/types';
import { VObject } from '@/lib/vails/model';

const TaUserTypeField = defineComponent({
  name: 'TaUserTypeField',
  components: {},
  props: {
    value: { type: Array as PropType<VObject>, default: () => [] },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    // multiple: { type: Boolean, default: false },
    polymorphicKey: { type: String, default: 'user' },
  },
  setup(props, { emit }) {
    const tabs = [
      {
        key: 'user',
        label: '用户',
        path: '/res/member/users',
        table_items: [{ name: '名称', type: 'string', search: true, data_index: 'name' }],
        ransackStr: '',
        polymorphicType: 'User',
        tagColor: 'rgba(59, 130, 246, 1)',
      },
      {
        key: 'org',
        label: '单位',
        path: '/res/member/orgs',
        table_items: [{ name: '名称', type: 'string', search: true, data_index: 'name' }],
        ransackStr: '',
        polymorphicType: 'Org',
        tagColor: 'rgba(20, 184, 166, 1)',
      },
      {
        key: 'department',
        label: '部门',
        path: '/res/member/departments',
        table_items: [{ name: '名称', type: 'string', search: true, data_index: 'name' }],
        ransackStr: '',
        polymorphicType: 'Department',
        tagColor: 'rgba(245, 158, 11, 1)',
      },
    ];

    const validate = () => {
      return new Promise<void>((resolve, reject) => {
        if (
          (props.item.rules || []).filter((rule: TaTemplateFormRule) => rule.required).length === 0
        )
          return resolve();
        if (
          localValue.value?.[`${props.polymorphicKey}_type`] &&
          localValue.value?.[`${props.polymorphicKey}_id`]
        ) {
          resolve();
        } else {
          reject('请选择');
        }
      });
    };

    const localItem = computed(() => ({
      ...props.item,
      options: {
        ...props.item.options,
        nested_attributes_polymorphic_tabs: tabs,
      },
    }));

    const localValue = computed({
      get: () => props.value,
      set: val => {
        emit('update:value', val);
      },
    });

    const localSingleValue = computed<VObject[]>({
      get: () => {
        if (
          props.value?.[`${props.polymorphicKey}_type`] &&
          props.value?.[`${props.polymorphicKey}_id`]
        ) {
          return [
            {
              [`${props.polymorphicKey}_type`]: props.value?.[
                `${props.polymorphicKey}_type`
              ] as string,
              [`${props.polymorphicKey}_id`]: props.value?.[`${props.polymorphicKey}_id`] as number,
            },
          ];
        }
        return [];
      },
      set: val => {
        if (val[0]) {
          localValue.value[`${props.polymorphicKey}_type`] = tabs.find(
            tab => tab.key === val[0][props.polymorphicKey]?.__TaIndexViewTabKey,
          )?.polymorphicType;
          localValue.value[`${props.polymorphicKey}_id`] = val[0][props.polymorphicKey]?.id;
        }
      },
    });

    const selectorRef = ref<any>(null);

    const selector = computed(() => selectorRef.value?.selector);

    const onOk = () => emit('ok');

    return {
      ...toRefs(props),
      tabs,
      localItem,
      localSingleValue,
      selectorRef,
      selector,
      onOk,
      validate,
    };
  },
});
export default TaUserTypeField;
</script>

<template lang="pug">
.ta-user-polymorphic-field
  TaNestedAttributesPolymorphicField(
    ref='selectorRef',
    v-bind='$props',
    v-model:value='localSingleValue',
    :item='localItem',
    :multiple='false',
    @ok='onOk',
  )
    template(#display='{ open }')
      slot(name='display', :open='open')

    template(#tags='{ records, actions }')
      slot(name='tags', :records='records', :actions='actions')
</template>

<style lang="stylus" scoped></style>
