import { computed } from 'vue';
import colors from 'windicss/colors';


const cantUseColors = ['transparent', 'inherit', 'current', 'black', 'white'];

export default function useColor(
  props: any,
  defaultTextColorWeight: number = 800,
  defaultBgWeight: number = 100
) {
  const isSupportColor = computed(() => {
    return !cantUseColors.includes(props.color) && props.color in colors;
  });
  const computedColor = computed(() => {
    if (!isSupportColor.value) {
      return 'black';
    }
    return (colors as any)[props.color][defaultTextColorWeight];
  });
  const computedBg = computed(() => {
    if (!isSupportColor.value) {
      return 'white';
    }

    return (colors as any)[props.color][defaultBgWeight];
  });

  return {
    isSupportColor,
    computedColor,
    computedBg,
  };
}
