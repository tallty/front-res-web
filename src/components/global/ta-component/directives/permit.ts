import store from '@/store';
import { hasPermissionDirectiveCallback } from '../TaIndexView/ta-index-view-core/usePermission';

/**
 * 使用说明：
 * v-permit.[关系谓词]="[权限（数组/字符串）]"
 *
 * 1. v-permit="['meeting_admin']" 【 meeting_admin 权限才能显示】
 * 2. v-permit="['meeting_admin', 'meeting_edit']" 【 meeting_admin 或 meeting_edit 权限能显示】
 * 3. v-permit.some="['meeting_admin', 'meeting_edit']" 【 meeting_admin 或 meeting_edit 权限能显示，等价于 2】
 * 4. v-permit.every="['meeting_admin', 'meeting_edit']" 【 meeting_admin 且 meeting_edit 权限能显示】
 * 5. v-permit.not="['meeting_admin', 'meeting_edit']" 【不是 meeting_admin 且 不是 meeting_edit 权限能显示】

  NOTE: 不能和 v-if 在一行混用，vue ^3.2.19
 */

const callback = (el: any, binding: any) => {
  const values = store.state.user.currentUser?.roles_name || [];
  hasPermissionDirectiveCallback(el, binding, values);
};

export default {
  beforeMount: callback,
  beforeUpdate: callback,
};
