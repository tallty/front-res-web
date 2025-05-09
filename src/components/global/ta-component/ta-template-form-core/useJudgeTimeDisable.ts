import dayjs, { Dayjs } from 'dayjs';
import { TaTemplateFormItem } from './types';

const useJudgeTimeDisable = () => {
  const judgeTimeDisable = (time: Dayjs, item: TaTemplateFormItem) => {
    if (item.options?.start_time || item.options?.end_time) {
      if (item.options.start_time && item.options.end_time) {
        return (
          runDayjsStr(item.options.start_time).isAfter(time) ||
          runDayjsStr(item.options.end_time).isBefore(time)
        );
      }
      if (item.options.start_time) return runDayjsStr(item.options.start_time).isAfter(time);
      if (item.options.end_time) return runDayjsStr(item.options.end_time).isBefore(time);
    }

    return false;
  };

  const runDayjsStr = (str: string): Dayjs => {
    return new Function(`"use strict";return ${str}`).bind({ dayjs })();
  };

  return { judgeTimeDisable, runDayjsStr };
};

export default useJudgeTimeDisable;
