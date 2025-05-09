<script lang="ts">
import { defineComponent, toRefs, PropType, ref } from 'vue';
import ComPermitAdminUserRolesIndex from '@/engines/permit/components/global/ComPermitAdminUserRolesIndex.vue';
import { cloneDeep } from 'lodash';
import { message } from 'ant-design-vue';

const ComResUserPermission = defineComponent({
  name: 'ComResUserPermission',
  components: {
    ComPermitAdminUserRolesIndex,
  },
  props: {
    record: { type: Object, required: true },
  },
  setup(props) {
    const editable = ref(false);
    const loading = ref(false);

    const onUserSubmit = () => {
      props.record
        .update({
          users_roles_attributes: editRecord.value.users_roles_attributes,
        })
        .then(() => {
          editable.value = false;
          loading.value = false;
          message.success('修改成功');
        });
    };

    const onEditUser = () => {
      editable.value = true;
    };

    const editRecord = ref(cloneDeep(props.record));

    return {
      ...toRefs(props),
      editable,
      loading,
      onUserSubmit,
      onEditUser,
      editRecord,
    };
  },
});

export default ComResUserPermission;
</script>

<template lang="pug">
.com-res-user-permission
  .flex.justify-between.items-center.mb-4
    .flex.item-center
      .flex.lines.mr-1.items-center
        .line.bg-blue-200
        .line.h-4.bg-blue-700
        .line.bg-yellow-200
      .text-base.font-medium.text-gray-800 基本信息

    .flex.items-center(v-if='editable')
      a-button.save-button(type='text' @click='onUserSubmit()' :disabled='loading')
        .flex.items-center.text-blue-700
          TaIcon.w-4.h-4.mr-3(type='solid/check')
          .text-xs.font-medium 保存
      a-button.cancel-button(type='text' @click="() => (editable = false)")
        .flex.items-center.text-gray-900
          TaIcon.w-4.h-4.mr-3(type='solid/x')
          .text-xs.font-medium 取消
    a-button.edit-button(type='text' @click="onEditUser()" v-else)
      .flex.items-center.text-gray-900
        TaIcon.w-4.h-4.mr-3(type='solid/pencil-alt')
        .text-xs.font-medium 编辑
  ComPermitAdminUserRolesIndex(v-model:user='editRecord', :disabled='!editable')
</template>
