<script lang="ts">
import { useFormInject } from '@/components/global/ta-component/ta-template-form-core/useForm';
import { VModel, VObject } from '@/lib/vails/model';
import { get, isEqual, set } from 'lodash';
import { computed, defineComponent, onMounted, PropType, ref, toRefs, watch } from 'vue';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import useConfigurableApi from '../../ta-template-form-core/useConfigurableApi';
import useNestedAttributes from '../../ta-template-form-core/useNestedAttributes';
import useProcessFields from '../../ta-template-form-core/useProcessFields';

const TaNestedAttributesPolymorphicField = defineComponent({
  name: 'TaNestedAttributesPolymorphicField',
  components: {},
  props: {
    value: { type: Array as PropType<VObject[]>, default: () => [] },
    nestedAttributes: { type: Array as PropType<VObject>, default: () => [] },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => [] },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: true },
    polymorphicKey: { type: String, default: 'source' },
  },
  setup(props, { emit }) {
    const { formComponent } = useFormInject();

    const { getKey } = useProcessFields();

    const localNestedAttributes = computed({
      get: () => props.nestedAttributes,
      set: val => {
        emit('update:nestedAttributes', val);
      },
    });

    const key = computed(() => getKey(props.item));
    const nestedKey = computed(() => `${key.value}_attributes`);

    const nestedAttributesValue = computed({
      get: () => get(formComponent?.value || localNestedAttributes.value, nestedKey.value),
      set: val => set(formComponent?.value || localNestedAttributes.value, nestedKey.value, val),
    });

    onMounted(() => {
      // if (!nestedAttributesValue.value) {
      nestedAttributesValue.value = [];
      // }
    });

    let timeoutId: null | NodeJS.Timeout = null;

    const onCreate = (payload: VObject) => {
      // 这里从通讯录导入，有并发问题，不能用 = [...localValue.value, {}]
      localValue.value.push({
        [props.polymorphicKey]: payload,
        [`${props.polymorphicKey}_id`]: payload.id,
        [`${props.polymorphicKey}_type`]: getTagTab(payload as VObject & VModel<VObject>)
          ?.polymorphicType,
      });

      // 解决并发问题使用 push，不会主动触发响应式
      timeoutId = setTimeout(() => {
        if (timeoutId) clearTimeout(timeoutId);

        localValue.value = [...localValue.value];
      }, 500);

      runAppendNestedAttributes(payload);
    };

    // const onUpdate = (payload: VObject) => {
    //   runAppendNestedAttributes(payload);
    // };

    const onDelete = (_: VObject, index: number) => {
      const val = [...localValue.value];
      const payload = val[index];

      val.splice(index, 1);
      // 这里清空，有并发问题，所以要加一个 clearUp
      localValue.value = val;
      if (payload[`${props.polymorphicKey}_id`]) {
        // NOTE: 这里，update 时从 tags 删除，
        // payload 是中间表对象。而不是关联对象
        runAppendNestedAttributes({
          ...payload,
          ...payload[props.polymorphicKey],
          id: payload[`${props.polymorphicKey}_id`],
          _destroy: true,
        });
      } else {
        runAppendNestedAttributes({ ...payload, _destroy: true });
      }
    };

    const onClearUp = () => {
      localValue.value.forEach((payload: VObject) => {
        runAppendNestedAttributes({ ...payload, _destroy: true });
      });
      localValue.value = [];
    };

    const { appendNestedAttributes } = useNestedAttributes();

    const runAppendNestedAttributes = (payload: VObject) => {
      // NOTE: payload 是具体对象，不是关联对象
      // localValue 里是 relation 关联中间表对象，不是具体对象
      appendNestedAttributes(
        {
          id: localValue.value.find(
            (record: VObject) =>
              record[`${props.polymorphicKey}_id`] === payload.id &&
              payload[`${props.polymorphicKey}_type`] ===
                getTagTab(payload as VObject & VModel<VObject>)?.polymorphicType,
          )?.id,
          [`${props.polymorphicKey}_id`]: payload.id,
          [`${props.polymorphicKey}_type`]: getTagTab(payload as VObject & VModel<VObject>)
            ?.polymorphicType,
          _destroy: payload._destroy,
        },
        nestedAttributesValue,
        [`${props.polymorphicKey}_id`, `${props.polymorphicKey}_type`],
      );
    };

    const activeTab = ref<VObject>({});

    watch(
      () => props.item,
      (newValue: TaTemplateFormItem, oldValue?: TaTemplateFormItem) => {
        if (!isEqual(newValue, oldValue)) {
          activeTab.value = { ...props.item.options?.nested_attributes_polymorphic_tabs?.[0] };
        }
      },
      {
        deep: true,
        immediate: true,
      },
    );

    const localValue = computed({
      get: () => props.value,
      set: newValue => {
        emit('update:value', newValue);
      },
    });

    const targetRecords = ref<VObject>([]);

    watch(
      localValue,
      (newValue: VObject[]) => {
        // console.log(newValue, 'newValue');
        if (Array.isArray(newValue)) {
          // console.log(newValue, 'newValue');

          targetRecords.value = newValue.map((relation: VObject) => ({
            ...relation,
            ...relation[props.polymorphicKey],
            [`${props.polymorphicKey}_type`]: relation[`${props.polymorphicKey}_type`],
            __TaIndexViewTabKey: (
              props.item.options?.nested_attributes_polymorphic_tabs || []
            ).find(
              (tab: VObject) => tab.polymorphicType === relation[`${props.polymorphicKey}_type`],
            )?.key,
          }));
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );

    const getTagTab = (record: VObject & VModel<VObject>) => {
      return (props.item.options?.nested_attributes_polymorphic_tabs || []).find(
        (tab: VObject) =>
          tab.key === record.__TaIndexViewTabKey ||
          (!record.__TaIndexViewTabKey &&
            tab.polymorphicType == record[`${props.polymorphicKey}_type`]),
      );
    };

    const visibleBooks = ref(false);

    const bookSelectionConfig = computed(
      () =>
        props.item.options?.nested_attributes_polymorphic_tabs &&
        props.item.options?.nested_attributes_polymorphic_tabs.map((tab: VObject) => {
          const { store } = useConfigurableApi(tab);
          return {
            store,
            tabKey: tab.key,
            sourceType: tab.polymorphicType,
          };
        }),
    );

    const selectorRef = ref<any>(null);

    const selector = computed(() => selectorRef.value?.selector);

    const onOk = () => emit('ok');

    return {
      ...toRefs(props),
      onCreate,
      // onUpdate,
      onDelete,
      onClearUp,
      activeTab,
      localValue,
      targetRecords,
      getTagTab,
      visibleBooks,
      bookSelectionConfig,
      nestedAttributesValue,
      selectorRef,
      selector,
      onOk,
    };
  },
});
export default TaNestedAttributesPolymorphicField;
</script>

<template lang="pug">
.ta-nested-attributes-polymorphic-field
  TaApiStoreField(
    ref='selectorRef',
    v-model:value='targetRecords',
    :recordName='activeTab.label',
    :path='activeTab.path',
    :ransackStr='activeTab.ransackStr',
    :tableItems='activeTab.table_items',
    :attrs='item.options.attrs',
    :tabs='item.options.nested_attributes_polymorphic_tabs',
    :multiple='multiple',
    :disabled='disabled',
    :bookSelectionConfig='bookSelectionConfig',
    @tabChange='tab => (activeTab = tab)',
    @selectedAdd='record => onCreate(record.rawData || record)',
    @selectedRemove='(record, index) => onDelete(record.rawData || record, index)',
    @selectedClearUp='onClearUp',
    @ok='onOk'
  )
    template(#selected-display='{ record, index, attrs, value, ellipsisValue }')
      .flex.items-center
        .tag.text-white.text-xs.rounded-lg.px-2.mr-2(
          v-if='getTagTab(record)',
          :style='{ backgroundColor: getTagTab(record).tagColor }'
        )
          | {{ getTagTab(record).label }}
        a-popover
          template(#content)
            .label {{ value }}
          .one-line.text-gray-900.font-regular {{ ellipsisValue }}
    template(#tags='{ records, actions }')
      slot(
        name='tags',
        :records='records',
        :actions='{ ...actions, getTagTab, getTagTextEllipses: actions.getTagTextEllipses }'
      )
        .pt-2.flex.flex-wrap
          .bg-blue-gray-100.rounded-xl.h-10.w-22.flex-center.cursor-pointer(
            v-if='!disabled',
            @click='actions.openSelector'
          )
            TaIcon.icon.mr-2(type='PlusCircleFilled')
            span.text-gray-800.text-sm.font-regular 添加
          .bg-blue-gray-100.rounded-xl.flex.h-10.items-center.relative.ml-3.mb-2.pr-4(
            v-for='(record, index) in records'
          )
            .mark.text-white.w-10.h-5.flex-center(
              v-if='getTagTab(record)',
              :style='{ backgroundColor: getTagTab(record).tagColor }'
            )
              | {{ getTagTab(record).label }}
            a-popover(:mouseEnterDelay='1')
              template(#content)
                span {{ actions.getTagText(record) }}
              span.px-1.text-sm.text-gray-700 {{ actions.getTagTextEllipses(record) }}
            TaIcon.close-icon.pl-2(
              v-if='!disabled',
              type='CloseCircleFilled',
              @click='() => actions.removeRecord(index)'
            )

    template(#display='{ open }')
      slot(name='display', :open='open')
</template>

<style lang="stylus" scoped>
.tag
  background-color $primary-color
  padding-top 0.19rem
  padding-bottom 0.19rem
.icon
  color $primary-color
.mark
  border-radius 0.75rem 0 0.75rem 0
  font-size 0.25rem
  align-self flex-start
.close-icon
  color rgba(31, 57, 138, 1)
.contact
  color $primary-color
  border 0.08rem solid $primary-color
</style>
