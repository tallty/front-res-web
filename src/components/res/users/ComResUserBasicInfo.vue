<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue';
import ComResUserOrgDuties from './ComResUserOrgDuties.vue';
import ComResUserOrgTags from './ComResUserOrgTags.vue';

const ComResUserBasicInfo = defineComponent({
  name: 'ComResUserBasicInfo',
  components: {
    ComResUserOrgDuties,
    ComResUserOrgTags,
  },
  props: {
    record: { type: Object, required: true },
    store: { type: Object, required: true },
    membershipStore: { type: Object, required: true },
    tagRelationStore: { type: Object, required: true },
    org: { type: Object, required: false, default: () => ({}) },
    onlyShow: { type: Boolean, default: () => false },
  },
  setup(props, { emit }) {
    const editable = ref({
      basic: false,
    });

    const loading = ref({
      basic: false,
    });

    const userEditRecord = ref(Object.assign({}, props.record));
    const onEditUser = () => {
      props.store.find(props.record?.id).then((res: any) => {
        const data = res.data;
        data.org_id = props.org?.id;
        userEditRecord.value = props.store.new(data);
        editable.value.basic = true;
      });
    };

    const userForm = ref<any>(null);
    const onUserSubmit = () => {
      loading.value.basic = true;
      userForm.value.submit({
        success: (data: any) => {
          loading.value.basic = false;
          editable.value.basic = false;
          emit('userSaved');
        },
        fail: () => {
          loading.value.basic = false;
        },
      });
    };

    return {
      ...toRefs(props),
      editable,
      userEditRecord,
      onEditUser,
      userForm,
      onUserSubmit,
      loading,
    };
  },
});

export default ComResUserBasicInfo;
</script>

<template lang="pug">
.com-res-user-basic-info
  .flex.justify-between.items-center.mb-4
    .flex.item-center
      .flex.lines.mr-1.items-center
        .line.bg-blue-200
        .line.h-4.bg-blue-700
        .line.bg-yellow-200
      .text-base.font-medium.text-gray-800 基本信息

    .flex.items-center(v-if='!onlyShow && editable.basic')
      a-button.save-button(type='text', @click='onUserSubmit()', :disabled='loading.basic')
        .flex.items-center.text-blue-700
          TaIcon.w-4.h-4.mr-3(type='solid/check')
          .text-xs.font-medium 保存
      a-button.cancel-button(type='text', @click='() => (editable.basic = false)')
        .flex.items-center.text-gray-900
          TaIcon.w-4.h-4.mr-3(type='solid/x')
          .text-xs.font-medium 取消
    a-button.edit-button(type='text', @click='onEditUser()', v-else-if='!onlyShow')
      .flex.items-center.text-gray-900
        TaIcon.w-4.h-4.mr-3(type='solid/pencil-alt')
        .text-xs.font-medium 编辑

  .text(style='min-height: 289px')
    TaTemplateForm(
      v-if='editable.basic',
      ref='userForm',
      template='user#res_model',
      :record='userEditRecord'
    )
    TaTemplateFormViewer(template='user#res_model', :record='record', v-else)

  .mb-10
    ComResUserOrgTags(
      v-if='record.id',
      :store='tagRelationStore',
      :user='record',
      :org='org',
      :onlyShow='onlyShow'
    )

  .mb-10
    ComResUserOrgDuties(
      v-if='record.id'
      v-bind='$attrs',
      :store='membershipStore',
      :user='record',
      :org='org',
      :onlyShow='onlyShow',
    )
</template>

<style lang="stylus" scoped>
.com-res-user-basic-info
  .lines
    .bg-blue-200
      height 10px
      margin-top 4px
    .bg-yellow-200
      height 10px
      margin-top 2px
    .line
      width 2px
      margin-right 2px
  .save-button
    margin-right 8px
  >>>.ta-template-form-theme-card .ta-template-form-theme-card__card__shell
    display none
</style>
