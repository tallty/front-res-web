<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { ResUserOrgsApi } from '@/res-core/apis/res/user/orgs.api';

const ComResOrgSearchComplete = defineComponent({
  name: 'ComResOrgSearchComplete',
  props: {
    value: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    searchQuery: { type: Object, default: () => ({}) },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const api = new ResUserOrgsApi();

    const selectOptions = ref([]);

    let delay: any;
    const handleSearch = (val: string) => {
      if (delay) {
        clearTimeout(delay);
        delay = 0;
      }
      if (val) {
        delay = setTimeout(() => {
          onSearch(val);
        }, 500);
      }
    };

    const onSearch = (val: string) => {
      api
        .sendCollectionAction('search', { params: { name: val, q: props.searchQuery } })
        .then(({ data }) => {
          selectOptions.value = data.records.map((record: any) => {
            return { value: record.id, label: record.name };
          });
        });
    };

    const validate = () => {
      return new Promise<void>((resolve, reject) => {
        if (!localValue.value.org_id) {
          reject(new Error('请选择要加入的企业'));
        } else {
          resolve();
        }
      });
    };

    const handleChange = (val: any) => {
      localValue.value.org_id = val;
    };
    return {
      localValue,
      handleSearch,
      validate,
      selectOptions,
      handleChange,
    };
  },
});

export default ComResOrgSearchComplete;
</script>
<template lang="pug">
.com-res-org-serach-complete
  .value(v-if='disabled') {{ localValue.org?.name }}
  a-select.form-input-item(
    v-else
    v-model:value='localValue.org_id',
    show-search
    :show-arrow="false",
    :filter-option="false",
    :not-found-content="null",
    placeholder='请输入企业全称',
    :options='selectOptions'
    @search='handleSearch',
    @change='handleChange'
  )
</template>

<stype></stype>
