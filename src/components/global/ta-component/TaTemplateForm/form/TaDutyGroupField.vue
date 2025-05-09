<script lang="ts">
import { defineComponent, toRefs, PropType, computed, onMounted, ref } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { ResDutyGroup } from '@/res-core/model';
import { ResAdminDutyGroupsApi } from '@/res-core/apis/res/admin/duty_groups.api';
import { VStore } from '@/lib/vails';

const TaDutyGroupField = defineComponent({
  name: 'TaDutyGroupField',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: [String, Number, Object] as PropType<any>, required: true },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const options = ref(props.item.options?.select || []);

    const dutyGroupStore = new VStore<ResDutyGroup>(new ResAdminDutyGroupsApi());

    onMounted(() => {
      dutyGroupStore.index().then(() => {
        options.value = dutyGroupStore.records.value.map((dutyGroup: ResDutyGroup) => ({
          label: dutyGroup.name,
          value: dutyGroup.id,
        }));
      });
    });

    return {
      ...toRefs(props),
      localValue,
      options,
    };
  },
});
export default TaDutyGroupField;
</script>

<template lang="pug">
.ta-duty-group-field
  TaSelect(:item='item', v-model:value='localValue', :disabled='disabled', :options='options')
</template>

<style lang="stylus" scoped></style>
