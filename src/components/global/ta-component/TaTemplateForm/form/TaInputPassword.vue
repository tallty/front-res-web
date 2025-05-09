<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';

const TaInputPassword = defineComponent({
  name: 'TaInputPassword',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: [String, Array], default: '' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => (Array.isArray(props.value) ? props.value[0] : props.value),
      set: val => emit('update:value', Array.isArray(val) ? val[0] : val),
    });

    const visible = ref(false);

    return {
      ...toRefs(props),
      localValue,
      visible,
    };
  },
});
export default TaInputPassword;
</script>

<template lang="pug">
.ta-input-password
  template(v-if='!disabled')
    a-input-password(
      v-model:value='localValue',
      :placeholder='item.options?.placeholder || `请输入${item.name || ""}`',
    )
  template(v-else)
    .flex
      .value.mr-2 {{ visible ? localValue : '******' }}
      TaIcon.cursor-pointer(
        :type='visible ? "EyeOutlined" : "EyeInvisibleOutlined"',
        @click='() => visible = !visible'
      )

</template>

<style lang="stylus" scoped>
.value
  word-break break-all
</style>
