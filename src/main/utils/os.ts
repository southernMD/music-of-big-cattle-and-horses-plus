import si from 'systeminformation';
import log from './log'
import { app, dialog } from 'electron';

export const getWindowsVersion = async () => {
    try {
        if (process.platform === 'win32') {
            const osInfo = await si.osInfo();
            const version = parseFloat(osInfo.release);
            log.info('Windows Version:', osInfo.distro);
            console.log(osInfo);
            if (osInfo.distro.includes("Windows 11")) {
                return 11
            } else if (version >= 10.0) {
                return 10
            } else if (version >= 6.3) {
                return 8.1
            } else if (version >= 6.2) {
                return 8
            } else if (version >= 6.1) {
                return 7
            } else{
                return 0
            }
        } else {
            return 0
        }
    } catch ( error:any) {
        dialog.showErrorBox('错误', error.message);
        log.info(error.message);
        app.quit();
        return 0;
    }

};
