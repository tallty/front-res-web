import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResMember } from '../../../types/model';

export class ResManageMemberApi extends MyApi<ResMember> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/manage',
      name: 'member',
      ...config,
    });
  }
}
