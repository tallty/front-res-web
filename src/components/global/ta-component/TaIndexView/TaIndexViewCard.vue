<script lang="ts">
import { ref, defineComponent, toRefs, computed, watch } from 'vue';
import { cloneDeep, merge } from 'lodash';
import { VStore } from '../../../../lib/vails/store/index';

const TaIndexViewCard = defineComponent({
  name: 'TaIndexViewCard',
  components: {},
  props: {
    store: { type: Object, default: () => ({}) },
    template: { type: Object, default: () => ({}) },
    record: { type: Object, default: () => ({}) },
    mode: { type: String, default: 'list' },
    depth: { type: Number, default: 0 },
    groupedQuery: { type: Object, default: () => ({}) },
  },
  setup(props) {
    const innerStore = new VStore(props.store.api, props.store.model);
    const config = computed(() => ({
      store: innerStore,
      template: props.template,
      mode: props.mode,
      pagination: {
        hideOnSinglePage: true,
      },
      params: merge(
        {},
        { q: props.store.query.value },
        { sub_q: props.store.subQuery.value },
        props.store.params.value,
        { q: childrenGroupedQuery.value },
      ),
    }));

    const childrenGroupedQuery = computed(() => {
      return merge({}, props.groupedQuery, {
        [props.record.ransack_key]: props.record.ransack_value,
      });
    });

    return {
      ...toRefs(props),
      config,
      innerStore,
      collasped: ref(true),
      childrenGroupedQuery,
    };
  },
});
export default TaIndexViewCard;
</script>

<template lang="pug">
.ta-index-view-card.pt-4(@click.stop='')
  .ta-index-view-card__header.flex.items-center.text-gray-900.cursor-pointer(
    @click='collasped = !collasped',
  )
    .arrow.flex.items-center.justify-center.transition-all.transform(
      :class='{ "rotate-90": !collasped }'
    )
      TaIcon.h-6.w-6(type='solid/chevron-right')
    .ta-index-view-card__header-card
      slot(
        name='ta-index-view-card-header',
        :record='record',
        :store='innerStore',
        :depth='depth'
      )
        .flex.items-center.space-x-2
          .text-gray-400 {{ record.ransack_value == true ? '空值' : record.ransack_value }}
          .text-gray-400 总数 {{ record.count }}
  div(
    v-if='!collasped',
  )
    TaIndexViewCard.px-4.py-2.border.border-gray-200(
      v-if='record.children?.length > 0',
      v-for='child in record.children'
      :store='store',
      :record='child',
      :depth='depth + 1',
      :template='template',
      :groupedQuery='childrenGroupedQuery'
    )
      template(#card='{ record, index, no, isActive, actions, memberActions }')
        slot(
          name='card',
          :index='index',
          :no='no',
          :isActive='isActive',
          :actions='actions',
          :memberActions='memberActions',
          :record='record'
        )
      template(#table)
        slot(name='table')

      template(#bodyCell='{ record, text, column }')
        slot(
          name='bodyCell',
          :record='record',
          :text='text',
          :column='column',
        )
      template(#ta-index-view-card-header='{ record, store, depth }')
        slot(
          name='ta-index-view-card-header',
          :record='record',
          :store='activeStore',
          :depth='depth',
        )

    TaIndexView(
      v-else,
      :config='config',
    )
      template(#header)
        .empty
      template(#card='{ record, index, no, isActive, actions, memberActions }')
        slot(
          name='card',
          :index='index',
          :no='no',
          :isActive='isActive',
          :actions='actions',
          :memberActions='memberActions',
          :record='record'
        )
      template(#table)
        slot(name='table')

      template(#bodyCell='{ record, text, column }')
        slot(
          name='bodyCell',
          :record='record',
          :text='text',
          :column='column',
        )

</template>

<style lang="stylus" scoped>
.ta-index-view-card
  >>> .list-view__pagination
    margin-bottom 0 !important
  >>> .ant-spin-nested-loading
    height auto !important
</style>
