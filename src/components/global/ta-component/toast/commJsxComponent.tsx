import { extend } from 'lodash';
import { PropType, defineComponent } from 'vue';
// import { JSX } from 'vue/jsx-runtime';

export const commProps = extend(
  {},
  {
    jsxFunction: {
      type: Function as PropType<(record?: any) => any>,
      default: () => () => null,
      required: true,
    },
  },
);

export default defineComponent({
  name: 'CommJsxComponent',
  props: commProps,
  setup(props) {
    return () => {
      return <>{props.jsxFunction()}</>;
    };
  },
});
