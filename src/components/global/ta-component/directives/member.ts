import store from '@/store';
import { ResMember } from '../../../../engines/res/res-core/model';
import { hasPermissionDirectiveCallback } from '../TaIndexView/ta-index-view-core/usePermission';

/**
 * 使用说明：
 * v-member.[关系谓词]="[角色（数组/字符串）]"
 *
 * 1. v-member="['CompanyMember']" 【CompanyMember 角色才能显示】
 * 2. v-member="['CompanyMember', 'ChannelMember']" 【CompanyMember 或 ChannelMember 权限能显示】
 * 3. v-member.some="['CompanyMember', 'ChannelMember']" 【CompanyMember 或 ChannelMember 权限能显示，等价于 2】
 * 4. v-member.every="['CompanyMember', 'ChannelMember']" 【CompanyMember 且 ChannelMember 权限能显示】
 * 5. v-member.not="['CompanyMember', 'ChannelMember']" 【不是 CompanyMember 且 不是 ChannelMember 权限能显示】

  NOTE: 不能和 v-if 在一行混用，vue ^3.2.19
 */

const callback = (el: any, binding: any) => {
  const values = (store.state.user.currentUser?.members || []).map(
    (member: ResMember) => member.member_type,
  );
  hasPermissionDirectiveCallback(el, binding, values);
};

export default {
  beforeMount: callback,
  beforeUpdate: callback,
};
