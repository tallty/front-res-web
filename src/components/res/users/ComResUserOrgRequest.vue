<script lang="ts">
import { VStore } from '@/lib/vails';
import { defineComponent, toRefs, ref } from 'vue';
import { ResUserOrgRequestsApi } from '@/res-core/apis/res/user/org_requests.api';
import { ResOrgRequestModel } from '@/res-core/models/res/org_request';
import { message } from 'ant-design-vue';

const ComResUserOrgRequest = defineComponent({
  name: 'ComResUserOrgRequest',
  props: {
    orgMemberType: { type: String, required: true },
    memberType: { type: String, required: true },
  },
  setup(props, { emit }) {
    const store = new VStore(new ResUserOrgRequestsApi(), ResOrgRequestModel);

    const request = ref<any>({});
    const identityTemplate = ref({});

    store
      .sendCollectionAction({
        action: 'info',
        config: {
          params: {
            org_member_type: props.orgMemberType,
            member_type: props.memberType,
          },
        },
      })
      .then(({ data }) => {
        request.value = data;
        identityTemplate.value = data.org_member_identity.form;
      });

    const visible = ref(false);
    const record = ref({});

    const onCreate = () => {
      record.value = store.new({
        member_identity_id: request.value.member_identity_id,
        org_member_identity_id: request.value.org_member_identity_id,
        state: 'approving',
      });
      visible.value = true;
    };

    const onCancel = () => {
      visible.value = false;
    };

    const form = ref<any>(null);

    const onConfirm = () => {
      form.value.submit().then((res: any) => {
        message.success('成功');
        visible.value = false;
        emit('afterSave');
      });
    };

    return {
      ...toRefs,
      store,
      visible,
      onCreate,
      onCancel,
      onConfirm,
      form,
      record,
      identityTemplate,
    };
  },
});

export default ComResUserOrgRequest;
</script>

<template lang="pug">
.com-res-user-org-request
  a-button(@click='onCreate()') 去认证
  a-modal(
    v-model:visible='visible',
    title='认证',
    width='100%',
    wrap-class-name="full-modal",
    @close='onCancel()'
    @ok='onConfirm()'
  )
    .modal-main-content.overflow-y-scroll
      TaTemplateForm(
        ref='form',
        :template='identityTemplate',
        :record='record'
      )
</template>

<style lang="stylus" scoped>
.modal-main-content
  height: 100%
</style>
