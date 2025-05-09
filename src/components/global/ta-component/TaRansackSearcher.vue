<script lang="ts">
import { debounce } from 'lodash';
import ClickOutside from './directives/clickOutside';
import { computed, defineComponent, onMounted, Ref, ref, VNode, PropType } from 'vue';
import { VObject } from '@/lib/vails/model';
import dayjs from 'dayjs';

interface ICondition {
  key: string;
  keyName: string;
  predicate: string;
  predicateName: string;
  type: 'string' | 'number';
  value: string | number;
  select?: { label: string; value: any }[];
  _canDelete: boolean;
  _isEdit?: boolean;
}

interface IKeyOption {
  label: string;
  value: string;
  type: 'string' | 'number' | 'time' | 'select';
}

const TaRansackSearcher = defineComponent({
  name: 'TaRansackSearcher',
  directives: {
    ClickOutside,
  },
  props: {
    // 绑定 query 对象
    value: { type: Object, default: () => ({}) },
    options: { type: Array as PropType<(ICondition | VObject)[]>, required: true },
    // 默认搜索字段 ['seq', 'name', 'age']
    variables: { type: Array, default: () => [] },
    // 默认搜索使用的谓词
    defaultPredicate: { type: String, default: 'cont_any' },
    placeholder: { type: String, default: '请输入关键词' },
    tips: { type: String, default: '检索内容' },
  },
  setup(props, { emit }) {
    // $refs.defaultInput
    const defaultInput = ref(null);
    const isDoing = ref(false);
    const isFocus = ref(false);
    const showMenu = ref(false);
    // default input
    const keyword: any = ref('');
    // condition input
    const historyConditions: Ref<ICondition[]> = ref([]);
    const conditions: Ref<ICondition[]> = ref([]);
    const conditionFormData: Ref<ICondition | VObject> = ref({
      key: '',
      predicate: '',
      value: '',
    });
    const conditionIndex = ref(-1);
    const selectedKeyOption: Ref<IKeyOption | VObject> = ref({});

    const predicateOptions = computed(() => {
      return getPredicateOptions(selectedKeyOption.value.type);
    });
    const inputPlaceholder = computed(() => {
      return isFocus.value ? props.placeholder : props.tips;
    });

    onMounted(() => {
      selectedKeyOption.value = props.options[0] || {};
      conditionFormData.value = {
        key: selectedKeyOption.value.value,
        predicate: getPredicateOptions(selectedKeyOption.value.type)[0].value,
        value: '',
      };
    });

    const onSearch = () => {
      const query: VObject = conditions.value.reduce((q: VObject, c: ICondition) => {
        const key = `${c.key}_${c.predicate}`;
        const value = c.type === 'string' ? parseStringToArray(String(c.value)) : c.value;
        return { ...q, [key]: value };
      }, {});
      if (props.variables.length && keyword.value) {
        const key = props.variables.join('_or_') + `_${props.defaultPredicate}`;
        query[key] = parseStringToArray(keyword.value);
      }
      emit('update:value', query);
    };

    const focusSearch = () => {
      emit('focusSearch');
      onSearch();
    };

    const resetSearch = () => {
      conditions.value = [];
      keyword.value = '';
      onSearch();
    };
    const setInputFocus = () => {
      const input = defaultInput.value as any;
      if (input) {
        input.scrollIntoView();
        input.focus();
      }
    };

    const debounceInput = debounce(onSearch, 800);

    const onBackspace = () => {
      const lastCondition = conditions.value[conditions.value.length - 1];
      if (lastCondition) {
        if (lastCondition._canDelete) {
          conditions.value.pop();
          onSearch();
        } else {
          lastCondition['_canDelete'] = !keyword.value;
        }
      }
    };
    const removeCondition = (cd: ICondition, index: number) => {
      conditions.value.splice(index, 1);
      onSearch();
      setInputFocus();
      showMenu.value = true;
      if (cd.key === conditionFormData.value.key) {
        conditionFormData.value = {};
      }
    };
    const onSelectKeyOption = (key: string) => {
      onOpen();
      selectedKeyOption.value = props.options.find((o: IKeyOption | VObject) => o.value === key)!;
      conditionFormData.value.predicate = getPredicateOptions(
        selectedKeyOption.value.type,
      )[0].value;
    };

    const onSelectPredicate = () => {
      onOpen();
    };
    const addCondition = () => {
      const { key, predicate, value } = conditionFormData.value;
      const predicateOption = predicateOptions.value.find((o: VObject) => o.value === predicate);
      const _conditionFormData: ICondition = {
        key,
        value,
        predicate,
        keyName: selectedKeyOption.value.label,
        predicateName: (predicateOption || { label: '' }).label,
        type: selectedKeyOption.value.type || 'string',
        _canDelete: false,
        _isEdit: false,
      };
      conditions.value.push(_conditionFormData);
      historyConditions.value.push({ ..._conditionFormData });
      conditionFormData.value = {};
      setInputFocus();
      onSearch();
    };
    const editCondition = (cd: ICondition, index: number) => {
      conditionFormData.value = { ...cd, _isEdit: true };
      conditionIndex.value = index;
    };
    const updateCondition = () => {
      // 更新 tag
      const cd = conditions.value[conditionIndex.value];
      Object.assign(cd, conditionFormData.value);
      // 更新历史
      const hcd = historyConditions.value.find(o => o.key === cd.key);
      if (hcd) {
        Object.assign(hcd, conditionFormData.value);
      }
      conditionFormData.value = {};
      setInputFocus();
      onSearch();
    };

    const useHistoryCondition = (cd: ICondition) => {
      if (!conditions.value.find(c => c.key === cd.key)) {
        conditions.value.push({ ...cd });
        onSearch();
      }
    };

    const parseStringToArray = (string: string) => {
      if (!string) return [];
      // const pattern = /[,，;；\s、!@#$%^&*_\-+=《》<>?\\/[\]()（）'"‘’“”]/g;
      const formatString = string
        // .replace(pattern, ' ')
        .trim()
        .replace(/\s{2,}/g, ' ');
      return formatString.split(' ');
    };

    const onOpen = () => {
      if (isFocus.value) {
        showMenu.value = true;
        return;
      }
      isFocus.value = true;
      setTimeout(() => {
        showMenu.value = true;
      }, 100);
    };

    const onClose = () => {
      if (isDoing.value) return;
      if (keyword.value || conditions.value.length) {
        showMenu.value = false;
        return;
      }
      showMenu.value = false;
      setTimeout(() => {
        isFocus.value = false;
      }, 50);
    };

    const setDoing = () => {
      isDoing.value = true;
      setTimeout(() => {
        isDoing.value = false;
      }, 200);
    };

    const getPredicateOptions = (type: 'string' | 'number' | 'time' | 'select') => {
      if (type === 'number' || type === 'time') {
        return [
          { label: '=', value: 'eq' },
          { label: '>', value: 'gt' },
          { label: '>=', value: 'gteq' },
          { label: '<', value: 'lt' },
          { label: '<=', value: 'lteq' },
        ];
      }

      if (type === 'select') {
        return [{ label: '包含', value: 'in' }];
      }

      return [
        { label: '包含', value: 'cont_any' },
        { label: '等于', value: 'eq' },
        { label: '不等于', value: 'not_eq' },
      ];
    };

    const filterOption = (input: string, option: VNode) => {
      return (
        (option as any).componentOptions.children[0].text
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      );
    };

    const conditionFormDataTimeValue = computed({
      get: () => (conditionFormData.value.value ? dayjs(conditionFormData.value.value) : null),
      set: val => (conditionFormData.value.value = val ? val.format('YYYY-MM-DD HH:mm') : null),
    });

    return {
      onClose,
      isFocus,
      showMenu,
      conditions,
      editCondition,
      removeCondition,
      keyword,
      inputPlaceholder,
      onSearch,
      onBackspace,
      debounceInput,
      onOpen,
      resetSearch,
      filterOption,
      useHistoryCondition,
      onSelectKeyOption,
      onSelectPredicate,
      addCondition,
      updateCondition,
      setDoing,
      defaultInput,
      historyConditions,
      conditionFormData,
      predicateOptions,
      focusSearch,
      selectedKeyOption,
      conditionFormDataTimeValue,
    };
  },
});

export default TaRansackSearcher;
</script>

<template lang="pug">
.ransack-searcher(
  :class='{ "ransack-searcher-focus": isFocus, "auto-width-searcher": showMenu }'
)
  //- v-click-outside='onClose',
  .input-box
    TaIcon.prefix-icon(type='SearchOutlined')
    .key-items-wrapper
      .key-items
        a-tag.key-tag(
          v-for='(item, index) in conditions',
          :key='index',
          :closable='true',
          :visible='true',
          color='#A6A6A6',
          @click='editCondition(item, index)',
          @close.stop='removeCondition(item, index)'
        )
          span {{ item.keyName }} {{ item.predicateName }} {{ item.value }}
        input.key-input(
          ref='defaultInput',
          v-model='keyword',
          :placeholder='inputPlaceholder',
          @keyup.enter='focusSearch',
          @keyup.delete='onBackspace',
          @input='debounceInput',
          @focus='onOpen',
          @onBlur='onClose',
          @click='showMenu = true',
          :size='Math.round(keyword.length * 1.2)',
          type='text',
          clearable
        )
    TaIcon.suffix-icon(
      v-if='conditions.length || keyword',
      type='CloseCircleOutlined',
      @click='resetSearch'
    )

  .condition-box.relative(
    v-if='options?.length',
    @click='onOpen',
    :class='{ "condition-box-open": showMenu }'
  )
    TaIcon.absolute.right-2.top-2(
      type='CloseCircleOutlined',
      @click.stop='onClose',
    )
    .history
      .history-title(v-if='historyConditions.length')
        | 历史搜索
      .history-condition(
        @click='useHistoryCondition(cd)',
        v-for='(cd, i) in historyConditions',
        :key='i'
      )
        | {{ cd.keyName }} {{ cd.predicateName }} {{ cd.value }}
    .condition-footer
      a-select.select.key-select(
        v-model:value='conditionFormData.key',
        :options='options',
        placeholder='搜索项',
        size='small',
        show-search,
        :filter-option='filterOption',
        @select='setDoing',
        @change='onSelectKeyOption'
      )
      a-select.select.predicate-select(
        v-model:value='conditionFormData.predicate',
        :options='predicateOptions',
        placeholder='条件',
        size='small',
        @select='setDoing',
        @change='onSelectPredicate'
      )
      .condition-value.flex-grow
        a-input.condition-input(
          v-if='["number", "string"].includes(selectedKeyOption.type)',
          v-model:value='conditionFormData.value',
          :type='conditionFormData.type === "number" ? "number" : "string"',
          placeholder='关键词',
          size='small'
        )
        .mr-2(v-else-if='["time"].includes(selectedKeyOption.type)')
          a-date-picker(
            v-model:value='conditionFormDataTimeValue',
            size='small',
            show-time,
          )
        .mr-2(v-else-if='["select"].includes(selectedKeyOption.type)')
          TaSelect(
            v-model:value='conditionFormData.value',
            :multiple='true',
            :options='selectedKeyOption.select',
            size='small',
          )
      a-button(
        v-if='conditionFormData._isEdit',
        type='primary',
        size='small',
        @click='updateCondition',
        :disabled='!(conditionFormData.key && conditionFormData.predicate && conditionFormData.value)'
      )
        | 更新
      a-button(
        v-else,
        type='primary',
        size='small',
        @click='addCondition',
        :disabled='!(conditionFormData.key && conditionFormData.predicate && conditionFormData.value)'
      )
        | 添加
</template>

<style lang="stylus">
$minWidth = 100px
$maxWidth = 340px

.ransack-searcher
  position relative
  display inline-block
  width $minWidth
  transition all 0.2s ease
  .input-box
    position relative
    z-index 100
    display flex
    flex-shrink 0
    align-items center
    overflow hidden
    padding 0px 10px
    height 36px
    border-radius 3px
    background-color inherit
    cursor pointer
    .prefix-icon, .suffix-icon
      color #A6A6A6
      font-size 14px
    .suffix-icon
      cursor pointer
    .key-items-wrapper
      flex-grow 1
      flex-shrink 0
      overflow hidden
      margin 0 8px
      height 24px
      .key-items
        display flex
        flex-wrap nowrap
        align-items center
        // overflow-x scroll
        padding-bottom 30px
        .key-tag
          display inline-block
          margin-right 2px
          padding 0px 6px
          border-radius 4px
          background rgba(166, 166, 166, 1)
          color rgba(255, 255, 255, 1)
          white-space nowrap
          font-weight 400
          font-size 12px
          line-height 20px
        .key-input
          flex-grow 1
          padding 0 2px
          min-width 100px
          height 24px
          border none
          background-color transparent
          color #383838
          font-size 14px
          line-height 24px
          &:hover, &:focus
            outline none
  .condition-box
    position absolute
    top 44px
    right 0px
    z-index 10
    overflow hidden
    min-width $maxWidth
    height 0px
    border-radius 2px
    background rgba(255, 255, 255, 1)
    box-shadow 0px 7px 21px 0px rgba(0, 0, 0, 0.1)
    opacity 0
    transition all 0.2s ease
    transform translateY(-100%)
    .history
      padding 8px 0
      .history-title
        padding 8px 16px
        color rgba(166, 166, 166, 1)
        font-weight 500
        font-size 14px
        line-height 20px
      .history-condition
        padding 12px 24px 12px 16px
        color rgba(56, 56, 56, 1)
        text-overflow ellipsis
        white-space nowrap
        font-weight 400
        font-size 14px
        line-height 16px
        cursor pointer
        &:hover
          background #f5f5f5
    .condition-footer
      display flex
      justify-content space-between
      align-items center
      padding 8px 16px 10px
      min-width 500px
      .select
        flex-grow 1
        margin-right 4px
        color $primary-color
        line-height 24px
        transform translateX(-7px)
        .ant-select-selection__placeholder
          height 24px
          line-height 24px
        .ant-select-selection
          border none
      .key-select
        min-width 200px
      .predicate-select
        flex-shrink 0
        width 70px
      .condition-input
        margin-right 4px
        border none
  .condition-box-open
    height fit-content
    opacity 1
    transform translateY(0px)

.ransack-searcher-focus
  width $maxWidth
  background-color #F5F5F5

.auto-width-searcher
  min-width $maxWidth
  width fit-content
</style>
