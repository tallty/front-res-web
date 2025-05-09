<script lang="ts">
/**
 * 文件上传器
 *  slot 内容，只接受 Button 触发，不可使用 @click.stop
 * Events:
 * add (fileItem, fileItems)
 * start (fileItem, fileItems)
 * progress (fileItem)
 * onSuccess (fileItem)
 * error (fileItem, error)
 * preview (fileItem)
 * remvoe (fileItem, index)
 *
 * update:value 事件参数:
 *  fileItems.value 总的文件列表，包含所有可能的状态文件
 *  statusFiles 按照状态分组的文件列表
 *  allSettled 文件列表是否都已处理完毕，文件状态为 成功 或 失败
 * update:value (allFileItems, { todo: [], doing: [], done: [], error: [] }, isAllSettled: boolean)
 */

import FileServer, { IFile } from './servers';
import TaAttachments from './TaAttachments.vue';
import Axios, { Canceler } from 'axios';
import { defineComponent, ref, watch, PropType, toRefs, onMounted, computed } from 'vue';
import { VObject } from '@/lib/vails/model';
import { message } from 'ant-design-vue';
import { readFileAsync } from './readFileAsync';
let dynamicCom = null;
let dynamicCom2 = null;
let has_disk = false;
try {
  dynamicCom = require('@/engines/disk/components/disk/modal/ComChooseDiskPathOrItem.vue').default;
  dynamicCom2 = require('@/engines/disk/components/disk/items/ComMoveFile.vue').default;
  has_disk = true;
} catch (e) {
  dynamicCom = null;
}

const TaFileUploaderWithDisk = defineComponent({
  name: 'TaFileUploaderWithDisk',
  components: { TaAttachments, dynamicCom, dynamicCom2 },
  props: {
    value: { type: Array as PropType<IFile[]>, default: () => [] }, // file 对象数组
    defaultValue: { type: Array as PropType<IFile[]>, default: () => [] }, // file 对象数组
    useCdn: { type: Boolean, default: false }, // 是否使用 CDN
    // 是否所有文件都已处理完毕，状态都是：[onSuccess, error]
    isAllSettled: { type: Boolean, default: false },
    chunkSize: { type: Number, default: Number(5 * 1024 * 1024) }, // 分片大小
    accept: { type: String, default: '*' },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: true },
    checkFile: { type: Boolean, default: FileServer.checkFile }, // 是否检查文件存在性
    chunkable: { type: Boolean, default: FileServer.chunkable }, // 是否启用分片上传
    concurrency: { type: Boolean, default: FileServer.concurrency }, // 是否启用分片上传
    showList: { type: Boolean, default: true }, // 是否显示列表
    removeAfteronSuccess: { type: Boolean, default: false }, // 上传之后是否从列表移除
    limitMb: { type: Number, default: 500 }, // 文件允许最大尺寸 30MB
    options: {
      type: Object,
      default: () => {
        return { fileSize: 10 };
      },
    },
    mode: {
      type: String,
      default: () => 'upload',
    },
  },
  emits: [
    'update:value',
    'add',
    'start',
    'progress',
    'onSuccess',
    'error',
    'remove',
    'update:isAllSettled',
    'statusChange',
    'allSettle',
    'preview',
  ],
  setup(props, { emit }) {
    let fileServer = new FileServer({
      useCdn: false,
    });
    const fileItemsCache = ref<IFile[]>([]);

    const fileItems = computed<IFile[]>({
      get: () => fileItemsCache.value.filter(i => i),
      set: val => (fileItemsCache.value = props.multiple ? val : val ? [val[val.length - 1]] : []),
    });

    const isComputing = ref(false);

    const fileInput = ref<any>(null);

    watch(
      () => props.defaultValue,
      () => {
        if (props.defaultValue.length > 0 && props.value.length === 0) {
          emit('update:value', props.defaultValue);
        }
      },
      { deep: true, immediate: true },
    );

    onMounted(() => {
      // 因为存在暂存，所以初始化时为 doing 和 todo 的触发一次验证
      fileItems.value.forEach(item => {
        if (item.status === 'doing' || item.status === 'todo') {
          emit('start', item, fileItems.value);
        }
      });
      resetFileCheked();
    });

    watch(
      () => props.value,
      () => {
        fileItems.value = (Array.isArray(props.value) ? props.value : []).concat().map(
          (item: IFile): IFile => ({
            ...item,
            // file: new File([], item.fileName),
            // chunkSize: props.chunkSize,
            // chunks: Math.ceil(item.fileSize / props.chunkSize),
            // chunkId: 0,
            // loaded: 0,
            // percent: 0,
            // status: 'done',
          }),
        );
      },
      { immediate: true, deep: true },
    );

    watch(
      () => props.useCdn,
      () => {
        fileServer = new FileServer({
          useCdn: props.useCdn,
        });
      },
      { immediate: true },
    );

    const mergeFileItem = (fileItem: IFile, payload: VObject) => {
      const fileItemCopy = Object.assign(fileItem, payload);
      const index = fileItems.value.findIndex((f: IFile) => f.fileKey === fileItemCopy.fileKey);

      if (index >= 0) {
        fileItems.value[index] = fileItemCopy;
        fileItems.value = [...fileItems.value];
      }
    };

    const handleFileInputChange = (e: any) => {
      const addFileHandlers = [...e.target.files].map(addFile);
      visibleFileType.value = false;
      fileInput.value.value = [];
      return Promise.all(addFileHandlers).finally(() => {
        onChange();
      });
    };

    const addFile = async (file: File) => {
      isComputing.value = true;
      // const fileCategory = FileServer.getFileCategory(file);
      if (file.size > props.options.fileSize * 1024 * 1024) {
        message.warning(`【${file.name}】文件尺寸超过 ${props.options.fileSize}MB 大小限制。`);
        isComputing.value = false;
        return;
      }
      /* if (fileCategory === 'audio' && file.size > 30 * 1024 * 1024) {
        message.warning(`【${file.name}】文件尺寸超过 30MB 大小限制。`);
        isComputing.value = false;
        return;
      } else if (fileCategory === 'application' && file.size > props.limitMb * 1024 * 1024) {
        message.warning(`【${file.name}】文件尺寸超过 ${props.limitMb}MB 大小限制。`);
        isComputing.value = false;
        return;
      } else if (file.size > props.limitMb * 1024 * 1024) {
        message.warning(`【${file.name}】文件尺寸超过 ${props.limitMb}MB 大小限制。`);
        isComputing.value = false;
        return;
      } */

      try {
        const fileItem: IFile = await fileServer.getFileItem({
          file,
          chunkSize: props.chunkSize,
          shouldCompress: true,
        });

        isComputing.value = false;
        if (fileItems.value.find((f: IFile) => f.fileKey === fileItem.fileKey)) {
          message.warning('文件已经在上传列表中');
          return;
        }
        fileItems.value.push(fileItem);
        fileItems.value = [...fileItems.value];
        emit('add', fileItem, fileItems.value);
        // begin upload
        await start(fileItem);
      } catch (err) {
        isComputing.value = false;
      }
    };

    const sessionFiles = ref<Record<string, any>>({});
    // Start fileItem upload logic.
    const start = async (fileItem: IFile) => {
      sessionFiles.value = {
        ...sessionFiles.value,
        [fileItem.fileKey]: { ...sessionOptions.value },
      };
      mergeFileItem(fileItem, { status: 'doing', loaded: 0, chunkId: 0, percent: 0.2 });

      emit('start', fileItem, fileItems.value);

      // if (props.chunkable) {
      if (props.chunkable && fileItem.file.size > 5 * 1024 * 1024) {
        if (props.concurrency) {
          await concurrencyUploadChunk(fileItem);
        } else if (props.checkFile) {
          await checkChunk(fileItem);
        } else {
          await uploadChunk(fileItem);
        }
      } else {
        await uploadFile(fileItem);
      }
    };

    // Upload file directly.
    const uploadFile = async (fileItem: IFile) => {
      mergeFileItem(fileItem, { status: 'doing', percent: 0.2 });

      try {
        const { data } = await fileServer.upload(fileItem, {
          onUploadProgress: (e: ProgressEvent) => {
            updateProgress(e, fileItem);
          },
        });

        try {
          mergeFileItem(fileItem, data);
          onSuccess(fileItem);
          delayHideProgressBar(fileItem);
          // console.log(fileItem);
        } catch (err) {
          onError(err, fileItem);
        }
      } catch (err) {
        onError(err, fileItem);
      }
    };

    // Upload with slice file into many chunks.
    const checkChunk = async (fileItem: IFile) => {
      try {
        const { data } = await fileServer.checkChunk(fileItem);
        if (data.exist) {
          delayHideProgressBar(fileItem);
          mergeFileItem(fileItem, { ...data.stats, ...data });
          onSuccess(fileItem);
        } else {
          await uploadChunk(fileItem);
        }
      } catch (err) {
        onError(err, fileItem);
      }
    };

    const uploadChunk = (fileItem: IFile) => {
      mergeFileItem(fileItem, { status: 'doing', percent: 0.2 });

      const { chunks, file } = fileItem;
      const fileReader: FileReader = new FileReader();

      const loadNextChunk = () => {
        const { chunkSize, fileSize, chunkId } = fileItem;
        const start = chunkId * chunkSize;
        const end = start + chunkSize >= fileSize ? fileSize : start + chunkSize;
        fileReader.readAsArrayBuffer(file.slice(start, end));
      };

      const resultPromise = new Promise<void>((resolve, reject) => {
        fileReader.onload = async () => {
          try {
            const chunkBlob = new Blob([fileReader.result as ArrayBuffer]);
            const { data } = await fileServer.chunkUpload(
              {
                ...fileItem,
                file: chunkBlob,
                chunks,
              },
              {
                onUploadProgress: (e: ProgressEvent) => {
                  updateProgress(e, fileItem);
                },
                cancelToken: new Axios.CancelToken((c: Canceler) => {
                  fileItem._cancel = c;
                }),
              } as any,
            );
            // 检查已上传分片, 支持断点续传，新版文件服务，上传成功后，chunks 为 true，做兼容
            if (data.chunks === true) {
              fileItem.chunkId = fileItem.chunks;
            } else {
              const uploadedChunks = data.chunks && data.chunks.length ? data.chunks : [0];
              const nextChunkId = Math.max(...uploadedChunks) + 1;
              if (fileItem.chunkId < nextChunkId) {
                fileItem.chunkId = nextChunkId;
              } else {
                // 保护：防止接口返回的是相同的 chunkId, 造成死循环
                onError(new Error('重复上传分片，请检查接口返回的 chunks 数组。'), fileItem);
              }
            }

            if (fileItem.chunkId < fileItem.chunks) {
              loadNextChunk();
            } else {
              mergeFileItem(fileItem, data);
              onSuccess(fileItem);

              resolve();

              delayHideProgressBar(fileItem);
            }
          } catch (err) {
            onError(err, fileItem);
            reject(err);
          }
        };
        fileReader.onerror = error => {
          reject(error);
          throw error;
        };
      });

      loadNextChunk();
      return resultPromise;
    };

    const updateProgress = (event: ProgressEvent, fileItem: IFile) => {
      const uploadedSize = fileItem.chunkId * fileItem.chunkSize;
      const percent = Math.floor(((event.loaded + uploadedSize) / fileItem.fileSize) * 100);
      fileItem.percent = percent > 0.2 ? percent : 0.2;
      fileItem.loaded = event.loaded;
      renderProgress(fileItem);
    };

    const attachmentsRef = ref<any>(null);

    const renderProgress = (fileItem: IFile) => {
      emit('progress', { ...fileItem });
      // 数组内对象无法监听到里面 key 的 value 变化
      attachmentsRef.value?.renderProgress?.(fileItem.fileKey, fileItem.percent);
    };

    const concurrencyUploadChunk = (fileItem: IFile) => {
      const { chunkSize, fileSize, file } = fileItem;
      const total = Math.ceil(fileSize / chunkSize);
      fileItem.chunks = total;
      const tasks: Promise<void>[] = [];
      const progressAry: number[] = [];
      for (let i = 0; i < total; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize >= fileSize ? fileSize : start + chunkSize;
        tasks.push(
          readFileAsync(file.slice(start, end)).then(async (result: ArrayBuffer) => {
            const chunkBlob = new Blob([result]);
            await fileServer.chunkUpload({ ...fileItem, file: chunkBlob, chunkId: i }, {
              onUploadProgress: (e: ProgressEvent) => {
                progressAry[i] = e.loaded;
                const percent = Math.floor(
                  (progressAry.reduce((a, b) => a + b, 0) / fileItem.fileSize) * 100,
                );
                fileItem.percent = percent > 0.2 ? percent : 0.2;
                renderProgress(fileItem);
              },
              cancelToken: new Axios.CancelToken((c: Canceler) => {
                fileItem._cancel = c;
              }),
            } as any);
          }),
        );
      }

      return Promise.all(tasks)
        .then(async () => {
          await fileServer.chunkComplete(fileItem);
        })
        .then(() => {
          mergeFileItem(fileItem, fileItem);
          onSuccess(fileItem);
          delayHideProgressBar(fileItem);
        })
        .catch((e: Error) => {
          onError(e, fileItem);
        });
    };

    const onSuccess = (fileItem: IFile) => {
      mergeFileItem(fileItem, {
        fileCategory: fileItem?.fileCategory || FileServer.getFileCategory(fileItem.file), // 后端返回数据存在不准确情况，使用浏览器标准 File
        mimeType: fileItem.file.type, // 后端返回数据存在不准确情况，使用浏览器标准 File
        loaded: fileItem.fileSize,
        percent: 100,
        status: 'done',
      });

      const freshFn = sessionFiles.value?.[fileItem.fileKey]?.freshFn;

      const _next = () => {
        delete fileItem._cancel;
        freshFn && freshFn?.(fileItem, sessionFiles.value?.[fileItem.fileKey]);
        if (needSavedWithDisk.value && filedChecked.value.visible && filedChecked.value?.create) {
          (filedChecked.value?.create as any)(fileItem);
        }
        emit('onSuccess', fileItem);
        onChange();
        if (props.removeAfteronSuccess) {
          const index = fileItems.value.findIndex(f => f.fileKey === fileItem.fileKey);
          if (index >= 0) {
            fileItems.value.splice(index, 1);
          }
        }
      };
      if ('videoaudio'.indexOf(fileItem.fileCategory.toLocaleLowerCase()) >= 0) {
        const _mediaDom = new Audio();
        const _removeMediaAndNext = () => {
          _mediaDom.removeAttribute('src');
          _next();
        };
        // 设置媒体对象预加载数据
        _mediaDom.setAttribute('preload', 'metadata');

        // 媒体文件类型正确
        _mediaDom.addEventListener('loadedmetadata', () => {
          mergeFileItem(fileItem, {
            duration: ~~(_mediaDom.duration * 100) / 100,
          });
          _removeMediaAndNext();
        });

        // 媒体文件类型不正确，不阻塞业务向后进行
        _mediaDom.addEventListener('error', () => {
          _removeMediaAndNext();
        });

        _mediaDom.src = fileItem.url || '';
      } else {
        _next();
      }
    };

    const onError = (error: any, fileItem: IFile) => {
      mergeFileItem(fileItem, {
        percent: 0,
        status: 'error',
      });
      emit('error', fileItem, error);
      message.error(`「${fileItem.fileName}」上传失败，请重试。${error.message}`);
      onChange();
    };

    const remove = async (fileItem: IFile, index: number) => {
      if (fileItem._cancel) {
        fileItem._cancel();
      }
      emit('remove', fileItems.value[index], index);
      fileItems.value.splice(index, 1);
      onChange();
    };

    /**
     * 事件参数:
     *  fileItems.value 总的文件列表，包含所有可能的状态文件
     *  statusFiles 按照状态分组的文件列表
     *  allSettled 文件列表是否都已处理完毕，文件状态为 成功 或 失败
     */
    const onChange = () => {
      const todoFiles = fileItems.value.filter((file: IFile) => file.status === 'todo');
      const doingFiles = fileItems.value.filter((file: IFile) => file.status === 'doing');
      const doneFiles = fileItems.value.filter((file: IFile) => file.status === 'done');
      const errorFiles = fileItems.value.filter((file: IFile) => file.status === 'error');

      const allSettled =
        todoFiles.length === 0 && doingFiles.length === 0 && errorFiles.length === 0;
      const statusFiles = {
        todo: todoFiles,
        doing: doingFiles,
        done: doneFiles,
        error: errorFiles,
      };
      emit('update:value', [...fileItems.value], statusFiles, allSettled);
      emit('update:isAllSettled', allSettled); // 同步 isAllSettled 状态
      emit('statusChange', allSettled); // 文件列表状态
      if (allSettled) {
        emit('allSettle', doneFiles, errorFiles); // 如果都处理完毕，发送事件
      }
    };

    const sessionOptions = ref<any>({});
    const clickFileInput = (options: any = {}) => {
      if (has_disk) {
        visibleFileType.value = true;
        sessionOptions.value = {
          ...options,
        };
      } else {
        openFile();
      }

      // fileInput.value.click();
    };

    const preview = (fileItem: IFile) => {
      emit('preview', fileItem);
    };

    const delayHideProgressBar = (fileItem: IFile) => {
      mergeFileItem(fileItem, { percent: 99.9 });
      setTimeout(() => {
        mergeFileItem(fileItem, { percent: 100 });
      }, 500);
    };

    const needSavedWithDisk = ref(false);
    const openFile = () => {
      fileInput.value.click();
      if (filedChecked.value.visible && filedChecked.value?.create) {
        needSavedWithDisk.value = true;
      }
    };
    const visibleFileType = ref(false);
    const filedChecked = ref({
      visible: false,
      path_id: null,
      create: null,
    });
    // const chooseTypeModal = () => {
    //   visibleFileType.value = true;
    // };

    const resetFileCheked = () => {
      filedChecked.value = {
        visible: false,
        path_id: null,
        create: null,
      };
    };

    const closeModal = () => {
      visibleFileType.value = false;
      console.log('v====>');
      resetFileCheked();
    };

    watch(
      () => props.mode,
      () => {
        if (props.mode === 'disk') {
          resetFileCheked();
        }
      },
      { immediate: true },
    );

    const showDynamic = ref(false);

    const uploadWithDisk = () => {
      showDynamic.value = true;
    };
    const dynamicChoosed = (v: IFile) => {
      console.log(v);
      closeModal();
      fileItems.value = [...fileItems.value, v];
      sessionFiles.value = {
        ...sessionFiles.value,
        [v.fileKey]: { ...sessionOptions.value },
      };
      onChange();
      onSuccess(v);
    };

    const dynamicPathCheck = (v: any) => {
      filedChecked.value = {
        ...filedChecked.value,
        ...v,
      };
    };

    const pathcheckVisible = ref(false);
    const overWritePath = () => {
      pathcheckVisible.value = true;
    };
    return {
      ...toRefs(props),
      fileInput,
      clickFileInput,
      isComputing,
      handleFileInputChange,
      fileItems,
      start,
      remove,
      preview,
      openFile,
      attachmentsRef,
      fileItemsCache,
      visibleFileType,
      filedChecked,
      closeModal,
      showDynamic,

      has_disk,
      uploadWithDisk,
      dynamicChoosed,
      overWritePath,
      pathcheckVisible,
      dynamicPathCheck,
    };
  },
});

export default TaFileUploaderWithDisk;
</script>

<template lang="pug">
.ta-file-uploader.w-full

  a-modal(v-model:visible="visibleFileType", title="上传" , :footer='null' width='416px' @cancel='closeModal')
    .w-full.h-15.rounded-lg.px-4.flex.items-center.cursor-pointer(class='bg-[#f6fbff]' @click='uploadWithDisk')
      img.w-8.h-8(class='mr-[10px]' src='https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/upload_yun_icon.png')
      .text-base.font-medium.text-gray-900 从线上资源库选择
    .w-full.p-4.mt-4.rounded-lg.cursor-pointer(class='bg-[#f3fbfb]')
      .flex.items-center(@click.stop='openFile')
        img.w-8.h-8(class='mr-[10px]' src='https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/disk/upload_pc_icon.png')
        .text-base.font-medium.text-gray-900 从电脑文件上传
      //- .w-full.mt-2(v-if='mode !== "disk"')
      .w-full.mt-2()
        a-checkbox(v-model:checked="filedChecked.visible")
          .text-gray-500 上传并保存至资源库
      .w-full.mt-2.flex.items-center(v-if='filedChecked.visible')
        .text-sm.text-gray-500 保存位置：
        .text-xs.text-gray-900 {{ filedChecked.path_name || "我的文件" }}
        .text-gray-500.flex.items-center.cursor-pointer.ml-2(@click='overWritePath') 更换
          TaIcon.w-3.h-3(type='outline/chevron-right')

  .trigger-box(v-if='!disabled', @click.stop='clickFileInput')
    input.file-input(
      ref='fileInput',
      type='file',
      :value='[]',
      :accept='accept',
      :multiple='multiple',
      :disabled='disabled',
      @click.stop=''
      @change='handleFileInputChange'
    )
    slot
      a-button(type='primary', :disabled='disabled', :loading='isComputing')
        TaIcon(type='UploadOutlined')
        | 选择文件

  .file-list(v-if='showList && fileItemsCache.length || mode === "disk"')
    slot(name='attachments', :fileItems='fileItemsCache', :actions='{ remove, start, preview }')
      TaAttachments(
        ref='attachmentsRef',
        :attachments='fileItems',
        :showActions='!disabled',
        @restart='start',
        @remove='remove',
        @preview='preview'
      )
  component(is='dynamicCom' v-if='showDynamic' @success='dynamicChoosed' v-model:visible="showDynamic"  mode='checked')
  component(is='dynamicCom2' v-if='has_disk' @success='dynamicPathCheck' v-model:visibleMove='pathcheckVisible' mode='disk')
</template>

<style lang="stylus" scoped>
$contentHeight = 36px

.ta-file-uploader
  display inline-block
  .trigger-box
    position relative
    display inline-block
    width 100%
    .file-input
      position absolute
      top 0
      left 0
      display inline
      margin 0
      padding 0
      width 0px
      height 0px
      outline none
      border none
      opacity 0
    button
      *
        pointer-events none
  .file-list
    padding-top 10px
</style>
