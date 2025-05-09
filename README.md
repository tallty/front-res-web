# 项目简介

本仓库为前端应用，采用模块化结构，核心代码均位于 `src/` 目录下。项目支持自动化部署，详见 `scripts/deploy.js`。

## 目录结构说明

- `src/`：前端主代码目录，包含以下主要子模块：
  - `apis/`：接口请求相关代码，统一管理所有后端 API 调用。
  - `assets/`：静态资源（如图片、字体、全局样式）。
  - `components/`：通用组件库，包含基础布局、菜单、表单、表格等复用组件。
    - `base-layouts/`：基础布局相关组件。
    - `global/ta-component/`：通用组件库。
  - `directives/`：自定义指令。
  - `layouts/`：页面布局相关组件。
  - `lib/`：第三方库或自定义库的封装。
  - `locales/`：多语言配置文件。
  - `router/`：前端路由配置。
  - `store/`：全局状态管理（如 Vuex）。
  - `types/`：TypeScript 类型定义。
  - `utils/`：工具函数和自定义 hooks。
  - `views/`：页面视图，按业务模块划分。

## 推荐入口

- 应用入口：`src/main.ts` 或 `src/main.js`
- 路由入口：`src/router/index.ts`
- 状态管理入口：`src/store/index.ts`

## 业务核心说明

- 组件复用性高，建议优先查阅 `src/components/` 下的基础组件。
- 业务页面建议从 `src/views/` 目录查找，按业务线分模块。
- 接口统一由 `src/apis/` 管理，便于维护和扩展。

## 部署与版本追踪

- 构建产物输出至 `dist/` 目录。
- 部署脚本位于 `scripts/deploy.js`，支持多环境自动化部署。
- 每次部署会自动记录当前 Git commit ID 到 `dist/version.json`，便于追踪部署版本。

## 相关文档

- [部署系统说明](scripts/deploy.js)
- [项目结构说明](README.md)
- [多语言配置](src/locales/)
- [核心组件文档](src/components/)

---

如需详细了解某一模块，请直接查阅对应目录下的 README 或源码注释。
