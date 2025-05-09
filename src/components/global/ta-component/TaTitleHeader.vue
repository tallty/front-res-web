<script lang="ts">
import { defineComponent } from 'vue';

const TaTitleHeader = defineComponent({
  name: 'TaTitleHeader',
  props: {
    title: { type: String, required: true },
  },
});
export default TaTitleHeader;
</script>

<template lang="pug">
.table-header
  .table-header__title-box
    slot(name='title')
      .table-header__title
        | {{ title }}
    slot(name='actions')
  .table-header__actions
    slot
</template>

<style lang="stylus" scoped>
.table-header
  display flex
  justify-content space-between
  align-items stretch
  height 48px
  .table-header__title-box
    align-self center
    flex-shrink 0
    display flex
    align-items center
    .table-header__title
      color #383838
      font-weight 500
      font-size 18px
      line-height 20px
  .table-header__actions
    display flex
    justify-content flex-end
    align-items center
    max-height 100%
    width 100%
    button
      margin-left 14px
</style>
