import { is } from '@electron-toolkit/utils';
import portfinder from 'portfinder'
let port: number
async function initializePort() {
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        port = Number(import.meta.env["VITE_SERVER_PORT"] || 2233);
    }else{
        port = await portfinder.getPortPromise({
            port: 2233
        })
    }

}

initializePort()

export { port };