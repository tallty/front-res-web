import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResMember } from '@/res-core/model';

export class ResMemberMembersApi extends MyApi<ResMember> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/member',
      name: 'member',
      ...config,
    });
  }
}
