<script lang="ts">
import { ref, defineComponent, toRefs, PropType } from 'vue';
import { ResDutyGroup, ResDuty } from '@/res-core/model';

const ComDutyGroupCard = defineComponent({
  name: 'ComDutyGroupCard',
  components: {},
  props: {
    record: { type: Object as PropType<ResDutyGroup>, required: true },
  },
  emits: ['clickDuty'],
  setup(props, { emit }) {
    const opened = ref(false);

    const switchOpend = () => {
      opened.value = !opened.value;
    };

    const onClickDuty = (duty: ResDuty) => {
      emit('clickDuty', duty);
    };

    return {
      ...toRefs(props),
      opened,
      switchOpend,
      onClickDuty,
    };
  },
});
export default ComDutyGroupCard;
</script>

<template lang="pug">
.com-duty-group-card
  span(@click='switchOpend') {{ record.name }}
  .list(:class='{ "zero-height": !opened }')
    .duty(v-for='duty in record.duties', @click='onClickDuty(duty)')
      | {{ duty.name }}
</template>

<style lang="stylus" scoped>
.com-duty-group-card
  .list
    overflow hidden
    transition all 1s
  .zero-height
    height 0
</style>
