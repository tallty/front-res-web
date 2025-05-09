<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';

const ComResMembershipCreator = defineComponent({
  name: 'ComResMembershipCreator',
  components: {},
  props: {
    store: { type: Object, default: () => ({}) },
    initFormData: { type: Object, default: () => ({}) },
    searchTemplate: { type: String, default: 'membership#search' },
    template: { type: String, default: 'membership#batch' },
  },
  setup(props, { emit }) {
    const activeCreateMode = ref<'search' | 'batch'>('search');

    const createTemplate = computed(() => {
      return activeCreateMode.value == 'search' ? props.searchTemplate : props.template;
    });

    const editRecord = ref();
    const visible = ref(false);
    const loading = ref(false);

    const onCreate = () => {
      editRecord.value = props.store.new({ ...props.initFormData });
      visible.value = true;
    };

    const modes = [
      { key: 'search', label: '搜索创建' },
      { key: 'batch', label: '批量添加' },
    ];

    const form = ref<any>(null);

    const onSubmit = () => {
      loading.value = true;
      form.value
        .submit({})
        .then(() => {
          visible.value = false;
          emit('fresh');
        })
        .finally(() => {
          loading.value = false;
        });
    };

    return {
      ...toRefs(props),
      activeCreateMode,
      createTemplate,
      editRecord,
      visible,
      onCreate,
      onSubmit,
      loading,
      form,
      modes,
    };
  },
});
export default ComResMembershipCreator;
</script>

<template lang="pug">
TaTextButton(icon='PlusCircleOutlined', @click='onCreate') 创建

TaNoPaddingModal(
  v-if='visible',
  v-model:visible='visible',
  style='width: 640px',
  okText='创建'
)
  template(#title)
    .flex.justify-between.items-center
      .text-base.font-semibold.text-gray-800 添加人员
      template(v-for="mode in modes")
        .flex.text-blue-500.items-center.cursor-pointer.mr-9(
          v-if="activeCreateMode != mode.key",
          @click='() => { activeCreateMode = mode.key }',
        )
          TaIcon.w-3.h-3.mr-2(type='solid/refresh')
          .text-sm.font-normal {{ mode.label }}
  TaTemplateForm(
    ref="form"
    :template='createTemplate',
    :record="editRecord"
    :useDefaultTheme="false"
  )
  template(#footer)
    a-button(@click='() => visible = false') 取消
    a-button(type='primary', :loading='loading', @click='onSubmit') 创建
</template>

<style lang="stylus" scoped></style>
