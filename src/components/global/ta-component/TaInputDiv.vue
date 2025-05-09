<script lang="ts">
import { ref, defineComponent, toRefs, computed, watch } from 'vue';

const TaInputDiv = defineComponent({
  name: 'TaInputDiv',
  components: {},
  props: {
    value: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '请输入' },
    style: { type: Object, default: () => ({}) },
  },
  setup(props, { emit }) {
    const isChanging = ref(false);

    const localValue = computed({
      get: () => props.value,
      set: val => {
        text.value = val;
        if (!isChanging.value) {
          emit('update:value', val);
        }
      },
    });

    const inputRef = ref<any>(null);
    const text = ref('');

    watch(
      () => props.value,
      () => {
        if (!isChanging.value) {
          text.value = props.value;
        }
      },
      {
        immediate: true,
      },
    );

    const onInput = (e: any) => {
      isChanging.value = true;
      localValue.value = e.target.innerText;
    };

    const onBlur = () => {
      isChanging.value = false;
      localValue.value = text.value;
      emit('confirm');
    };

    const onKeydownEnter = () => {
      inputRef.value.blur();
    };

    return {
      ...toRefs(props),
      localValue,
      onInput,
      onBlur,
      onKeydownEnter,
      inputRef,
      text,
    };
  },
});
export default TaInputDiv;
</script>

<template lang="pug">
.ta-input-div(
  ref='inputRef',
  :class='{ editable: !disabled }',
  :contenteditable='!disabled',
  v-html='localValue',
  :style='style',
  @input='onInput',
  @keydown.prevent.enter='onKeydownEnter',
  @blur='onBlur'
)

</template>

<style lang="stylus" scoped>
.ta-input-div
  overflow-y auto
  padding 6px 0
  width 100%
  height auto
  text-align left
  white-space pre-wrap
  min-height 1em

.editable
  &[contenteditable=true]
    user-modify read-write-plaintext-only
    &:empty:before
      display block
      color #ccc
      content '请输入'
</style>
