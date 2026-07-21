import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("panshot", {
  platform: process.platform,
});
