import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResMemberIdentity } from '../../../model';

export class ResUserMemberIdentitiesApi extends MyApi<ResMemberIdentity> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/user',
      name: 'member_identity',
      ...config,
    });
  }
}
