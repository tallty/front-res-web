<script lang="ts">
import { ref, defineComponent, toRefs, PropType } from 'vue';
import { TaIndexViewAction } from './ta-index-view-core/types';
import { VObject } from '@/lib/vails/model';
import { VStore } from '@/lib/vails';

const TaIndexTableActionColumn = defineComponent({
  name: 'TaIndexTableActionColumn',
  components: {},
  props: {
    memberActions: {
      type: Array as PropType<TaIndexViewAction[]>,
      default: () => [] as TaIndexViewAction[],
    },
    store: { type: Object as PropType<VStore<VObject>>, required: true },
    record: { type: Object as PropType<VObject>, required: true },
    showLabel: { type: Boolean, default: false },
  },
  setup(props) {
    const visibleMoreActions = ref(false);

    return {
      ...toRefs(props),
      visibleMoreActions,
    };
  },
});
export default TaIndexTableActionColumn;
</script>

<template lang="pug">
.ta-index-table-action-column
  component(
    :is='showLabel ? "TaPolicyResource" : "TaPolicyResources"'
    v-for='action in memberActions.filter(i => !i.collapsed)'
    :actionKey='action.key',
    :store='store',
    :alwaysEnabled='!["update", "delete"].includes(action.key)'
  )
    TaPopoverConfirm(
      v-if='action.confirm',
      :title='action.label'
      :content='action.options?.confirmText || `确认${action.label}吗`'
      @confirm='action.callback(record)'
    )
      ComIconText(v-if='showLabel',
        :icon='action.icon',
        :text='action.label'
        fontWeight='rgb(61, 168, 245)',
        color='rgb(61, 168, 245)',
      )
      TaIcon.icon(v-else, @click.stop='' :type='action.icon')
    template(v-else)
      ComIconText(
        v-if='showLabel',
        :icon='action.icon',
        :text='action.label'
        fontWeight='rgb(61, 168, 245)',
        color='rgb(61, 168, 245)',
        @click='action.callback(record)',
      )
      TaIcon.icon(v-else, :type='action.icon' @click.stop='action.callback(record)')
  a-popover(
    v-if='memberActions.filter(i => i.collapsed).length > 0',
    v-model='visibleMoreActions',
    placement='bottomRight'
  )
    TaIconTooltip.icon(icon='EllipsisOutlined',)
    template(#title)
      .popover-title 更多操作
    template(#content, style='margin: -14px 0px')
      component(
        :is='showLabel ? "TaPolicyResource" : "TaPolicyResources"'
        v-for='action in memberActions.filter(i => i.collapsed)'
        :actionKey='action.key',
        :store='store',
        :alwaysEnabled='!["update", "delete"].includes(action.key)'
      )
        .popover-item(@click='action.callback(record)')
          TaIcon(:type='action.icon')
          span(style='margin-left: 12px') {{ action.label }}
</template>

<style lang="stylus" scoped>
.ta-index-table-action-column
  display flex
  flex-wrap nowrap
.popover-title
  padding 6px 0
  text-align center
.popover-item
  justify-content flex-start
  cursor pointer
.icon
  margin-left 10px
</style>
