import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResDuty } from '@/res-core/model';

export class ResMemberDutiesApi extends MyApi<ResDuty> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/member',
      name: 'duty',
      ...config,
    });
  }
}
