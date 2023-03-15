import { ipcMain } from 'electron'
 
// 存储所有窗口的 id
const windowIdMap:any = {}
 
// 注册窗口
export const registerWindowId = function(key:any, value:any) {
    windowIdMap[key] = value;
    console.log('registerWindowId', windowIdMap);
}
 
// 销毁窗口
export const removeWindowId = function(key:any) {
    delete windowIdMap[key];
    console.log('removeWindowId', windowIdMap);
}
 
// 获取某个窗口 id
ipcMain.on('getWindowId', (event, arg) => {
    console.log('getWindowId', arg);
    console.log(windowIdMap[arg]);
    
    event.returnValue = windowIdMap[arg];
})