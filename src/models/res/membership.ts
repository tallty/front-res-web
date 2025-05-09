import { VModel, VObject } from '@/lib/vails';
import { ResMembership } from '../../types/model';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

export class ResMembershipModel extends VModel<ResMembership> {
  validityPeriod = this.computedAttr('validityPeriod', () => {
    if (this.reactiveRecord.effective_at && this.reactiveRecord.invalid_at) {
      return dayjs
        .duration(
          dayjs(this.reactiveRecord.invalid_at).diff(
            dayjs(this.reactiveRecord.effective_at),
            'second',
          ),
          'seconds',
        )
        .humanize();
    } else if (this.reactiveRecord.effective_at && !this.reactiveRecord.invalid_at) {
      return `${dayjs(this.reactiveRecord.effective_at).format('YYYY-MM-DD')}起`;
    } else if (!this.reactiveRecord.effective_at && this.reactiveRecord.invalid_at) {
      return `截止${dayjs(this.reactiveRecord.invalid_at).format('YYYY-MM-DD')}`;
    } else {
      return '永久有效';
    }
  });

  state = this.computedAttr('state', () => {
    const instance = this.reactiveRecord.flowable_instance_infos?.[0];
    if (instance) {
      if (instance.state == 'completed' && !this.reactiveRecord.effective) {
        return 'invalid';
      } else {
        return instance.state;
      }
    } else if (this.reactiveRecord.effective) {
      return 'valid';
    } else {
      return 'invalid';
    }
  });

  stateConfig = this.computedAttr('stateConfig', () => {
    return ResMembershipModel.instanceConfig()[this.state.value];
  });

  static instanceConfig(): VObject {
    return {
      invalid: {
        text: '已禁用',
        style: {
          background: '#FDF2F2',
          color: '#F05252',
        },
      },
      valid: {
        text: '在职',
        style: {
          background: '#F3FAF7',
          color: '#0E9F6E',
        },
      },
      created: {
        text: '已提交',
        style: {
          background: '#EBF5FF',
          color: '#1C64F2',
        },
      },
      processing: {
        text: '审批中',
        style: {
          background: '#EBF5FF',
          color: '#1C64F2',
        },
      },
      completed: {
        text: '已完成',
        style: {
          background: '#F3FAF7',
          color: '#0E9F6E',
        },
      },
      terminated: {
        text: '已终止',
        style: {
          background: '#FDF2F2',
          color: '#F05252',
        },
      },
    };
  }
}
