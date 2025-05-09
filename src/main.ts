import 'video.js/dist/video-js.css';
import 'viewerjs/dist/viewer.css';
import { createApp } from 'vue';
import router from './router';
import '@/assets/styles/global/index.styl';
// import '@/assets/styles/cover.styl';
import store from './store';
// import locale from './locales';
import App from './App.vue';
import {
  Layout,
  Menu,
  Row,
  Col,
  Card,
  Form,
  Dropdown,
  Select,
  Button,
  Checkbox,
  Tabs,
  Tag,
  Input,
  InputNumber,
  DatePicker,
  TimePicker,
  Radio,
  Tooltip,
  Space,
  Steps,
  Divider,
  Descriptions,
  Alert,
  Result,
  Statistic,
  Popconfirm,
  Popover,
  Table,
  Avatar,
  List,
  Progress,
  Switch,
  Modal,
  Rate,
  ConfigProvider,
  Spin,
  Drawer,
  Pagination,
  Tree,
  Breadcrumb,
  TreeSelect,
  Collapse,
  Skeleton,
  Timeline,
  Cascader,
  Carousel,
  Upload,
  Slider,
  Badge,
} from 'ant-design-vue';

// import { ProProvider, PageContainer, TransformVnode } from '@/components';
// import Authority from './utils/authority/authority.vue';
import useGlobalComponents from '@/components/global';
import useDirectives from './directives/index';
import 'windi.css';

import './app.less';
import useTaComponentDirectives from './components/global/ta-component/directives';
// import './router/router-guards';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import i18n from '@/engines/base/locales/index';

dayjs.extend(relativeTime);
require('dayjs/locale/zh');
dayjs.locale('zh');

const app = createApp(App);

app
  .use(router)
  // .use(locale as any)
  .use(store)
  .use(Layout)
  .use(Menu)
  .use(Row)
  .use(Col)
  .use(Card)
  .use(Form)
  .use(Dropdown)
  .use(Select)
  .use(Button)
  .use(Checkbox)
  .use(Tabs)
  .use(Tag)
  .use(Input)
  .use(InputNumber)
  .use(DatePicker)
  .use(TimePicker)
  .use(Radio)
  .use(Tooltip)
  .use(Space)
  .use(Steps)
  .use(Divider)
  .use(Descriptions)
  .use(Alert)
  .use(Result)
  .use(Statistic)
  .use(Popconfirm)
  .use(Popover)
  .use(Table)
  .use(Avatar)
  .use(List)
  .use(Progress)
  .use(Switch)
  .use(Modal)
  .use(Rate)
  .use(ConfigProvider)
  .use(Spin)
  .use(Drawer)
  .use(Pagination)
  .use(Breadcrumb)
  .use(Tree)
  .use(TreeSelect)
  .use(Collapse)
  .use(Skeleton)
  .use(Timeline)
  .use(Cascader)
  .use(Carousel)
  .use(Upload)
  .use(Slider)
  .use(Badge)
  .use(i18n);

useGlobalComponents(app);
useDirectives(app);
useTaComponentDirectives(app);

app.mount('#app');
