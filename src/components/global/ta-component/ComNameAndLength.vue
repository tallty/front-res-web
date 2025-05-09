<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue';
const ComNameAndLength = defineComponent({
  name: 'ComNameAndLength',
  components: {},
  props: {
    names: { type: Array, default: () => ['李四', '张三', '王五', '慕容芊芊'] },
  },
  setup(props) {
    const showNames = computed(() => {
      if (props.names.length > 3) {
        return props.names.slice(0, 3);
      }
      return props.names;
    });
    const arrToStr = computed(() => {
      return props.names.join('、');
    });
    return {
      ...toRefs(props),
      showNames,
      arrToStr,
    };
  },
});
export default ComNameAndLength;
</script>

<template lang="pug">
.name-and-length.flex.items-center
  a-tooltip
    template(#title)
      .tip {{ arrToStr }}
    .text.flex.items-center
      .left.flex
        .name(v-for='name in showNames') 
          TaAvatar.-ml-1(bgClass='bg-blue-100', :nameOfUser='name?.slice(-2)')
      .right(v-if='names.length > 3')
        span 等{{ names.length }}人/单位/组织参与
</template>

<style lang="stylus" scoped></style>
