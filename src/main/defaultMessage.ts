import { is } from "@electron-toolkit/utils"
import { id3Message } from "./types"
export const DEFAULT_ID3_MESSAGE: id3Message = {
    title: '',
    album: '',
    artist: '',
    image: {
        mime: '',
        type: {
            id: 0,
            name: ''
        },
        description: '',
        imageBuffer: new Uint8Array()
    },
    raw: {
        TIT2: '',
        TPE1: '',
        APIC: null,
        TALB: '',
        TXXX: []
    },
    userDefinedText: [
        {
            description: 'song id',
            value: ''
        },
        {
            description: 'al id',
            value: ''
        },
        {
            description: 'ar ids',
            value: ''
        }
    ],
    path: '',
    time: 0,
    comment: {
        language: '',
        text: ''
    }
}

export const DELAY_MS = 500

export const BASE_PATH = is.dev && process.env['ELECTRON_RENDERER_URL'] ? '../../resources' : '../../../app.asar.unpacked/resources'