<script lang="ts">
import { debounce } from 'lodash';
import { computed, defineComponent, onMounted, PropType, ref, Ref, watch } from 'vue';

const TaSearcher = defineComponent({
  name: 'TaSearcher',
  props: {
    // v-model: queryObject，ransack 搜索的 q 对象
    value: { type: [Array, Object], default: () => ({}) },
    // 搜索字段，例如：['name', 'desc']
    variables: { type: Array, default: () => [] },
    // 额外添加的 ransack 搜索条件，例如：['sell_time_gteq']
    extraKey: { type: Array as PropType<string[]>, default: () => [] },
    // 默认值
    initValue: { type: String, default: '' },
    placeholder: { type: String, default: '请输入关键词' },
    tips: { type: String, default: '检索内容' },
    // ransack conjunction
    conjunction: { type: String, default: 'or' },
    // ransack predicate
    predicate: { type: String, default: 'cont_any' },
    focusByInit: { type: Boolean, default: false },
  },
  emits: ['update:value', 'focusSearch'],
  setup(props, { emit }) {
    // $refs.searchInput
    const searchInput = ref<any>(null);
    const keyword: Ref<string> = ref('');
    const isFocus = ref(props.focusByInit);

    const search_key = computed(() => {
      if (props.variables.length === 0) {
        return '';
      }
      return `${props.variables.join(`_${props.conjunction}_`)}_${props.predicate}`;
    });

    const inputPlaceholder = computed(() => {
      return isFocus.value ? props.placeholder : props.tips;
    });

    watch(
      () => props.initValue,
      () => {
        keyword.value = props.initValue;
        focusSearch();
      },
    );

    onMounted(() => {
      if (props.initValue) {
        keyword.value = props.initValue;
        focusSearch();
      }
    });

    const onSearch = () => {
      const keywordArray = keyword.value
        ? keyword.value
            .trim()
            .toLocaleLowerCase()
            .replace(/\s{2,}/g, ' ')
            .split(' ')
        : [];
      const extra = props.extraKey.reduce(
        (obj: any, key: string) => ({
          ...obj,
          [key]: keywordArray,
        }),
        {},
      );
      const emitData = { ...props.value, ...extra };

      if (search_key.value) {
        emitData[search_key.value] = keywordArray;
      }

      emit('update:value', emitData, keyword.value, keywordArray);
    };

    const debounceInput: any = debounce(onSearch, 500);

    const onBlur = () => {
      if (!keyword.value) {
        isFocus.value = props.focusByInit || false;
      }
    };

    const onFocus = () => {
      isFocus.value = true;
    };

    const resetSearch = () => {
      keyword.value = '';
      searchInput.value.focus();
      onSearch();
    };

    const focusSearch = () => {
      emit('focusSearch');
      onSearch();
    };

    return {
      isFocus,
      keyword,
      inputPlaceholder,
      debounceInput,
      onSearch,
      onBlur,
      onFocus,
      resetSearch,
      searchInput,
      focusSearch,
    };
  },
});

export default TaSearcher;
</script>

<template lang="pug">
.searcher(:class='{ focus: isFocus }')
  TaIcon.prefix-icon(type='SearchOutlined')
  input.search-input(
    ref='searchInput',
    v-model='keyword',
    :placeholder='inputPlaceholder',
    @input='debounceInput',
    @keyup.enter='focusSearch',
    @focus='onFocus',
    @blur='onBlur',
    clearable
  )
  TaIcon.suffix-icon(v-if='keyword', type='CloseCircleOutlined', @click='resetSearch')
</template>

<style lang="stylus" scoped>
.searcher
  display inline-flex
  align-items center
  overflow hidden
  width 100px
  height 32px
  border-radius 3px
  transition width 0.2s ease
  .search-input
    margin 0 6px
    padding 0
    width 100%
    height 20px
    border none
    background-color transparent
    color #383838
    font-size 14px
    line-height 20px
    &:hover, &:focus
      outline none
  .prefix-icon, .suffix-icon
    color #A6A6A6
    font-size 14px
  .suffix-icon
    cursor pointer
  .prefix-icon
    margin-left 13px
.focus
  padding 0px 12px
  width 280px
  background-color #F5F5F5
</style>
