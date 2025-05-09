<script lang="ts">
import { defineComponent, toRefs, computed, PropType, ref, onMounted, nextTick } from 'vue';
import { TaTemplateFormWithActionsProps } from './TaTemplateFormWithActionsProps';

// NOTE: 新增页面不再使用这个组件
const TaTemplateFormDialog = defineComponent({
  name: 'TaTemplateFormDialog',
  components: {},
  props: {
    visible: { type: Boolean, default: false },
    showFormNo: { type: Boolean, default: false },
    ...TaTemplateFormWithActionsProps,
  },
  emits: ['update:visible', 'success', 'fail'],
  setup(props, { emit }) {
    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });

    const onSuccess = () => {
      emit('success');
    };

    const onFail = () => {
      emit('fail');
    };

    const onClose = () => {
      localVisible.value = false;
    };

    const form = ref<any>(null);

    const bodyStyle = computed(() => ({
      backgroundColor: form.value?.backgroundColor,
    }));

    onMounted(() => {
      nextTick(() => {
        // 更改模态框定位
        if (
          form.value &&
          form.value.$el.parentElement &&
          form.value.$el.parentElement.parentElement &&
          form.value.$el.parentElement.parentElement.parentElement
        ) {
          form.value.$el.parentElement.parentElement.parentElement.style.top = '20px';
        }
      });
    });

    return {
      ...toRefs(props),
      localVisible,
      form,
      onSuccess,
      onFail,
      onClose,
      bodyStyle,
    };
  },
});
export default TaTemplateFormDialog;
</script>

<template lang="pug">
a-modal.ta-template-form-dialog(
  v-if='localVisible',
  v-model:visible='localVisible',
  :title='title',
  :bodyStyle='bodyStyle',
  width='800px'
  :footer='null'
)
  TaTemplateFormWithActions.form(
    ref='form',
    v-bind='$props',
    @fail='onFail',
    @success='onSuccess',
    @close='onClose',
    :showFormNo='showFormNo'
  )
</template>

<style lang="stylus" scoped>
.form
  >>> .ta-template-form-with-actions__form
    overflow-y auto
    height calc(100vh - 95px - 20px - 68px - 48px)
</style>
