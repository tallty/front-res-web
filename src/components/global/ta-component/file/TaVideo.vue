<script lang="ts">
/**
 * Events:
 *  ready(vueInstance)
 */
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js';
import zhConfig from 'video.js/dist/lang/zh-CN.json';
import 'video.js/dist/video-js.css';
import {
    computed,
    defineComponent,
    onMounted,
    onUnmounted,
    PropType,
    ref,
    toRefs,
    watch,
} from 'vue';

videojs.addLanguage('zh-CN', zhConfig);

const TaVideo = defineComponent({
  name: 'TaVideo',
  props: {
    src: { type: String, required: true },
    type: { type: String, required: true, default: 'video/mp4' },
    options: { type: Object as PropType<VideoJsPlayerOptions>, default: () => ({}) },
    poster: { type: String, required: false },
  },
  emits: ['ready', 'ended'],
  setup(props, { emit }) {
    const player = ref<VideoJsPlayer | null>(null);
    const videoPlayer = ref<any>(null);
    const defaultOptions: VideoJsPlayerOptions = {
      language: 'zh',
      autoplay: false,
      controls: true,
      loop: false,
      fluid: true,
      aspectRatio: '16:9',
      playbackRates: [0.5, 1, 1.5, 2],
      html5: {
        vhs: {
          overrideNative: true,
          fastPlayThreshold: 10,
        },
      },
      sources: [
        {
          src: props.src,
          type: props.type,
        },
      ],
    };

    const opts = computed(() => ({
      ...defaultOptions,
      ...props.options,
    }));

    const refreshVideo = () => {
      if (videoPlayer.value as any) {
        videoPlayer.value.addEventListener('ended', () => {
          console.log('视频播放完成');
          emit('ended');
        });
        player.value = videojs(videoPlayer.value, opts.value, function (this: any) {
          emit('ready', this);
        });
      }
    };

    watch(() => props.src, refreshVideo);
    watch(() => props.options, refreshVideo, { deep: true });

    onMounted(() => refreshVideo());

    onUnmounted(() => {
      if (player.value) {
        player.value.dispose();
      }
    });

    const container = ref<any>(null);

    const minHeight = computed(() => {
      return container.value?.clientWidth
        ? `${
            (opts.value.aspectRatio
              ?.split(':')
              ?.map((i: string) => Number(i))
              ?.reduce((a: number, b: number) => a / b, 1) || 0.75) * container.value?.clientWidth
          }px`
        : '';
    });

    return {
      ...toRefs(props),
      videoPlayer,
      minHeight,
    };
  },
});
export default TaVideo;
</script>

<template lang="pug">
.container.w-full.overflow-hidden(ref='container', :style='{ minHeight }')
  video.video-js.vjs-theme-sea.vjs-fluid(ref='videoPlayer' :poster='poster')
</template>

<style lang="css">
.vjs-theme-sea .vjs-big-play-button {
  top: 50%;
  left: 50%;
  width: 103px;
  height: 79px;
  margin: -51.5px auto 0 -39.5px;
  -o-object-fit: contain;
  object-fit: contain;
  line-height: 79px;
  background-color: hsla(0, 0%, 100%, 0.25);
  border: none;
  border-radius: 30px;
}
.vjs-theme-sea .vjs-control-bar {
  height: 4em;
  background-color: hsla(0, 0%, 100%, 0.4);
}
.vjs-theme-sea .vjs-button:hover {
  color: #4176bc;
  background: linear-gradient(0deg, #d0ddee, #fff);
}
.vjs-theme-sea .vjs-button > .vjs-icon-placeholder:before {
  line-height: 2.2;
}
.vjs-theme-sea .vjs-time-control {
  line-height: 4em;
}
.vjs-theme-sea .vjs-picture-in-picture-control,
.vjs-theme-sea .vjs-volume-panel {
  display: none;
}
.vjs-theme-sea .vjs-progress-control .vjs-play-progress {
  background-color: rgba(65, 118, 188, 0.9);
}
.vjs-theme-sea .vjs-progress-control .vjs-play-progress:before {
  display: none;
}
.vjs-theme-sea .vjs-progress-control .vjs-slider {
  background-color: rgba(65, 118, 188, 0.1);
}
.vjs-theme-sea .vjs-progress-control .vjs-load-progress div {
  background: hsla(0, 0%, 100%, 0.5);
}
.vjs-theme-sea .vjs-progress-control .vjs-progress-holder {
  height: 100%;
  margin: 0;
}
.vjs-theme-sea .vjs-progress-control .vjs-time-tooltip {
  color: #fff;
  background-color: rgba(65, 118, 188, 0.5);
}
.vjs-theme-sea .vjs-progress-control .vjs-mouse-display .vjs-time-tooltip {
  color: #4176bc;
  background-color: hsla(0, 0%, 100%, 0.7);
}
</style>
