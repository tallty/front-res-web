import { useFormProvide } from '../../../ta-template-form-core/useForm';
import { ref, reactive, Ref } from 'vue';
import { useContextProvide } from '@/components/global/ta-component/ta-template-form-core/useContext';
import { MentionElement } from '@wangeditor/plugin-mention';
import { VObject } from '../../../../../../lib/vails/model/index';

export const useRichEditorMention = (editorRef: Ref<any>) => {
  const mentionSelector = ref<any>(null);
  const mentionSelectorValue = ref<VObject[]>([]);

  const mentionSelectorFormValue = reactive({ _attributes: [] });

  const fakeForm = { value: mentionSelectorFormValue };
  // for TaUserPolymorphicField
  useFormProvide(fakeForm);
  useContextProvide(ref({}) as any, {}); // 避免 warning

  const showMentionSelector = () => {
    mentionSelectorValue.value = [];
    mentionSelector.value.selector.openSelector();
  };

  const hideMentionSelector = () => {
    // mentionSelector.value.selector.handleCancel();
  };

  const insertMention = () => {
    if (editorRef.value) {
      editorRef.value.restoreSelection(); // 恢复选区
      editorRef.value.deleteBackward('character'); // 删除 '@'

      mentionSelectorFormValue._attributes
        .filter((item: VObject) =>
          mentionSelectorValue.value.find((i: VObject) => i.user?.id === item.user_id),
        )
        .forEach((item: VObject) => {
          const mentionNode: MentionElement = {
            type: 'mention', // 必须是 'mention'
            value: mentionSelectorValue.value.find((i: VObject) => i.user?.id === item.user_id)
              ?.user?.name,
            info: { user_id: item.user_id, user_type: item.user_type },
            children: [{ text: '' }], // 必须有一个空 text 作为 children
          };

          editorRef.value.insertNode(mentionNode); // 插入 mention
        });
      editorRef.value.move(1); // 移动光标
    }
  };

  return {
    mentionSelector,
    mentionSelectorValue,
    mentionSelectorFormValue,
    showMentionSelector,
    hideMentionSelector,
    insertMention,
  };
};
