import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResOrgMember } from '../../../model';

export class ResManageOrgMembersApi extends MyApi<ResOrgMember> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/manage',
      name: 'org_member',
      ...config,
    });
  }
}
