import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResMemberRequest } from '../../../model';

export class ResUserMemberRequestsApi extends MyApi<ResMemberRequest> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/user',
      name: 'member_request',
      ...config,
    });
  }
}
