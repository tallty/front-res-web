<script lang="ts">
import { defineComponent, PropType, ref, computed, watch, toRefs } from 'vue';
import { VStore } from '@/lib/vails';
import { TaIndexImportHeader } from './types';
import { VObject } from '@/lib/vails/model';
import { message } from 'ant-design-vue';
import { VRequestResponse } from '@/lib/vails/request';
import { TaTemplateFormItem } from '../ta-template-form-core/types';
import { IFile } from '../file/file';

const TaImport = defineComponent({
  name: 'TaImport',
  props: {
    store: { type: Object as PropType<VStore<any>>, required: true },
    headers: { type: Array as PropType<TaIndexImportHeader[]>, default: () => [] },
    template: { type: Object as PropType<TaTemplateFormItem>, default: undefined },
    onConfirmFunc: { type: Function, default: undefined },
  },
  emits: ['success'],
  setup(props, { emit }) {
    const uid = ref('');
    const visibleImport = ref(false);
    const loading = ref(false);
    // excel 的表头
    const dataTitles = ref<string[]>([]);
    // excel 的数据
    const rowData = ref<VObject[]>([]);
    // 有改动的 key 值数组，用 index 到 dataHeaders 找对应 name
    const keysChanged = ref<string[]>([]);
    const currentPage = ref(0);
    const totalCount = ref(0);
    const totalPages = ref(0);
    const localHeaders = ref<TaIndexImportHeader[]>([]);
    const optionalHeaders = computed(() => [...dynamicHeaders.value, { key: '', name: null }]);
    const optionalHeadersOptions = computed(() =>
      optionalHeaders.value.map((header: TaIndexImportHeader) => ({
        label: header.name,
        value: header.key,
        disabled: header.key === '' ? false : keysChanged.value.includes(header.key),
      })),
    );

    const dynamicHeaders = computed(() =>
      props.headers.length === 0 ? localHeaders.value : props.headers,
    );

    const primaryKeysOptions = ref<{ name: string | null; key: string }[]>([]);
    const selectedPrimaryKeys = ref<string[]>([]);

    const fetchHeaders = () => {
      if (props.headers.length === 0) {
        return props.store
          .sendCollectionAction({
            action: 'import_headers',
            config: {
              data: { ta_template: props.template },
            },
          })
          .then((res: VRequestResponse) => {
            localHeaders.value = res.data.headers;
            primaryKeysOptions.value = res.data.headers.map((header: TaIndexImportHeader) => ({
              name: header.name,
              key: header.key,
            }));
          });
      } else {
        primaryKeysOptions.value = props.headers.map((header: TaIndexImportHeader) => ({
          name: header.name,
          key: header.key,
        }));
        selectedPrimaryKeys.value = props.headers
          .filter((header: TaIndexImportHeader) => header.primary_key)
          .map((header: TaIndexImportHeader) => header.key);
        return Promise.resolve();
      }
    };

    const setDefaultOptionsValue = () => {
      keysChanged.value = [];
      dataTitles.value.forEach((dataTitle: string) => {
        const existHeader = dynamicHeaders.value.find(
          (i: TaIndexImportHeader) => i.name === dataTitle,
        );
        const key = existHeader ? existHeader.key : '';
        keysChanged.value.push(key);
      });
    };

    watch(dynamicHeaders, setDefaultOptionsValue, { deep: true, immediate: true });
    watch(dataTitles, setDefaultOptionsValue, { deep: true, immediate: true });

    const onImport = () => {
      if (!fileItems.value?.[0]?.file) return;
      loading.value = true;
      const formData = new FormData();
      formData.append('file', fileItems.value[0].file);
      props.store
        .sendCollectionAction({
          action: 'upload_excel',
          config: { data: formData },
        })
        .then((res: VRequestResponse) => {
          uid.value = res.data.uid;
          fetchHeaders()
            .then(() => {
              rawDataIndex()
                .then((res: VRequestResponse) => {
                  dataTitles.value = res.data.titles;
                  currentStep.value = 1;
                  message.success('上传文件完成！');
                  loading.value = false;
                })
                .catch(() => {
                  loading.value = false;
                  message.error('获取表格数据异常！');
                });
            })
            .catch(() => {
              loading.value = false;
              message.error('获取导入表头失败');
            });
        })
        .catch(() => {
          loading.value = false;
          message.error('上传文件失败！');
        });
    };

    const onCancel = () => {
      resetImport();
    };

    const resetImport = () => {
      visibleImport.value = false;
      uid.value = '';
      keysChanged.value = [];
      currentStep.value = 0;
      fileItems.value = [];
    };

    const onConfirm = () => {
      const headers = JSON.parse(JSON.stringify(dynamicHeaders.value));
      const resultHeaders: TaIndexImportHeader[] = [];

      keysChanged.value.forEach((key: string, index: number) => {
        if (!key) {
          return;
        }
        const newTitle = dataTitles.value[index];
        const targetHeader = headers.find((header: TaIndexImportHeader) => header.key === key);
        targetHeader.name = newTitle;
        resultHeaders.push(targetHeader);
      });

      selectedPrimaryKeys.value.forEach((key: string) => {
        const targetHeader = resultHeaders.find(
          (header: TaIndexImportHeader) => header.key === key,
        );
        if (targetHeader) {
          targetHeader.primary_key = true;
        }
      });

      if (props.onConfirmFunc) {
        props.onConfirmFunc({ resultHeaders, uid, resetImport });
      } else {
        props.store
          .sendCollectionAction({
            action: 'import',
            config: {
              data: {
                headers: resultHeaders,
                uid: uid.value,
                ta_template: props.template,
              },
            },
          })
          .then(() => {
            resetImport();
            emit('success');
          });
      }
    };

    const rawDataIndex = (page = 1, perPage = 15) => {
      return props.store
        .sendCollectionAction({
          action: 'excel',
          config: { params: { uid: uid.value, page: page, per_page: perPage } },
        })
        .then((res: VRequestResponse) => {
          currentPage.value = res.data.current_page;
          totalCount.value = res.data.total_count;
          totalPages.value = res.data.total_pages;
          rowData.value = res.data.records;
          return res;
        });
    };

    const onTableChange = (page = 1, _: VObject, perPage = 15) => {
      rawDataIndex(page, perPage);
    };

    const currentStep = ref(0);
    const steps = [
      { key: 'upload', label: '上传文件' },
      { key: 'import', label: '导入' },
    ];

    const loadingDownloadTemplate = ref(false);

    const onDownloadTemplate = () => {
      loadingDownloadTemplate.value = true;
      props.store
        .sendCollectionAction({
          action: 'export_import_template',
          config: {
            responseType: 'arraybuffer',
            data: { ta_template: props.template },
          } as any,
        })
        .then(res => {
          loadingDownloadTemplate.value = false;
          const url = window.URL.createObjectURL(
            new Blob([res.data as string], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
          );
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        })
        .catch(err => {
          loadingDownloadTemplate.value = false;
          throw err;
        });
    };

    const fileItems = ref<IFile[]>([]);

    const onShow = () => (visibleImport.value = true);

    return {
      ...toRefs(props),
      loading,
      visibleImport,
      rowData,
      currentPage,
      totalCount,
      totalPages,
      onTableChange,
      dataTitles,
      keysChanged,
      optionalHeaders,
      optionalHeadersOptions,
      onCancel,
      onConfirm,
      primaryKeysOptions,
      selectedPrimaryKeys,
      onShow,
      clickFileInput: onShow, // 兼容原有外面调用代码
      currentStep,
      steps,
      onDownloadTemplate,
      fileItems,
      onImport,
      loadingDownloadTemplate,
    };
  },
});

export default TaImport;
</script>

<template lang="pug">
.ta-import
  a-tooltip
    template(#title) 导入
    .uploader
      TaTextButton(:icon='loading ? "LoadingOutlined" : "UploadOutlined"', @click='onShow')
        | 导入
      slot
      //- input.hidden(ref='fileInput', type='file', :multiple='false', @change='fileChange')
  a-modal(v-model:visible='visibleImport', :width='1280', title='导入')
    .header.px-100.mb-4
      a-steps(:current='currentStep')
        a-step(v-for='step in steps' :key='step.key' :title='step.label')
    .main(v-if='currentStep === 0')
      .pb-8.pt.6px-4.flex.justify-around
        .text-lg.text-gray-800.font-medium(class='w-1/3')
          .mb-3 1. 下载模板
          a-button(type='primary', :loading='loadingDownloadTemplate', @click='onDownloadTemplate')
            TaIcon(type='DownloadOutlined')
            | 下载模板
        .text-lg.text-gray-800.font-medium(class='w-1/3')
          .mb-3 2. 上传文件
          TaFileUploader(v-model:value='fileItems', :multiple='false')

    .main(v-else)
      a-form(labelAlign='left')
        a-form-item(label='选择参考字段', :label-col='{ span: 3 }', :wrapper-col='{ span: 18 }')
          a-select(
            v-model:value='selectedPrimaryKeys',
            mode='multiple',
            placeholder='请选择参考字段',
            style='width: 460px'
            :disabled='headers.length > 0'
          )
            a-select-option(v-for='(item, index) in primaryKeysOptions', :key='index', :value='item.key')
              | {{ item.name }}

      TaIndexTable(
        :paginatedData='rowData',
        :currentPage='currentPage',
        :totalCount='totalCount',
        :totalPages='totalPages',
        :config='{ showSizeChanger: true }',
        @change='onTableChange'
      )
        a-table-column(
          v-for='(dataTitle, index) in dataTitles',
          :key='index',
          :dataIndex='dataTitle',
          :width='120'
          :title='dataTitle',
        )
        template(#headerCell='{ title }')
          a-select(
            :value='keysChanged[dataTitles.findIndex(t => t == title)]',
            placeholder='请选择表头',
            style='width: 100%; min-width: 100px'
            :options='optionalHeadersOptions',
            @update:value='(val) => keysChanged[dataTitles.findIndex(t => t == title)] = val'
          )
          .table-title {{ title }}
    template(#footer)
      template(v-if='currentStep === 0')
        a-button.button(@click='onCancel') 取消
        a-button(type='primary', :disabled='fileItems.length !== 1', @click='onImport') 确定上传
      template(v-else)
        a-button.button(@click='onCancel') 取消
        a-button(type='primary', :loading='store.loading.value', @click='onConfirm') 确定上传
</template>

<style lang="stylus" scoped>
.hidden
  display none
.ta-import
  cursor pointer
  .uploader
    position relative
    overflow hidden
    display flex
    align-items center
    .icon
      margin-right 5px
    .file-input
      width 100%
      height 100%
      position absolute
      top 0
      left 0
      z-index 9
      display inline
      margin 0
      padding 0
      outline none
      border none
      opacity 0
  .header
    padding 14px 120px
    width 100%
    border-bottom 1px #e8e8e8 solid
    background #eee
  .main
    overflow auto
    padding 0px 20px 20px
    width 100%
    height 100%
.table-title
  padding 10px 10px 0px
  color #808080
.button
  margin-right 5px
</style>
