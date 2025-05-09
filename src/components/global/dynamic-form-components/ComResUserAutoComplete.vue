<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { debounce } from 'lodash';
import { message, Modal } from 'ant-design-vue';
import { ResUserUsersApi } from '@/res-core/apis/res/user/users.api';

const ComResUserAutoComplete = defineComponent({
  name: 'ComResUserAutoComplete',
  props: {
    value: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const api = new ResUserUsersApi();

    const key = 'search';
    const loading = ref(false);

    const onSearch = () => {
      if (loading.value || !localValue.value.account) return;

      loading.value = true;
      const search = message.loading({ content: '正在搜索账号', key });
      api
        .sendCollectionAction('search', { params: { account: localValue.value.account } })
        .then(({ data }) => {
          loading.value = false;
          if (data.records[0]) {
            search();
            const { id, name, mobile, account } = data.records[0];
            Modal.info({
              title: `检测到账号：${name}`,
              content: `账号：${account}、姓名：${name}、手机号：${mobile}，是否添加此账号？`,
              okText: '确定',
              cancelText: '取消',
              onOk() {
                localValue.value.name = name;
                localValue.value.mobile = mobile;
                localValue.value.user_id = id;
              },
            });
          } else {
            localValue.value.user_id = 0;
            message.warning({ content: '未搜索到该账号，你可以手动创建', key });
          }
        });
    };

    const debounceInput: any = debounce(onSearch, 1000);

    const validate = () => {
      return new Promise<void>((resolve, reject) => {
        if (
          !localValue.value.id &&
          (!localValue.value.account || localValue.value.account.length === 0)
        ) {
          reject(new Error('请填写正确的账号'));
        } else {
          resolve();
        }
      });
    };

    return {
      localValue,
      onSearch,
      loading,
      validate,
      debounceInput,
    };
  },
});

export default ComResUserAutoComplete;
</script>
<template lang="pug">
.com-res-user-auto-complete
  .value(v-if='disabled || localValue.id') {{ localValue.account || localValue.user?.account }}
  a-input.form-input-item(
    v-else
    v-model:value='localValue.account',
    placeholder='请输入帐号（支持自动搜索）',
    @input='debounceInput',
    :loading='loading'
    :disabled='localValue.id'
  )
</template>

<stype></stype>
