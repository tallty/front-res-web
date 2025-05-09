<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import ComResUserMemberRequest from '@/components/res/users/ComResUserMemberRequest.vue';
import { TaTemplateFormStepsStep } from '@/components/global/ta-component/ta-template-form-core/types';

const ResUserAuthExpert = defineComponent({
  name: 'ResUserAuthExpert',
  components: {
    ComResUserMemberRequest,
  },
  props: {
    bpmPath: { type: String, default: '/bpm/user/instances' },
  },
  setup(props) {
    const previousSteps = computed<TaTemplateFormStepsStep[]>(() => []);

    const visible = ref(true);

    return {
      ...toRefs(props),
      previousSteps,
      visible,
    };
  },
});
export default ResUserAuthExpert;
</script>

<template lang="pug">
.info-auth-expert.w-full.h-full
  ComResUserMemberRequest(
    :previousSteps='previousSteps',
    memberType='ExpertMember',
    v-model:visible='visible',
    :bpmPath='bpmPath'
  )
</template>

<style lang="stylus" scoped></style>
