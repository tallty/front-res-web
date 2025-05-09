export const hasPermission = (
  values: string[] | string,
  powers: string[],
  mode: 'every' | 'not' | 'some'
) => {
  if (mode === 'not') {
    if (Array.isArray(values)) {
      return !powers.some((o) => values.includes(o));
    }
    if (typeof powers === 'string' && !!powers) {
      return !values.includes(powers);
    }
  } else {
    if (Array.isArray(values)) {
      return mode === 'every'
        ? powers.every((o) => values.includes(o))
        : powers.some((o) => values.includes(o));
    }
    if (typeof powers === 'string' && !!powers) {
      return values.includes(powers);
    }
  }
  return true;
};

export const hasPermissionDirectiveCallback = (
  el: any,
  binding: any,
  values: string[] | []
) => {
  const powers = binding.value;

  if (powers) {
    let mode: 'every' | 'some' | 'not' = 'some';
    if (binding.modifiers.every) {
      mode = 'every';
    } else if (binding.modifiers.not) {
      mode = 'not';
    }

    if (!hasPermission(values, powers, mode)) {
      el.remove();
    }
  }
};
