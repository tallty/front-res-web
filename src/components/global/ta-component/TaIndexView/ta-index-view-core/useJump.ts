export const bpmType = ['Bpm::Token', 'Bpm::Instance'];
export const planType = ['Plan::Token'];

export const jumpList = [...bpmType, ...planType];

export const isOutSide = (v: string) => {
  if (bpmType.includes(v)) return true;
  if (planType.includes(v)) return true;
  return false;
};
export const getComponentId = (v: any) => {
  if (!v) return;
  if (v.notifyable_type === 'Bpm::Token') return v?.meta?.instance_id;
  if (v.notifyable_type === 'Bpm::Instance') return v?.meta?.instance_id;
  if (planType.includes(v.notifyable_type)) return v?.meta?.task_id;
  return v.id;
};

export const getDynamicComponentName = (v: any): string[] => {
  let res = v?.notifyable_type.split('::');
  if (bpmType.includes(v?.notifyable_type) && v?.flowable_type) {
    res = v?.flowable_type.split('::');
  }
  return res;
};
