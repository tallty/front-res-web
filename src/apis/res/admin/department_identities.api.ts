import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResDepartmentIdentity } from '@/res-core/model';

export class ResAdminDepartmentIdentitiesApi extends MyApi<ResDepartmentIdentity> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'department_identity',
      ...config,
    });
  }
}
