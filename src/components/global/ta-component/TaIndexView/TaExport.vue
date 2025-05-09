<script lang="ts">
import { merge } from 'lodash';
import { VStore } from '@/lib/vails';
import { message, Modal } from 'ant-design-vue';
import { PropType, defineComponent, ref, computed, toRefs } from 'vue';
import { TaTemplateFormItem } from '../ta-template-form-core/types';
import { TaIndexViewAction } from './ta-index-view-core/types';
import { VObject } from '../../../../lib/vails/model/index';

const TaExport = defineComponent({
  name: 'TaExport',
  props: {
    store: { type: Object as PropType<VStore<any>>, required: true },
    template: { type: Object as PropType<TaTemplateFormItem>, default: undefined },
    temporaryQuery: { type: Object, default: () => ({}) },
    temporaryParams: { type: Object, default: () => ({}) },
    headerTitle: { type: String, default: '选择导出字段' },
    okText: { type: String, default: '确定' },
    cancelText: { type: String, default: '取消' },
    allText: { type: String, default: '全选' },
    action: { type: Object as PropType<TaIndexViewAction>, default: undefined },
    filename: { type: [String, Function], default: undefined },
    name: { type: String, default: '导出' },
  },
  setup(props) {
    const loading = ref(false);
    const visible = ref(false);
    const indeterminate = ref(true);
    const checkAll = ref(false);
    const headers = ref<{ key: string; name: string }[]>([]);
    const selectedKey = ref<string[]>([]);

    const getSeq = (header: VObject) => {
      return [header.json, header.key].filter(i => i).join('.');
    };
    const selectedHeaders = computed(() =>
      headers.value.filter(header => selectedKey.value.includes(getSeq(header))),
    );

    const onHeaders = () => {
      if (loading.value) {
        return;
      }
      loading.value = true;

      props.store
        .sendCollectionAction({
          action: 'export_headers',
          config: { data: { ta_template: props.template } },
        })
        .then(res => {
          headers.value = res.data.headers;
          loading.value = false;
          visible.value = true;
        })
        .catch(err => {
          loading.value = false;
          throw err;
        });
    };

    const onCancel = () => {
      visible.value = false;
    };

    const hasExpertAsync = process.env.VUE_APP_EXPERT_ASYNC === 'TRUE';
    const asyncExpertChecked = ref(true);
    const onConfirm = () => {
      if (loading.value) {
        return;
      }

      loading.value = true;
      const params = merge(
        {
          q: { ...props.store.query.value, ...props.temporaryQuery },
          sub_q: { ...props.store.subQuery.value },
        },
        props.store.api.params,
        props.temporaryParams,
      );
      if (asyncExpertChecked.value && process.env.VUE_APP_EXPERT_ASYNC === 'TRUE') {
        props.store
          .sendCollectionAction({
            action: 'export_async',
            config: {
              params,
              data: { ...params, headers: selectedHeaders.value, ta_template: props.template },
              // responseType: 'arraybuffer',
            } as any,
          })
          .then(res => {
            loading.value = false;
            message.success('请到下载中心查看');
          })
          .catch(err => {
            loading.value = false;
            throw err;
          });
      } else {
        props.store
          .sendCollectionAction({
            action: 'export',
            config: {
              params,
              data: { ...params, headers: selectedHeaders.value, ta_template: props.template },
              responseType: 'arraybuffer',
            } as any,
          })
          .then(res => {
            loading.value = false;
            const url = window.URL.createObjectURL(
              new Blob([res.data as string], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              }),
            );
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            if (props.filename) {
              if (typeof props.filename === 'function') {
                a.download = props.filename();
              } else {
                a.download = props.filename;
              }
            }
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          })
          .catch(err => {
            loading.value = false;
            throw err;
          });
      }
    };

    const onChange = (checkedList: string[]) => {
      indeterminate.value = !!checkedList.length && checkedList.length < headers.value.length;
      checkAll.value = checkedList.length === headers.value.length;
    };

    const onCheckAllChange = (e: any) => {
      selectedKey.value = e.target.checked ? headers.value.map(header => getSeq(header)) : [];
      indeterminate.value = false;
      checkAll.value = e.target.checked;
    };

    return {
      ...toRefs(props),
      loading,
      onHeaders,
      visible,
      onCancel,
      indeterminate,
      checkAll,
      onCheckAllChange,
      selectedKey,
      onChange,
      headers,
      onConfirm,
      getSeq,
      hasExpertAsync,
      asyncExpertChecked,
    };
  },
});

export default TaExport;
</script>

<template lang="pug">
.ta-export
  TaPopoverConfirm(
    v-if='action?.confirm',
    :title='action.label',
    :content='action.options?.confirmText || `您确认${action.label}这些${activeRecordName}吗？`',
    @confirm='onHeaders'
  )
    TaTextButton(:icon='loading ? "LoadingOutlined" : "ExportOutlined"')
      | {{ name }}
  TaTextButton(v-else, :icon='loading ? "LoadingOutlined" : "ExportOutlined"', @click='onHeaders')
    | {{ name }}
  TaNoPaddingModal(
    top='20vh',
    :title='headerTitle',
    :visible='visible',
    :width='960',
    :footer='null',
    @cancel='onCancel'
  )
    .flex.flex-col
      .flex-grow.py-4.px-6.flex
        a-checkbox.flex-shrink-0.mr-2(:indeterminate='indeterminate', :checked='checkAll', @change='onCheckAllChange') {{ allText }}
        a-checkbox-group.check-box-custom.flex-grow.w-0(v-model:value='selectedKey', @change='onChange')
          a-row(:gutter='20')
            a-col(:span='6', v-for='item in headers', :key='getSeq(item)')
              a-checkbox(:value='getSeq(item)') {{ item.name }}
        //- template(#footer)
      .footer.flex-shrink-0.items-center
        a-checkbox(v-if='hasExpertAsync',v-model:checked='asyncExpertChecked') 异步导出
        a-button.button(size='large', @click='onCancel') {{ cancelText }}
        a-button(
          type='primary',
          size='large',
          :loading='loading',
          :disabled='selectedKey.length === 0',
          @click='onConfirm'
        ) {{ okText }}
</template>

<style lang="stylus" scoped>
.ta-export
  cursor pointer
  display flex

.footer
  display flex
  justify-content flex-end
  padding 10px
  width 100%
  border-top 1px #e8e8e8 solid
  .button
    margin-right 10px
  button
    width 80px
</style>

<style lang="stylus">
.check-box-custom
  .ant-checkbox-wrapper
    width 100%
    .ant-checkbox
      @apply flex-shrink-0
    span:not(.ant-checkbox):not(.ant-checkbox-inner)
      @apply break-words whitespace-pre-wrap w-0 flex-grow
</style>
