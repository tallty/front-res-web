import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { VObject } from '@/lib/vails/model/index';

export class FormsResourceInfos extends MyApi<VObject> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/forms',
      name: 'resource_info',
      actions: [
        { name: 'find_by_ids', method: 'post', on: 'collection' },
        { name: 'find_by_file', method: 'post', on: 'collection' },
        { name: 'upload_excel', method: 'post', on: 'collection' },
        { name: 'excel', method: 'post', on: 'collection' },
        { name: 'enable_actions', method: 'post', on: 'collection' },
        { name: 'member_enable_actions', method: 'post', on: 'collection' },
      ],
      ...config,
    });
  }
}
