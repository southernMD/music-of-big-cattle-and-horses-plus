import express from 'express';
import cors from 'cors'
import { ipcMain } from 'electron';
import { port } from './port'
import { router as videoRouter } from './video-server'
import ncmRouter from './netease'
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import initUnlockApi from './unlock/index';
export default async() =>{
    const app = express();
    app.use(cookieParser());
    app.use(express.json()); 
    app.use(express.urlencoded({ extended:true })); 
    //@ts-ignore
    app.use(fileUpload())
    app.use('/api', videoRouter)
    app.use('/api/netease', ncmRouter());
    app.use('/api/unlock',initUnlockApi())
    ipcMain.on('server-port', (event) => {
        event.returnValue = port;
    });
    app.listen(port, () => {
        console.log(`http open in ${port}`);
    })
}


