import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResMemberIdentity } from '@/res-core/model';

export class ResAdminMemberIdentitiesApi extends MyApi<ResMemberIdentity> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'member_identity',
      ...config,
    });
  }
}
