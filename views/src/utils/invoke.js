/* eslint-disable no-console */

import { message } from 'antd';

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
    console.info(`[ipc-"${channel}"] start`, [data]);
    resp = await ipcRenderer.invoke.call(ipcRenderer, channel, data);
    if (resp.code !== 0) {
      throw resp;
    }
    const end = Date.now();
    console.info(`[ipc-"${channel}"] done`, `(+${end - start}ms)`, resp);
  } catch (e) {
    console.error(`[ipc] ${channel} fail: `, e);
    message.error(e.message || e.error || '未知错误');
    throw e;
  }
  return resp.data;
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
