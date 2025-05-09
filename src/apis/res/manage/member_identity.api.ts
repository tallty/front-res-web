import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResMemberIdentity } from '../../../types/model';

export class ResManageMemberIdentityApi extends MyApi<ResMemberIdentity> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/manage',
      name: 'member_identity',
      ...config,
    });
  }
}
