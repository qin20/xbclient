/* eslint-disable no-console */

import { message } from 'antd';
import { dispatch } from '../store';

message.config({
  duration: 3,
  maxCount: 3,
  getContainer: () => {
    return document.getElementById('app-main');
  }
});

export default async function invoke(channel, data) {
  const { ipcRenderer } = window.electron;
  let resp;
  try {
    const start = Date.now();
    console.group(`[ipc-"${channel}"]`);
    console.info(`参数：`, data);
    resp = await ipcRenderer.invoke.call(ipcRenderer, channel, data);
    if (resp.code !== 0) {
      throw resp;
    }
    const end = Date.now();
    console.info(`结果：`, `(+${end - start}ms)`, resp);
    return resp;
  } catch (e) {
    if (e.code === -2) {
      dispatch({ type: 'SHOW_LOGIN_MODEL' });
    }
    console.error(`结果：`, e);
    message.error(resp.error || resp.message || resp.msg);
    throw e;
  } finally {
    console.groupEnd();
  }
}

invoke.invoking = (channel, data, callback) => {
  const { ipcRenderer } = window.electron;
  ipcRenderer.on(channel, (event, resp) => {
    if (resp.code !== 0) {
      console.error(`[ipc] ${channel} fail: `, resp);
      message.error(resp.message || resp.error || '未知错误');
      return;
    }
    console.info(`[ipc-"${channel}"] replying`, resp);
    callback && callback(resp.data);
  });
  ipcRenderer.once(`${channel}-end`, () => {
    console.info(`[ipc-"${channel}"] end`);
    ipcRenderer.removeAllListeners([channel]);
  });
  console.info(`[ipc-"${channel}"] start`, [data]);
  ipcRenderer.send(channel, data);
};
