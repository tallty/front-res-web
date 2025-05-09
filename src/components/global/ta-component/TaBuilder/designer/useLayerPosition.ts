import { TaBuilderComponent } from '../types';

export const useLayerPosition = () => {
  const getContainerPosition = (item: TaBuilderComponent) => {
    if (item.props?.display === 'flex') {
      return 'TaBuilderDesignerFlexContainer';
    }
    return 'DraggableContainer';
  };

  const getCellAttrs = (item: TaBuilderComponent) => {
    if (item.props?.display === 'flex') {
      return { draggable: false };
    }
    return {};
  };
  return { getContainerPosition, getCellAttrs };
};
