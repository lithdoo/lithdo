# @lithdo/elecher

一个基于 Electron 的本地桌面运行壳。  
安装后会下载本机平台 Electron，并在运行时启动本地 WebSocket JSON-RPC 服务，供业务进程调用。

## 变更说明

当前版本仅支持 `.env` 配置，不再支持 `app.toml`。  
环境变量前缀统一为 `ELECHER_`。

## 快速开始

1. 安装：

```bash
npm i @lithdo/elecher
```

2. 在运行目录创建 `.env`：

```env
ELECHER_APP_NAME=my-electron-app
ELECHER_RPC_PORT=9333
ELECHER_RPC_TOKEN=replace-with-strong-token
ELECHER_SUBCMD=node ./app.js
ELECHER_CONFIG_DIR=.
```

3. 启动：

```bash
npx elecher
```

## 配置项

- `ELECHER_APP_NAME`：应用名（可选）。
- `ELECHER_RPC_PORT`：RPC 端口（默认 `9333`）。
- `ELECHER_RPC_TOKEN`：RPC 鉴权令牌（可选，设置后客户端必须携带 token）。
- `ELECHER_SUBCMD`：子进程命令（可选，子进程退出后应用退出）。
- `ELECHER_CONFIG_DIR`：配置目录（默认 `process.cwd()`，用于相对路径解析）。
- `ELECHER_MIRROR`：Electron 下载镜像（安装时使用）。

## 配置优先级

运行时优先级（高 -> 低）：

1. Shell 中已存在环境变量
2. `.env`
3. 默认值

`.env` 只会补充缺失变量，不覆盖 shell 中已存在的同名变量。

## 子进程环境变量继承

启动子进程时会使用继承环境（`...process.env`），因此 `.env` 加载到主进程的变量会一并传给子进程。  
也就是说，你在 `.env` 中的 `ELECHER_*` 或其他业务变量，子进程都能直接读取。

## RPC 连接与鉴权

服务地址：

```text
ws://localhost:<ELECHER_RPC_PORT>
```

启用 token 后：

```text
ws://localhost:<ELECHER_RPC_PORT>?token=<ELECHER_RPC_TOKEN>
```

未配置 `ELECHER_RPC_TOKEN` 时保持兼容：不做 token 校验。  
配置后若 token 错误，连接会被拒绝（`1008 Unauthorized`）。

## JSON-RPC 方法

- `getVersion()`
- `getPlatform()`
- `getArch()`
- `getAppPath({ name })`
- `openWindow({ title, width, height, loadUrl, devTool })`
- `closeWindow({ windowId })`
- `getAllWindows()`

`loadUrl` 若不是 `http://`、`https://`、`file://`，将基于 `ELECHER_CONFIG_DIR` 解析为本地文件路径。

## 示例客户端

参考 `examples/open-window/app.ts`：

```js
const token = process.env.ELECHER_RPC_TOKEN || '';
const wsUrl = token
  ? `ws://localhost:9333?token=${encodeURIComponent(token)}`
  : 'ws://localhost:9333';
const ws = new WebSocket(wsUrl);
```

## 常见问题

- 下载失败：检查网络，必要时设置 `ELECHER_MIRROR`。
- 连接失败：确认端口、进程是否运行、token 是否正确。
- 相对路径打不开：确认 `ELECHER_CONFIG_DIR` 指向正确目录。
- 子进程命令异常：当前命令解析为 `split(' ')`，复杂引号/带空格路径需要额外注意。

## 许可证

ISC
