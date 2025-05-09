import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResOrgMemberIdentity } from '../../../model';

export class ResUserOrgMemberIdentitiesApi extends MyApi<ResOrgMemberIdentity> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/user',
      name: 'org_member_identity',
      ...config,
    });
  }
}
