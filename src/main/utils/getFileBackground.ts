import fs from 'node:fs'
import { BASE_PATH } from '../defaultMessage'
import { join } from 'node:path';
import log from '../utils/log'

const baseCacheMessage = {
    "background": "rgb(255,255,255)",
    "color": "rgba(0,0,0,.7)"
}

export const getFileBackground = async (): Promise<typeof baseCacheMessage> => {
    return new Promise((resolve, reject) => {
        fs.readFile(join(__dirname, BASE_PATH, 'color.json'), 'utf8', (err, jsonString) => {
            if (err) {
                try {
                    fs.writeFileSync(join(__dirname, BASE_PATH, 'color.json'), JSON.stringify(baseCacheMessage), 'utf8');
                    resolve(baseCacheMessage)
                } catch (error) {
                    reject(error)
                }

            } else {
                try {
                    resolve(JSON.parse(jsonString))
                } catch (error) {
                    log.error(error)
                    resolve(baseCacheMessage)
                }
            }
        });
    })
}