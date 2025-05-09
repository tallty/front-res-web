import { injectTaBuilderDesignerActiveItem } from '@/components/global/ta-component/TaBuilder/designer/useActiveItem';
import { TaBuilderComponent } from '../types';
import { computed } from '@vue/reactivity';

export const useTaBuilderDesignerAlignToolHelper = () => {
  const { activeItem } = injectTaBuilderDesignerActiveItem();

  const display = computed(() => activeItem?.value?.props?.display);

  const verticalOffset2Style = {
    'offset-1': { alignItems: 'flex-start' },
    'offset-2': { alignItems: 'center' },
    'offset-3': { alignItems: 'flex-end' },
    between: { alignItems: 'space-between' },
    around: { alignItems: 'space-around' },
  };

  const horizontalOffset2Style = {
    'offset-1': { justifyContent: 'flex-start' },
    'offset-2': { justifyContent: 'center' },
    'offset-3': { justifyContent: 'flex-end' },
    between: { justifyContent: 'space-between' },
    around: { justifyContent: 'space-around' },
  };

  const moveToX = (
    offset: 'offset-1' | 'offset-2' | 'offset-3' | 'between' | 'around',
    direction: 'vertical' | 'horizontal',
  ) => {
    if (display.value === 'flex' && activeItem) {
      if (direction === 'vertical') {
        Object.assign(activeItem.value.cssc!, { flexDirection: 'column' });
        Object.assign(activeItem.value.cssc!, verticalOffset2Style[offset]!);
      } else {
        Object.assign(activeItem.value.cssc!, { flexDirection: 'row' });
        Object.assign(activeItem.value.cssc!, horizontalOffset2Style[offset]!);
      }
    } else {
      if (direction === 'vertical') {
        moveToAlign(offset, 'x');
      } else {
        standInALine(offset, 'x');
      }
    }
  };

  const moveToY = (
    offset: 'offset-1' | 'offset-2' | 'offset-3' | 'between' | 'around',
    direction: 'vertical' | 'horizontal',
  ) => {
    if (display.value === 'flex' && activeItem) {
      if (direction === 'vertical') {
        Object.assign(activeItem.value.cssc!, { flexDirection: 'column' });
        Object.assign(activeItem.value.cssc!, horizontalOffset2Style[offset]!);
      } else {
        Object.assign(activeItem.value.cssc!, { flexDirection: 'row' });
        Object.assign(activeItem.value.cssc!, verticalOffset2Style[offset]!);
      }
    } else {
      if (direction === 'vertical') {
        standInALine(offset, 'y');
      } else {
        moveToAlign(offset, 'y');
      }
    }
  };

  // 移动到排起队 -口-口-口-
  const standInALine = (
    offset: 'offset-1' | 'offset-2' | 'offset-3' | 'between' | 'around',
    key: 'x' | 'y',
  ) => {
    const directionKey = key === 'x' ? 'w' : 'h';

    if (activeItem && activeItem.value.children && activeItem.value.cssc) {
      const containerDirection = activeItem.value.cssc[directionKey] || 0;
      const sumDirection = activeItem.value.children
        .map((item: TaBuilderComponent) => item.cssc[directionKey] || 0)
        .reduce((a, b) => a + b, 0);

      let offsetDirection = 0;

      switch (offset) {
        case 'offset-1':
          break;
        case 'offset-2':
          offsetDirection = (containerDirection - sumDirection) / 2;
          break;
        case 'offset-3':
          offsetDirection = containerDirection - sumDirection;
          break;
        default:
          break;
      }

      activeItem.value.children
        .sort((a, b) => ((a.cssc?.[directionKey] || 0) > (b.cssc?.[directionKey] || 0) ? -1 : 0))
        .forEach((item: TaBuilderComponent) => {
          item.cssc[key] = offsetDirection;
          offsetDirection += item.cssc?.[directionKey] || 0;
        });
    }
  };

  // 移动到对齐
  const moveToAlign = (
    offset: 'offset-1' | 'offset-2' | 'offset-3' | 'between' | 'around',
    key: 'x' | 'y',
  ) => {
    const directionKey = key === 'x' ? 'w' : 'h';

    if (activeItem && activeItem.value.children && activeItem.value.cssc) {
      const containerDirection = activeItem.value.cssc[directionKey] || 0;

      switch (offset) {
        case 'offset-1':
          activeItem.value.children
            .sort((a, b) =>
              (a.cssc?.[directionKey] || 0) > (b.cssc?.[directionKey] || 0) ? -1 : 0,
            )
            .forEach((item: TaBuilderComponent) => {
              item.cssc[key] = 0;
            });
          break;
        case 'offset-2':
          activeItem.value.children
            .sort((a, b) =>
              (a.cssc?.[directionKey] || 0) > (b.cssc?.[directionKey] || 0) ? -1 : 0,
            )
            .forEach((item: TaBuilderComponent) => {
              item.cssc[key] = (containerDirection - (item.cssc?.[directionKey] || 0)) / 2;
            });
          break;
        case 'offset-3':
          activeItem.value.children
            .sort((a, b) =>
              (a.cssc?.[directionKey] || 0) > (b.cssc?.[directionKey] || 0) ? -1 : 0,
            )
            .forEach((item: TaBuilderComponent) => {
              item.cssc[key] = containerDirection - (item.cssc?.[directionKey] || 0);
            });
          break;
        default:
          break;
      }
    }
  };

  return {
    moveToX,
    moveToY,
  };
};
