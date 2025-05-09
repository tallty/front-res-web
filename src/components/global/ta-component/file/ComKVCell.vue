<script lang="ts">
import { defineComponent, toRefs } from 'vue';

const ComKvCell = defineComponent({
  name: 'ComKvCell',
  props: {
    name: { type: String, default: '' },
    icon: { type: String, default: '' },
    value: { type: [String, Number], default: '' },
    to: { type: String, default: '' },
    size: { type: String, default: 'default' },
    nameWidth: { type: String, default: '' },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
export default ComKvCell;
</script>

<template lang="pug">
.kv-cell(:class='`size-${size}`')
  .key(:style='`width: ${nameWidth}`')
    TaIcon.icon(:type='icon', v-if='icon')
    slot(name='name')
      span {{ name }}
  .value
    slot
      span(v-if='value') {{ value }}
      a.link(:href='to', target='_blank', v-if='to')
        | {{ to }}
</template>

<style lang="stylus" scoped>
.kv-cell
  display flex
  margin 10px 0px
  font-size 14px
  line-height 22px
  font-weight 400
  align-items flex-start
  .key
    color rgba(128,128,128,1)
    width 96px
    flex-shrink 0
    padding-right 12px
    display flex
    align-items center
    .icon
      margin-right 4px
      font-size 16px
  .value
    color rgba(56,56,56,1)
    .link
      color rgba(56,56,56,1)
      &:hover
        color $primary-color

.size-small
  margin 6px 0
  .key
    width 68px
</style>
