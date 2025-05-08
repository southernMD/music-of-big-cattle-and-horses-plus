// src/main/logger.ts
import path from 'path';
import fs from 'fs';
import log from 'electron-log';
import { app } from 'electron';
import dayjs from 'dayjs';


/**
 * 获取当日日志路径（格式：YYYY-MM-DD/processType.log）
 */
export function getDailyLogPath() {
    const appName = app.getName(); // 应用名称
    const today = dayjs().format('YYYY-MM-DD'); // 当日日期

    // 日志目录：%APPDATA%/{appName}/logs/YYYY-MM-DD/
    const logDir = path.join(
        app.getPath('appData'),
        appName,
        'logs',
        today
    );

    // 创建目录（如果不存在）
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // 返回完整路径（如：.../logs/2023-10-20/main.log）
    return path.join(logDir, `${log.transports.file.fileName}`);
}

// 配置日志文件输出
// Object.assign(console, log.functions);
log.transports.file.resolvePath = getDailyLogPath;
log.transports.file.level = 'info';
log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}';
log.transports.console.useStyles = true;

//清除日志文件
export const cleanupOldLogs =  (daysToKeep = 7) => {
    const logsRoot = path.join(app.getPath('appData'), app.getName(), 'logs');
    if (!fs.existsSync(logsRoot)) return;

    const cutoffDate = dayjs().subtract(daysToKeep, 'day');

    fs.readdirSync(logsRoot).forEach(dir => {
        const dirDate = dayjs(dir, 'YYYY-MM-DD');
        if (dirDate.isValid() && dirDate.isBefore(cutoffDate)) {
            fs.rmSync(path.join(logsRoot, dir), { recursive: true });
        }
    });
}

export default log
