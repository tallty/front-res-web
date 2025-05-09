<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed, watch } from 'vue';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import { VObject } from '@/lib/vails/model';

const TaResPermitPolymorphicField = defineComponent({
  name: 'TaResPermitPolymorphicField',
  components: {},
  props: {
    value: { type: Array as PropType<VObject[]>, default: () => [] },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    // multiple: { type: Boolean, default: false },
    paths: { type: Array, default: () => [] },
    polymorphicKey: { type: String, default: 'target' },
  },
  setup(props, { emit }) {
    const tabs = computed(() => [
      {
        key: 'member_identity',
        label: '角色',
        table_items: [
          {
            name: '名称',
            data_index: 'name',
            search: true,
            type: 'string',
          },
          {
            name: 'Member类型',
            data_index: 'member_type',
            search: false,
            type: 'string',
          },
        ],
        path: props.paths[0] || '/res/user/member_identities',
        ransackStr: '',
        polymorphicType: 'MemberIdentity',
        tagColor: 'rgba(59, 130, 246, 1)',
      },
      {
        key: 'api',
        label: '接口',
        table_items: [
          {
            name: '标签',
            data_index: 'label',
            search: true,
            type: 'string',
          },
          {
            name: '名称',
            data_index: 'name',
            search: true,
            type: 'string',
          },
        ],
        path: props.paths[1] || 'res/user/roles',
        polymorphicType: 'Role',
        tagColor: 'rgba(20, 184, 166, 1)',
      },
      {
        key: 'duty',
        label: '职务',
        table_items: [
          {
            name: '名称',
            data_index: 'name',
            search: true,
            type: 'string',
          },
        ],
        path: props.paths[2] || 'res/user/duties',
        ransackStr: '',
        polymorphicType: 'Duty',
        tagColor: 'rgba(245, 158, 11, 1)',
      },
      {
        key: 'org',
        label: '组织',
        table_items: [
          {
            name: '名称',
            data_index: 'name',
            search: true,
            type: 'string',
          },
        ],
        path: props.paths[3] || 'res/user/orgs',
        ransackStr: '',
        polymorphicType: 'Org',
        tagColor: '#9E0BF5',
      },
      {
        key: 'department',
        label: '部门',
        table_items: [
          {
            name: '名称',
            data_index: 'name',
            search: true,
            type: 'string',
          },
          {
            name: '部门关系',
            data_index: 'path_names',
            type: 'string',
            search: false,
          },
        ],
        path: props.paths[4] || 'res/user/departments',
        ransackStr: '',
        polymorphicType: 'Department',
        tagColor: '#0B62F5',
      },
      {
        key: 'user',
        label: '用户',
        table_items: [
          {
            name: '用户名',
            data_index: 'name',
            search: true,
            type: 'string',
          },
        ],
        path: props.paths[5] || 'res/user/users',
        ransackStr: '',
        polymorphicType: 'User',
        tagColor: '#867BF9',
      },
    ]);

    const localItem = computed(() => ({
      ...props.item,
      options: {
        ...props.item.options,
        nested_attributes_polymorphic_tabs: tabs.value,
      },
    }));

    const localValue = computed({
      get: () => props.value,
      set: val => {
        emit('update:value', val);
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
    };
  },
});
export default TaResPermitPolymorphicField;
</script>

<template lang="pug">
.ta-user-polymorphic-field
  TaNestedAttributesPolymorphicField(
    ref='selectorRef',
    v-bind='$props',
    v-model:value='localValue',
    :item='localItem',
    @ok='onOk',
  )
    template(#display='{ open }')
      slot(name='display', :open='open')

    template(#tags='{ records, actions }')
      slot(name='tags', :records='records', :actions='actions')
</template>

<style lang="stylus" scoped></style>
