<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import { getMpQrcode } from './ta-template-form-core/useMpQrcode';

const TaShareQrcode = defineComponent({
  name: 'TaShareQrcode',
  components: {},
  props: {
    placement: { type: String, default: 'right' },
    width: { type: Number, default: 700 },
    path: { type: String, required: true },
    scene: { type: String, default: '' },
  },
  setup(props) {
    const qrcodeUrl = computed(() => getMpQrcode(props.path, props.scene, props.width));
    const onDownloadQrcode = () => {
      downloadImgByBase64(qrcodeUrl.value);
    };

    const downloadImgByBase64 = (url: string) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        // 将img中的内容画到画布上
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // 将画布内容转换为base64
        const base64 = canvas.toDataURL();
        // 创建a链接
        const a = document.createElement('a');
        a.href = base64;
        a.download = '';
        // 触发a链接点击事件，浏览器开始下载文件
        a.click();
      };
      img.src = url;
      // 必须设置，否则canvas中的内容无法转换为base64
      img.setAttribute('crossOrigin', 'Anonymous');
    };

    return {
      ...toRefs(props),

      qrcodeUrl,
      onDownloadQrcode,
    };
  },
});
export default TaShareQrcode;
</script>

<template lang="pug">
.ta-share-qrcode
  a-tooltip(:placement='placement')
    slot
    template(#title)
      .bg-white.py-4.px-6.relative
        img.mb-4(:src='qrcodeUrl')
        .download.absolute.cursor-pointer.bottom-2.right-2.text-xs.font-medium(@click='onDownloadQrcode')
          TaIcon(type='DownloadOutlined', :size='20')
          | 下载图片
</template>

<style lang="stylus" scoped>
.download
  color $primary-color
</style>
