import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResDepartment } from '@/res-core/model';

export class ResAdminDepartmentsApi extends MyApi<ResDepartment> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'department',
      mode: 'shallow',
      ...config,
    });
  }
}
