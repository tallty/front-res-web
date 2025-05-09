<script lang="ts">
import { computed, ComputedRef, defineComponent, PropType, ref, toRefs, nextTick, onMounted, watch, onUnmounted } from 'vue';
import emptyImage from '@/assets/images/empty.png';
import { VModel, VStore } from '@/lib/vails';
import draggable from 'vuedraggable';
import { VObject } from '@/lib/vails/model';
import { TaIndexViewListConfigInterface, TaIndexViewPaginationConfigInterface } from './types';
import { TaIndexViewAction } from './ta-index-view-core/types';
import useScrollLoading from './ta-index-view-core/useScrollLoading';
import { cloneDeep } from 'lodash';

const infiniteScroll = require('@/components/global/ta-component/directives/infiniteScroll.js');

const TaIndexList = defineComponent({
  name: 'TaIndexList',
  components: {
    draggable,
  },
  directives: { infiniteScroll: infiniteScroll.default },
  emits: ['change', 'update:loading', 'draggle'],
  props: {
    data: { type: Array as PropType<(VObject | VModel)[]>, default: undefined },
    store: { type: Object as PropType<VStore>, required: true },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: '暂无数据' },
    finishedText: { type: String, default: '没有更多了' },
    config: {
      type: Object as PropType<TaIndexViewListConfigInterface>,
      default: () => ({} as TaIndexViewListConfigInterface),
    },
    paginationConfig: {
      type: Object as PropType<TaIndexViewPaginationConfigInterface>,
      default: () => ({} as TaIndexViewPaginationConfigInterface),
    },
    memberActions: {
      type: Array as PropType<TaIndexViewAction[]>,
      default: () => [] as TaIndexViewAction[],
    },
    scrollLoading: { type: Boolean, default: false },
    // pagination
    paginationSize: { type: String as PropType<'middle' | 'small' | 'large'>, default: 'middle' },
    // draggable
    draggable: { type: Boolean, default: false },
    rowKey: { type: String, default: 'id' },
  },
  setup(props, { emit }) {
    const records: ComputedRef<(VObject | VModel)[]> = computed(
      () => props.data || props.store?.records?.value || [],
    );

    const localLoading = computed({
      get: () => props.store.loading.value,
      set: (val: boolean) => emit('update:loading', val),
    });

    const splitCount = computed(() => props.config.splitCount || 1);

    let cacheTotalCount = -1;
    const pagination = computed(() => {
      let cache = props.store.totalCount.value;
      nextTick(() => {
        cacheTotalCount = cache;
      });
      return props.paginationConfig.hide
        ? false
        : {
          total:
            props.store.totalCount.value < 0
              ? cacheTotalCount < 0
                ? 0
                : cacheTotalCount
              : props.store.totalCount.value,
          pageSize: props.store.perPage.value,
          current: props.store.currentPage.value,
          hideOnSinglePage: props.paginationConfig.hideOnSinglePage,
          showSizeChanger: props.paginationConfig.showSizeChanger === false ? false : true,
          showQuickJumper: props.store.totalPages.value > 1,
          size: props.paginationSize,
          showTotal: props.paginationConfig.showTotal || ((total: number) => `共 ${total} 条`),
        };
    });

    const scrollLoadingDisable = computed(() => {
      return props.store.loading.value;
    });

    const onPaginationChange = (page: number, pageSize: number): void => {
      emit('change', page, {}, pageSize, props.scrollLoading);
    };

    const recordsDup = ref<VObject[]>([]);

    const startDrag = () => {
      recordsDup.value = cloneDeep(records.value);
    };

    const endDrag = (event: any) => {
      const { newIndex, oldIndex } = event;
      emit(
        'draggle',
        recordsDup.value[oldIndex],
        recordsDup.value[newIndex]?.reactiveRecord.position,
      );
    };

    const { finished, loadMore } = useScrollLoading(props, emit);

    const gridTemplateColumns = computed(
      () =>
        // repeat(2, calc((100% - 24px) / 2))
        `repeat(${splitCount.value}, calc((100% - ${(splitCount.value - 1) * (props.config.gap || 0)
        }px) / ${splitCount.value}))`,
    );

    const gridGap = computed(() =>
      props.config.gap
        ? `${typeof props.config.gapColumn === 'number' ? props.config.gapColumn : props.config.gap
        }px ${props.config.gap}px`
        : '',
    );


    /**
     * 使用范围：props.scrollLoading:true
     * 处理外部使用grid-template-columns repeat(auto-fill, minmax())自适应布局时，横向拉动浏览器不触发加载的问题
     * 该方法仅做了简单判断，如有更好方式可以直接替换
     */
    const gridTemplateColumnsCount = ref(1)
    const scrollListRef = ref<any>(null)
    const resizeHandler = () => {
      const groupEl = scrollListRef.value?.children?.[0]
      groupEl && (gridTemplateColumnsCount.value = getComputedStyle(groupEl).gridTemplateColumns.split(' ').length)
    }
    onMounted(() => {
      if (props.scrollLoading) {
        window.addEventListener('resize', resizeHandler)
      }
    })
    onUnmounted(() => {
      if (props.scrollLoading) {
        window.removeEventListener('resize', resizeHandler)
      }
    })

    watch(() => gridTemplateColumnsCount.value, (newValue: number, oldValue: number) => {
      if (newValue > oldValue) {
        loadMore()
      }
    })


    return {
      ...toRefs(props),
      records,
      localLoading,
      finished,
      loadMore,
      emptyImage,
      pagination,
      scrollLoadingDisable,
      onPaginationChange,
      startDrag,
      endDrag,
      splitCount,
      gridTemplateColumns,
      gridGap,
      scrollListRef,
    };
  },
});

export default TaIndexList;
</script>

<template lang="pug">
.ta-index-list.flex-col.flex
  .scroll-list.flex-grow(
    v-if='scrollLoading',
    ref='scrollListRef'
    :class='{ "h-0": config.scroll?.y === "auto" }',
    v-infinite-scroll='loadMore',
    infinite-scroll-disabled='scrollLoadingDisable',
    infinite-scroll-distance='10'
  )
    slot(name='empty', v-if='records.length === 0 && !localLoading')
      TaEmpty(:desc='emptyText',:emptyKey="config.emptyKey")
    draggable.group.grid(
      v-else,
      :list='records',
      :item-key='rowKey',
      :disabled='!draggable',
      @end='endDrag',
    )
      template(#item='{ element, index }')
        .item(:key='element[rowKey]')
          slot(:record='element', :index="index")
    .spin(v-if='localLoading')
      a-spin(size='small')
    .finished.text-center.pt-2.pb-4(v-if='finished && store.totalCount.value > store.perPage.value') {{ finishedText }}
  .pagination-list.flex-grow.flex.flex-col(v-else, :class='{ "pagination-list-flex-grow": config.scroll?.y === "auto" }')
    a-spin(:spinning='localLoading')
      slot(name='empty', v-if='records.length === 0 && !localLoading')
        TaEmpty(:desc='emptyText',:emptyKey="config.emptyKey")
      .group(
        v-else,
        :style='{ height: config.scroll?.y !== "auto" && config.scroll?.y }'
      )
        draggable.draggable.grid(
          :item-key='rowKey',
          :list='records',
          :disabled='!draggable',
          @start='startDrag',
          @end='endDrag',
        )
          template(#item='{ element, index }')
            .item(:key='element[rowKey]')
              slot(:record='element', :memberActions='memberActions', :index="index")
    .list-view__pagination(v-if='store.totalCount.value !== 0 && pagination')
      a-pagination(
        v-bind='pagination',
        @showSizeChange='onPaginationChange',
        @change='onPaginationChange'
      )
    .list-view__pagination_placeholder(v-else)
</template>

<style lang="stylus" scoped>
.ta-index-list
  width 100%
  // min-height 100px
  height 100%
  .grid
    display grid
    grid-template-columns v-bind(gridTemplateColumns)
    grid-gap v-bind(gridGap)
    // grid-auto-flow column dense
    grid-auto-columns -webkit-min-content
    grid-auto-columns min-content
  .scroll-list
    overflow-y auto
    height 100%
    .spin
      display flex
      justify-content center
      padding-top 5px
      height 50px
  .pagination-list
    .group
      overflow-y auto
      // .draggable
      // width 100%
      // flex-grow 1
      // display flex
      // flex-wrap wrap
    .list-view__pagination
      margin 12px 12px 24px 0
      text-align right
    .list-view__pagination_placeholder
      height 44px
  .pagination-list-flex-grow
    height 0
    >>> .ant-spin-nested-loading
      flex-grow 1
      height 0
    >>> .ant-spin-container
      height 100%
    .group
      height 100%
  .item
    width 100%
    height fit-content
</style>
