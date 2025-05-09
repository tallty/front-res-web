<script lang="ts">
import { ref, defineComponent, toRefs, onMounted, computed, watch, nextTick } from 'vue';
import { isEqual } from 'lodash';

const TaEvaluateField = defineComponent({
  name: 'TaEvaluateField',
  components: {},
  props: {
    value: { type: Number, required: true, default: 0 },
    disabled: { type: Boolean, default: false },
    icon: { type: String, default: 'StarFilled' },
    step: { type: Number, default: 1 },
    length: { type: Number, default: 5 },
    color: { type: String, default: 'rgb(251, 191, 36)' },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const insideValue = ref(localValue.value || 0);

    watch(
      localValue,
      (newValue: number, oldValue?: number) => {
        if (!isEqual(newValue, oldValue)) {
          nextTick(() => {
            insideValue.value = localValue.value;
          });
        }
      },
      {
        immediate: true,
      },
    );

    const container = ref<any>(null);
    const widthContainer = ref<any>(null);

    const trigger = ref(false);

    onMounted(() => {
      container.value.addEventListener('mousemove', onMouseMove);
      container.value.addEventListener('mouseout', () => {
        insideValue.value = localValue.value;
      });
      setTimeout(() => {
        trigger.value = !trigger.value;
      });
    });

    const unitWidth = computed(() => {
      trigger.value;
      return (
        ((widthContainer.value?.clientWidth || 0) - (props.length - 1) * 10) /
        (props.length / props.step)
      );
    });

    const computedWidth = computed(() => {
      if (!insideValue.value) return 0;
      const spaceCount = Math.ceil(insideValue.value / props.step / (1 / props.step)) - 1;
      return unitWidth.value * (insideValue.value / props.step) + spaceCount * 10;
    });

    const onMouseMove = (evt: any) => {
      if (!props.disabled) {
        let offset = evt.layerX - container.value?.offsetLeft;

        let index = 0;
        let value = 0;
        while (true) {
          if (offset < 0) break;
          value += props.step;

          if (index % (1 / props.step) == 0 && index != 0) {
            offset -= 10;
          }

          index += 1;
          offset -= unitWidth.value;
        }

        insideValue.value = value;
      }
    };

    const onClick = () => {
      localValue.value = insideValue.value;
    };

    return {
      ...toRefs(props),
      container,
      widthContainer,
      computedWidth,
      onClick,
      insideValue,
    };
  },
});
export default TaEvaluateField;
</script>

<template lang="pug">
.ta-evaluate-field.flex.items-center.overflow-hidden.cursor-pointer(@click='onClick')
  .shell.relative(ref='container')
    .bg-white.space-x-10px.h-full.flex.items-center(ref='widthContainer')
      TaIcon.evaluate-icon.h-full(v-for='i in Math.ceil(length)', :type='icon', class='!text-gray-300 !text-lg')
    .h-full.overflow-hidden.absolute.top-0.left-0(
      :style='{ width: `${computedWidth}px` }'
    )
      .active-block.absolute.top-0.left-0.h-full.w-full(:style='{ "background-color": color }')
      .bg-white.active.space-x-10px.h-full.flex.items-center
        TaIcon.evaluate-icon.h-full(v-for='i in Math.ceil(length)', :type='icon', class='!text-lg')
  .number-value.ml-4
    | {{ insideValue }} 分
</template>

<style lang="stylus" scoped>
.active
  mix-blend-mode screen
</style>
