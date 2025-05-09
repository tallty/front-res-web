<script lang="ts">
import { ref, defineComponent, toRefs, watch } from 'vue';

const TaFormSettingModelSettingConf = defineComponent({
  name: 'TaFormSettingModelSettingConf',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
  },
  setup(props) {
    const loading = ref(false);
    const timer = ref<any>(null);
    watch(
      () => props.value.model_setting_identity,
      () => {
        loading.value = true;
        if (timer.value) clearTimeout(timer.value);
        timer.value = setTimeout(() => {
          loading.value = false;
        }, 1000);
      },
    );

    return {
      ...toRefs(props),
      loading,
    };
  },
});
export default TaFormSettingModelSettingConf;
</script>

<template lang="pug">
.ta-form-setting-model-setting-conf.h-full.w-full
  .w-full.h-full.flex.items-center.justify-center(v-if='loading')
    a-spin(:spinning='true')
  .w-full.flex.justify-center.w-full.h-full.overflow-y-auto(v-else)
    TaTemplateFormViewer(
      :template='value.model_setting_identity',
      :registerSubForm='false',
      :modelValue='{}',
      class='max-w-7/10'
    )
</template>

<style lang="stylus" scoped></style>
