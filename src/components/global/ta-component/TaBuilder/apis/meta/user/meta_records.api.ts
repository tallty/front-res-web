import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';

export interface MetaMetaRecord {
  id: number;
}

export class MetaUserMetaRecordsApi extends MyApi<MetaMetaRecord> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/meta/user',
      name: 'meta_record',
      actions: [{ name: 'aggregate', method: 'post', on: 'collection' }],
      ...config,
    });
  }
}
