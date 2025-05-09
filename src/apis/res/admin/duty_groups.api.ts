import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResDutyGroup } from '@/res-core/model';

export class ResAdminDutyGroupsApi extends MyApi<ResDutyGroup> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'duty_group',
      ...config,
    });
  }
}
