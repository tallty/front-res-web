<script lang="ts">
import { ref, defineComponent, toRefs, computed, PropType } from 'vue';
import { DataForm } from '../ta-template-form-core/data_form/data_form';
import { DataFormInterface } from '../ta-template-form-core/data_form/types';

const TaDataFormViewer = defineComponent({
  name: 'TaDataFormViewer',
  components: {},
  props: {
    dataForm: { type: Object as PropType<DataForm | DataFormInterface>, required: true },
    context: { type: Object, default: () => ({}) },
  },
  setup(props) {
    const localDataForm = computed(() => {
      if (props.dataForm.constructor === DataForm) {
        return props.dataForm as DataForm;
      }
      return new DataForm(props.dataForm as DataFormInterface);
    });

    const visible = ref(!localDataForm.value.isOldData);
    const dataformableComponent = computed(() => {
      return localDataForm.value.value.record_type
        ? `${localDataForm.value.value.record_type?.replace('::', '')}Dataformable`
        : '';
    });

    return {
      ...toRefs(props),
      localDataForm,
      visible,
      dataformableComponent,
    };
  },
});
export default TaDataFormViewer;
</script>

<template lang="pug">
.ta-data-form-viewer
  template(v-if='visible && dataformableComponent')
    component(
      :is='dataformableComponent',
      :dataForm='localDataForm',
    )
  template(v-if='!showCustomStatisticsComponent && localDataForm.customCompleteComponent')
    component(
      :is='localDataForm.customCompleteComponent',
      :modelValue='localDataForm.payload',
      :disabled='true',
    )
  TaTemplateFormViewer.w-full.h-full(
    v-else-if='visible && localDataForm.payload'
    v-bind='$props',
    :template='localDataForm.form',
    :modelValue='localDataForm.payload'
    :context='context',
    @click='() => localDataForm.isOldData ? (visible = false) : null'
  )
  .text-gray-600.bg-gray-100.w-full.cursor-pointer.py-2.px-4.rounded.my-2(
    v-else-if='localDataForm.payload',
    @click='() => visible = true'
  )
    | 历史数据已折叠
</template>

<style lang="stylus" scoped></style>
