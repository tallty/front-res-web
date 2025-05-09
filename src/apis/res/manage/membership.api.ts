import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResMembership } from '../../../types/model';

export class ResManageMembershipApi extends MyApi<ResMembership> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/manage',
      name: 'membership',
      actions: [
        { method: 'put', name: 'disable', on: 'member' },
        { method: 'put', name: 'undisable', on: 'member' },
      ],
      ...config,
    });
  }
}
