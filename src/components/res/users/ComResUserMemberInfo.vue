<script lang="ts">
import { defineComponent, toRefs, ref, computed } from 'vue';

const ComResUserMemberInfo = defineComponent({
  name: 'ComResUserMemberInfo',
  props: {
    store: { type: Object, required: true },
    record: { type: Object, required: true },
  },
  emits: ['afterSave'],
  setup(props, { emit }) {
    const editable = ref(false);
    const loading = ref(false);
    const editRecord = ref({});
    const onEdit = () => {
      props.store.find(props.record?.id).then((res: any) => {
        editRecord.value = props.store.new(res.data);
        editable.value = true;
      });
    };

    const formRef = ref<any>(null);
    const onFormSubmit = () => {
      loading.value = true;
      formRef.value.submit({
        success: () => {
          loading.value = false;
          editable.value = false;
          emit('afterSave');
        },
        fail: () => {
          loading.value = false;
        },
      });
    };

    const template = computed(() => props.record.form);

    return {
      ...toRefs(props),
      editable,
      loading,
      editRecord,
      formRef,
      onFormSubmit,
      onEdit,
      template,
    };
  },
});

export default ComResUserMemberInfo;
</script>

<template lang="pug">
.com-res-user-member-info
  .flex.justify-between.items-center.mb-4
    .flex.item-center
      .flex.lines.mr-1.items-center
        .line.bg-blue-200
        .line.h-4.bg-blue-700
        .line.bg-yellow-200
      .text-base.font-medium.text-gray-800 {{ record.member_identity_name }}

    .flex.items-center(v-if='editable')
      a-button.save-button(type='text' @click='onFormSubmit()' :disabled='loading')
        .flex.items-center.text-blue-700
          TaIcon.w-4.h-4.mr-3(type='solid/check')
          .text-xs.font-medium 保存
      a-button.cancel-button(type='text' @click="() => (editable = false)")
        .flex.items-center.text-gray-900
          TaIcon.w-4.h-4.mr-3(type='solid/x')
          .text-xs.font-medium 取消
    a-button.edit-button(type='text' @click="onEdit()" v-else)
      .flex.items-center.text-gray-900
        TaIcon.w-4.h-4.mr-3(type='solid/pencil-alt')
        .text-xs.font-medium 编辑

  TaTemplateForm(ref="formRef" :template='template', :record='editRecord', v-if='editable')
  TaTemplateFormViewer(:template='template', :record='record',  v-else)
</template>

<style lang="stylus" scoped>
.com-res-user-member-info
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
