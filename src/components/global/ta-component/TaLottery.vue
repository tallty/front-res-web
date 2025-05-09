<template lang="pug">
.w-full.h-full.bg-cover.bg-center(:style='{backgroundImage:`url(${config.defaultBg})`}' :class='config?.wrapperCss')
  .w-full.h-full.grid.grid-cols-3(:class='config?.innerCss')
    .w-full.h-full(v-for='(item,index) in list')
      template(v-if='item.type === "action"')
        slot(name='action' :record='item' :actions='{onStart:startLottery}' )
      template(v-if='item.type === "lottery"' )
        slot(name='lottery' :record='item' :isOn='current === index+1')
</template>
<script lang="ts" setup>
import { ref } from 'vue';

export interface LotteryItemProps {
  type: 'lottery' | 'action';
  [props: string]: any;
}
export interface LotteryProps {
  config: {
    // 默认大底图
    defaultBg?: string;
    // 默认大底样式
    wrapperCss?: string;
    innerCss?: string;
  };
  list: Array<LotteryItemProps>;
  speed: number;
  rounds: number;
  actionIndex?: number;
}
const props = withDefaults(defineProps<LotteryProps>(), {
  config: () => ({}),
  list: () => [],
  speed: 200,
  rounds: 50,
});

const emit = defineEmits<{
  (e: 'endLottery', v?: number): void;
}>();

// 当前转动次数
const turns = ref(0);
// 转动基数
const rounds = ref(props.rounds || 50);
// 中奖位置
const prize = ref(-1);
// 转速 - 定时器间隔 => 会动态变化
const speed = ref(props.speed || 200);
// 当前位置
const current = ref(0);

// 计时器
const timer = ref<any>(null);

// 转动时的状态
const disabled = ref(false);

// 开始抽奖
const startLottery = (v?: number) => {
  if (disabled.value) return;
  resetLottery();

  if (v) {
    prize.value = v;
  }
  startRoll();
  disabled.value = true;
};

// 设置中奖位
const setPrize = (v: number) => {
  prize.value = v;
};

// 重置转盘
const resetLottery = () => {
  turns.value = 0;
  speed.value = props.speed || 200;
  current.value = 0;
  clearTimeout(timer.value);
};

const Rolling = () => {
  let index = current.value;
  index += 1;
  if (index === props.actionIndex) index += 1;
  if (index > props.list.length) index = 1;
  current.value = index;
};

const startRoll = () => {
  turns.value = turns.value + 1;
  Rolling();
  if (turns.value > rounds.value + 10 && prize.value === current.value) {
    clearTimeout(timer.value);
    emit('endLottery', prize.value);
    disabled.value = false;
  } else {
    if (turns.value < rounds.value) {
      speed.value = speed.value - 10;
    } else if (turns.value === rounds.value) {
      // 也可以在这里去指定中奖位，当前无需求，预留
      // const index = parseInt(String(Math.random() * 10), 0) || 1;
      // prize.value = 9; // 中奖位
    } else if (
      turns.value > rounds.value + 10 &&
      ((prize.value === 0 && current.value === prize.value) || prize.value === current.value + 1)
    ) {
      speed.value = speed.value + 10;
    } else {
      speed.value += 20;
    }
    if (speed.value < 40) {
      speed.value = 40;
    }
    clearTimeout(timer.value);
    timer.value = setTimeout(startRoll, speed.value);
  }
};

defineExpose({ startLottery, setPrize, disabled });
</script>
<style lang="stylus"></style>
