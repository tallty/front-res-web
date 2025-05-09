<script lang="ts">
import { ref, defineComponent, toRefs, computed, onMounted } from 'vue';

const TaActionEditor = defineComponent({
  name: 'TaActionEditor',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    showFirstPipeline: { type: Boolean, default: true },
    showTrigger: { type: Boolean, default: true },
    dataFormOptions: { type: Array, default: () => [] },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    onMounted(() => {
      if (!localValue.value.pipeline) {
        localValue.value.pipeline = {};
      }

      if (!localValue.value.condition) {
        localValue.value.condition = {};
      }

      if (!localValue.value.trigger) {
        localValue.value.trigger = {};
      }
    });

    const onDelete = () => {
      emit('delete');
    };

    const pipelineEditor = ref<any>(null);
    const activeDataFormOption = computed(() => pipelineEditor.value?.activeDataFormOption);

    return {
      ...toRefs(props),
      localValue,
      onDelete,
      pipelineEditor,
      activeDataFormOption,
    };
  },
});
export default TaActionEditor;
</script>

<template lang="pug">
.ta-action-editor.flex(v-if='localValue.pipeline')
  .pipeline
    TaPipelineEditor(
      ref='pipelineEditor',
      v-if='showFirstPipeline',
      v-model:value='localValue.pipeline',
      :disabled='disabled'
      :dataFormOptions='dataFormOptions'
      @delete='onDelete'
    )
  .condition(v-if='value.pipeline?.type || !showFirstPipeline')
    TaConditionEditor(
      v-model:value='localValue.condition',
      :disabled='disabled',
      :dataFormOptions='dataFormOptions',
      :activeDataFormOption='activeDataFormOption'
    )
      template(#condition-group)
        slot(name='condition-group')
  .trigger(v-if='showTrigger && localValue.condition?.type && !(localValue.condition?.type == "group" && $slots["condition-group"])')
    TaTriggerEditor(
      v-model:value='localValue.trigger',
      :disabled='disabled'
      :dataFormOptions='dataFormOptions'
    )
</template>

<style lang="stylus" scoped></style>
