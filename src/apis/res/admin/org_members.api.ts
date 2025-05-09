import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResOrgMember } from '@/res-core/model';

export class ResAdminOrgMembersApi extends MyApi<ResOrgMember> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'org_member',
      ...config,
    });
  }
}
