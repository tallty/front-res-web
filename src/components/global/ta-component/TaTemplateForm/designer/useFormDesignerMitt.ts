import mitt from 'mitt';

const emitter = mitt();

const useFormDesignerMitt = () => {
  return { emitter };
};

export default useFormDesignerMitt;
