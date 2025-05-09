import { VObject } from '@/lib/vails';
import { Button, notification } from 'ant-design-vue';
import { onUnmounted, ref } from 'vue';
// import { NotifyUserInfoMessagesApi } from '../apis/notify/user/info_messages.api';
// import { NotifyInfoMessageModel } from '../models/notify/manage/info_message';

type AnyFc = (...args: any[]) => void;
type PromiseFc = (...args: any[]) => Promise<any>;
type SocketOptions = {
  clickCallBack?: AnyFc | PromiseFc;
  store: any;
  imUserStore: any;
};
export type Message = {
  id: number;
  // type: string;
  msgBody: VObject;
  unread: number;
};

// 1拨打 2拒绝 5未接听
export type ActionType = 1 | 2 | 5;

type MsgCmd = 'audioCall' | 'videoCall';

export const useSocketIo = (options: SocketOptions) => {
  // 消息队列
  const queue = ref<Message[]>([]);
  const task = ref<Message[]>([]);
  const socket = ref();

  const openNotification = ref(false);
  const ReadMap = ref({
    total: 0,
    unread: 0,
  });

  // const countStore = new VStore(new NotifyUserInfoMessagesApi({}), NotifyInfoMessageModel);
  // countStore.index({
  //   per_page: 1,
  // });

  const unreadMsgNotification = (unread: number, key: any) => {
    notification.open({
      message: `您有${unread}条未读消息`,
      placement: 'bottomRight',
      key,
      // duration: 0,
      onClick: () => {
        notification.close(key);
        options?.clickCallBack?.();
      },
    });
  };

  const dialNotification = (cmd: MsgCmd, actionType: ActionType, fromId: string) => {
    if (actionType === 1) {
      options.imUserStore.index({ q: { im_userid_eq: fromId } }).then((res: any) => {
        console.log('imUserStoreres', res);
        const { name, avatar } = res?.records[0].user;
        notification.open({
          message: () => {
            return <div class="ml-2 text-gray-900 text-sm font-medium">{name}</div>;
          },
          description: () => {
            const cmd_text = cmd === 'audioCall' ? '语音' : '视频';
            return <div class="ml-2 text-gray-600 text-xs font-normal">邀请你{cmd_text}通话</div>;
          },
          placement: 'bottomRight',
          key: fromId,
          duration: 0,
          btn: () => {
            const click = () => {
              notification.close(fromId);
              options?.clickCallBack?.();
            };

            return (
              <Button type="primary" onClick={click}>
                打开查看
              </Button>
            );
          },
          icon: () => {
            const url =
              avatar?.files[0].url ||
              'https://innomatchoss.oss-cn-hangzhou.aliyuncs.com/component/im_default_avatar.jpeg';
            return <img class="w-10 h-10 rounded-full" src={url}></img>;
          },
        });
      });
    } else {
      notification.close(fromId);
    }
  };

  // 获取未读数据
  const fetchUnread = async () => {
    try {
      await (options as any).store.find(0).then((res: any) => {
        if (res.status === 200) {
          const { msg_unread_num } = res.data;
          ReadMap.value.unread = msg_unread_num >= 0 ? msg_unread_num : 0;
          const newMessage = {
            id: 0,
            msgBody: {},
            unread: msg_unread_num,
          };
          pushQueue(newMessage);
        }
      });
    } catch (e) {
      console.error(e, '=======> notify get count error');
    }
  };

  // socket初化
  const initSocket = (url: string) => {
    if (socket.value?.url) {
      closeSocket();
    }
    if ('WebSocket' in window) {
      socket.value = new WebSocket(url); // 创建socket对象
      socket.value.onopen = connectSocket;
      socket.value.onmessage = (e: any) => {
        socketMessage(e);
      };
      socket.value.onclose = disconnectSocket;
      socket.value.onerror = errorSocket;
    } else {
      console.error('socket error');
    }

    openQueue();
  };

  // 开启webSocket
  const connectSocket = () => {
    console.log('WebSocket连接成功');
    const identifier = JSON.stringify({ channel: 'ImMessageChannel' });
    sendMessage({ command: 'subscribe', identifier });
    fetchUnread();
  };

  // socket信息接收
  const socketMessage = (v: VObject) => {
    // console.log('socketMessage', v);
    checkQueue(v?.data);
  };

  // 控制队列
  const checkQueue = (v: string) => {
    if (!openNotification.value) return;
    const data = JSON.parse(v);
    if (data.identifier) {
      console.log('控制队列data', data);
    }
    if (!data.identifier) return;
    const message = JSON.parse(data.identifier);
    console.log(message);
    console.log(data);
    if (message.channel !== 'ImMessageChannel') return;
    if (!data?.message) return;
    console.log('data?.unread_msg_num', data?.message);
    if (Number(data?.message.unread_msg_num) >= 0) {
      ReadMap.value.unread = Number(data?.message.unread_msg_num);
      notification.close('fetchUnread');
    }

    const newMessage = {
      id: data.message?.payload.MsgKey,
      msgBody: data.message?.payload.MsgBody[0],
      unread: data?.message.unread_msg_num,
    };
    pushQueue(newMessage);
  };

  const pushQueue = (v: Message) => {
    queue.value = [v, ...queue.value];
    NotificationCeck();
  };

  const NotificationCeck = () => {
    const v = queue.value?.[0];
    const {
      unread,
      id,
      msgBody: { MsgContent, MsgType },
    } = v;
    if (queue.value.length > 0 && unread > 0) {
      queue.value = [...[...queue.value].filter(el => el.id !== id)];
      if (MsgType === 'TIMCustomElem') {
        const msgObj = JSON.parse(MsgContent.Data);
        if (msgObj.actionType) {
          const dialObj = JSON.parse(msgObj.data);
          dialNotification(dialObj.data.cmd, msgObj.actionType, msgObj.inviter);
        }
      } else {
        unreadMsgNotification(unread, 'fetchUnread');
      }
    }
  };

  // 关闭socket
  const disconnectSocket = () => {
    console.log('=====> socket 已关闭');
  };

  // socket 出错
  const errorSocket = (e?: Error) => {
    console.error(e || 'socket error');
    // socket 连接失败时也获取一次未读数量，防止socket连接失败时没有未读数量显示
    fetchUnread();
  };

  // socket主动发送信息
  const sendMessage = (v: any) => {
    socket.value.send(JSON.stringify(v));
  };

  // 开启队列
  const openQueue = () => {
    console.log('队列重新开启');
    queue.value = [];
    task.value = [];
    openNotification.value = true;
  };

  // 关闭并清空队列
  const closeQueue = () => {
    openNotification.value = false;
    task.value = [];
    queue.value = [];
  };

  const closeSocket = () => {
    if (socket.value?.url) {
      socket.value?.close?.();
      ReadMap.value = {
        ...ReadMap.value,
        total: 0,
        unread: 0,
      };
    }
    closeQueue();
  };

  onUnmounted(() => {
    closeSocket();
  });
  return {
    initSocket,
    sendMessage,
    closeQueue,
    openQueue,
    closeSocket,
    ReadMap,
    fetchUnread,
  };
};
