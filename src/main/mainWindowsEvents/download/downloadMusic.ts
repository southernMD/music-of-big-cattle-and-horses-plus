import { ipcMain } from "electron";
import fs from 'fs'
import request from 'request'
import NodeID3 from 'node-id3'
import { parse } from 'path'
import { cloneDeep } from 'lodash'
import { DEFAULT_ID3_MESSAGE } from "@main/defaultMessage";

export default async (downloadPath: string) => {
    ipcMain.on('save-music', (e, { arrayBuffer, name, id3 }) => {
        const imageUrl = id3.image
        fs.mkdirSync('download', { recursive: true });
        const cleanFileName = name.replace(/[\\/:\*\?"<>\|]/g, "");
        arrayBuffer = new Uint8Array(arrayBuffer);
        request.get(imageUrl, { encoding: null }, function (error, response, body) {
            if (error) console.log(error);
            const image = {
                mime: `image/${parse(imageUrl).ext}`,
                imageBuffer: body,
            };
            const oldtags = NodeID3.read(arrayBuffer);
            const newTags = Object.assign({}, oldtags, id3);
            newTags['image'] = image
            newTags['userDefinedText'] =
                [{
                    "description": "song id",
                    "value": id3.ids[0]
                }, {
                    "description": "al id",
                    "value": id3.ids[1]
                }, {
                    "description": "ar ids",
                    "value": id3.ids.slice(2).join(',')
                }]
            NodeID3.update(newTags, arrayBuffer, function (err, buffer) {
                if (err) {
                    console.error(err);
                    return;
                }
                fs.writeFileSync(`${downloadPath}/${cleanFileName}.mp3`, buffer);
                console.log(NodeID3.read(`${downloadPath}/${cleanFileName}.mp3`))
            });
            e.reply('save-music-finished', { which: cleanFileName, id: id3.ids[0] })
        })

    })
    ipcMain.on('get-download-list', (e) => {
        if (fs.existsSync(downloadPath)) {
            const Files = fs.readdirSync(downloadPath)
            e.reply('look-download-list', Files)
        } else {
            e.reply('look-download-list', [])
        }
    })
    ipcMain.on('get-download-list-detail', (e) => {
        if (fs.existsSync(downloadPath)) {
            const Files = fs.readdirSync(downloadPath)
            const detail: any[] = []
            Files.forEach((item) => {
                detail.push(Object.assign({ ...cloneDeep(DEFAULT_ID3_MESSAGE), path: downloadPath + '\\' + item, title: item }, NodeID3.read(`${downloadPath}/${item}`)))
            })
            e.reply('look-download-list-detail', detail)
        } else {
            e.reply('look-download-list-detail', [])
        }
    })
}