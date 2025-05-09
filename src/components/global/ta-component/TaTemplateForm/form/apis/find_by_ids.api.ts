import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { VObject } from '@/lib/vails/model/index';

export class FormsResourceInfoFindByIds extends MyApi<VObject> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/forms/resource_infos',
      name: 'resource_info',
      pathIndexKey: 'find_by_ids',
      ...config,
    });
  }
}
