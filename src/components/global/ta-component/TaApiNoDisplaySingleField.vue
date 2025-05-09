<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import { TaSelectableFieldProps } from './TaTemplateForm/form/selectable/TaSelectableField.vue';

const TaApiNoDisplaySingleField = defineComponent({
  name: 'TaApiNoDisplaySingleField',
  components: {},
  props: {
    value: { type: Number, default: null },
    path: { type: String, default: '' },
    ransackStr: { type: String, default: '{}' },

    ...TaSelectableFieldProps,
  },
  setup(props, { emit }) {
    const localValue = computed<number[]>({
      get: () => [props.value],
      set: val => emit('update:value', val[0] || null),
    });

    const openComp = ref<any>(null);

    const onOk = () => emit('ok');
    const onCancel = () => emit('cancel');
    const open = () => openComp.value.open();

    return {
      ...toRefs(props),
      openComp,
      onOk,
      localValue,
      open,
      onCancel,
    };
  },
});
export default TaApiNoDisplaySingleField;
</script>

<template lang="pug">
.ta-api-no-display-single-field
  TaApiNoDisplayField(
    ref='openComp',
    v-bind='$props',
    v-model:value='localValue',
    @ok='onOk',
    @cancel='onCancel',
  )
    template(#modal-header)
      slot(name='modal-header')

    template(#right-actions)
      slot(name='right-actions')

    template(#modal-footer-left)
      slot(name='modal-footer-left')

    template(#card='{ record, index, no, isActive, actions }')
      slot(
        name='card',
        :record='record',
        :index='record',
        :no='no',
        :isActive='isActive',
        :actions='actions'
      )
</template>

<style lang="stylus" scoped></style>
