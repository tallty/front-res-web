import jsonata from 'jsonata';
import { useContextInject } from './useContext';
import { get } from 'lodash-es';

export const jsonataGet = (source: any, key: string) => {
  try {
    return jsonata(key).evaluate(source);
  } catch {
    return '';
  }
};

export const insertJsonata = (str: string, insertContextFn: (dataKey: string) => any) => {
  let result = str;
  while (/\$\{(.+?)\}/.exec(result)) {
    const matched = /\$\{(.+?)\}/.exec(result)!;
    result = result.replace(matched[0], insertContextFn(matched[1]));
  }
  return result;
};

export const useJsonataInTaTemplateForm = () => {
  const { context } = useContextInject();

  const insertContext = (str: string) => {
    return insertJsonata(str, (dataKey: string) => insertContextValue(dataKey));
  };

  const insertContextValue = (key: string) => {
    return (
      jsonataGet(context, key) ||
      jsonataGet(context._form, key) ||
      (context._route.params && jsonataGet(context._route.params, key)) ||
      (context._route.query && jsonataGet(context._route.query, key))
    );
  };

  return { insertContext, insertContextValue };
};
