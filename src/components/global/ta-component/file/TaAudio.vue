<script lang="ts">
import { PropType, ref, watch, toRefs, onMounted, onUnmounted, defineComponent } from 'vue';
import 'aplayer/dist/APlayer.min.css';
import APlayer from 'aplayer';

const TaAudio = defineComponent({
  name: 'TaAudio',
  props: {
    src: { type: String, required: true },
    name: { type: String, required: true },
    options: { type: Object, default: () => ({}) },
  },
  setup(props) {
    const player = ref<any>(null);
    const audioPlayer = ref(null);

    const refreshAudio = () => {
      if (audioPlayer.value) {
        player.value = new APlayer({
          container: audioPlayer.value,
          autoplay: false,
          audio: [
            {
              name: props.name,
              artist: ' ',
              url: props.src,
            },
          ],
        });
      }
    };

    watch(() => props.src, refreshAudio);
    watch(() => props.options, refreshAudio, { deep: true });

    onMounted(() => refreshAudio());

    onUnmounted(() => {
      if (player.value) {
        player.value.destroy();
      }
    });

    return {
      ...toRefs(props),
      audioPlayer,
    };
  },
});
export default TaAudio;
</script>

<template lang="pug">
.ta-audio(ref='audioPlayer')
</template>

<style lang="css"></style>
