<script lang='ts'>
import { ref, defineComponent, toRefs } from 'vue';
import useClipboard from './ta-template-form-core/useClipboard';

let message: any = null;
try {
  message = require('ant-design-vue')?.message;
} catch (error) {
  console.log('不支持antd message');
  message = {
    success: (content: string, duration?: number) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('复制成功', {
          body: content
        });
      } else {
        alert('复制成功');
      }
    }
  };
}

const TaCopy = defineComponent({
  name: 'TaCopy',
  props: {
    value: { type: String, default: undefined },
  },
  setup(props, { emit }) {
    const { copyToClipboard } = useClipboard();

    const copy = (text: string) => {
      copyToClipboard(text).then(res => {
        if (res) {
          message.success('复制成功', 1)
          emit('success', text)
        }
      })
    }
    return {
      ...toRefs(props),
      copy,
    };
  },
});
export default TaCopy;
</script>

<template lang="pug">
div.ta-copy.cursor-pointer(
  class='hover:underline'
  @click.stop='copy(value)'
)
  slot
    | {{ value }}
</template>

<style lang="stylus" scoped></style>
