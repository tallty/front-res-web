import { VObject } from '@/lib/vails';
import { onUnmounted, ref, watch } from 'vue';

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

export const useMpSocketIo = (options: SocketOptions) => {
  const queue = ref<Message[]>([]);
  const task = ref<Message[]>([]);
  const socket = ref();

  const openNotification = ref(false);
  const ReadMap = ref({
    total: 0,
    unread: 0,
  });
  const initSocket = (url: string) => {
    // 清空ReadMap
    ReadMap.value = {
      total: 0,
      unread: 0,
    };

    wx.connectSocket({
      url,
      success: () => {
        connectSocket();
        // 在连接成功后添加消息监听器
        wx.onSocketMessage((resMessage: VObject) => {
          socketMessage(resMessage);

          // 在这里处理收到的消息，可以根据需要进行逻辑处理
        });
      },
      fail: (resConnectErr: any) => {
        console.log('resConnectErr', resConnectErr);
        errorSocket();
      },
    });
    fetchUnread();
    openQueue();
  };
  // socket信息接收
  const socketMessage = (v: VObject) => {
    checkQueue(v?.data);
  };
  // 控制队列
  const checkQueue = (v: string) => {
    if (!openNotification.value) return;
    const data = JSON.parse(v);
    if (!data.identifier) return;
    const message = JSON.parse(data.identifier);
    if (message.channel !== 'ImMessageChannel') return;
    if (!data?.message) return;
    if (Number(data?.message.unread_msg_num) >= 0) {
      ReadMap.value.unread = Number(data?.message.unread_msg_num);
      // notification.close('fetchUnread');
    }

    const newMessage = {
      id: data.message?.payload.MsgKey,
      msgBody: data.message?.payload?.MsgBody ? data.message?.payload?.MsgBody[0] : {},
      unread: data?.message.unread_msg_num,
    };
    pushQueue(newMessage);
  };
  // 开启webSocket
  const connectSocket = () => {
    wx.onSocketOpen(() => {
      console.log('WebSocket连接成功');
      const identifier = JSON.stringify({ channel: 'ImMessageChannel' });
      sendMessage({ command: 'subscribe', identifier });
    });
  };
  // 获取未读数据
  const fetchUnread = async () => {
    try {
      await (options as any).store.find(0).then((res: any) => {
        if (res.statusCode === 200) {
          const { msg_unread_num } = res.data;

          ReadMap.value.unread = msg_unread_num >= 0 ? msg_unread_num : 0;
          const newMessage = {
            id: 0,
            msgBody: {},
            unread: msg_unread_num,
          };
          console.log('api fetchUnread', msg_unread_num);
          pushQueue(newMessage);
        }
      });
    } catch (e) {
      console.error(e, '=======> notify get count error');
    }
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
          // dialNotification(
          //   dialObj.data.cmd,
          //   msgObj.actionType,
          //   msgObj.inviter
          // );
        }
      } else {
        // unreadMsgNotification(unread, 'fetchUnread');
      }
    }
  };

  // // 关闭socket
  // const disconnectSocket = () => {
  //   console.log('=====> socket 已关闭');
  // };

  // socket 出错
  const errorSocket = (e?: Error) => {
    console.error(e || 'socket error');
    // socket 连接失败时也获取一次未读数量，防止socket连接失败时没有未读数量显示
    fetchUnread();
  };

  // socket主动发送信息
  const sendMessage = (v: any) => {
    wx.sendSocketMessage({ data: JSON.stringify(v) });
  };

  // 开启队列
  const openQueue = () => {
    console.log('队列重新开启', ReadMap.value.unread);
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
    console.log('关闭socket');
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
    fetchUnread,
    ReadMap,
  };
};
