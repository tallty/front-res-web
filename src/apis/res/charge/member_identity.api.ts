import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResMemberIdentity } from '../../../types/model';

export class ResChargeMemberIdentityApi extends MyApi<ResMemberIdentity> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/charge',
      name: 'member_identity',
      ...config,
    });
  }
}
