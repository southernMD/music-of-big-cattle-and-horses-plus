import fs from 'node:fs'
import { join, resolve } from 'node:path';
import { BASE_PATH } from '../defaultMessage'
import log from './log';


export const getDownloadPath = () => {
    return new Promise<string>((res, reject) => {
        fs.readFile(join(__dirname, BASE_PATH, 'dowloadPath.json'), 'utf8', (err, jsonString) => {
            if (err) {
                // 文件不存在，创建文件并写入内容
                try {
                    fs.writeFileSync(join(__dirname, BASE_PATH, 'dowloadPath.json'), `{"dowloadPath":"${resolve("download").replaceAll("\\", "\\\\")}"}`, 'utf8');
                    res(resolve('download'))
                } catch (error) {
                    reject(error)
                }
            } else {
                try {
                    res(JSON.parse(jsonString).dowloadPath.replaceAll('\\\\', '\\'))
                } catch (error) {
                    log.error(error);
                    res(resolve('download'))
                }
            }
        })
    })
}