import express from 'express';
const bodyParser = require('body-parser')
import { join } from 'path';
import RegisterAndLogin from './api/RegisterAndLogin'
import cors from 'cors'

export default ()=>{
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded   针对普通页面提交功能
    app.use(bodyParser.json());  // parse application/json    针对异步提交ajax
    app.use(cors())
    //router
    app.use('/regAndLog',RegisterAndLogin)
    
    app.listen(3000, ()=>{
        console.log('Example app listening on port http://127.0.0.1:3000 !');
    })
}
