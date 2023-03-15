import express,{Request,Response} from 'express';
const router = express.Router()
import { nanoid } from 'nanoid';
import query from '../db';
import nodemailer from 'nodemailer';
import { check, oneOf, validationResult} from 'express-validator';
var jwt = require('jsonwebtoken');
import md5 from 'md5';
const salt = 'da(&&&**(($$$$$$%%%%%%%%&*$$$&*'
const transporter = nodemailer.createTransport({
    service: 'qq',
    port: 465, // SMTP 端口
    secureConnection: true, // 使用 SSL
    auth: {
      user: 'bluenomarisa@qq.com',
      //这里密码不是qq密码，是你设置的smtp密码
      pass: 'xvtjkxgmsjefebbi'
    }
  });

const replayHTML = (email:string, code:string) => {
    return {
        from: '2483723241@qq.com', // 发件地址
        to: email, // 收件列表
        subject: '大牛马音乐验证', // 标题
        html: `
    <div class="replay" style="display: flex; flex-direction: column;  color:#222 ;">
        <div>
             ${email} 你好：
        </div>
        <div>
            你于此次注册的验证码为:${code} 5分钟之内有效
        </div>
    </div>
    ` // html 内容
    }
}

const validation = [
    oneOf([
        check('nickname')
          .exists()
          .withMessage('昵称是必须的'),
        check('nickname')
          .exists()
          .withMessage('邮箱是必须的')
          .isEmail()
          .withMessage('请输入正确的邮箱'),
    ]),
    check('password')
        .exists()
        .withMessage('密码是必须的')
];

function handleValidationErrors(req:Request,res:Response, next) {
    console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(202).json({ status:202,errors: errors.array() });
  }
  next();
};


router.post('/email', 
    check("email", "请输入正确的邮件地址").isEmail(),handleValidationErrors
,(req:Request,res:Response) => {
    const { email } = req.body
    new Promise<any[]>((resolve, reject) => {
        query(`select * from user where email = '${email}'`,(err,data:any[])=>{
            if(err)console.log(err);
            else resolve(data)
        })
    }).then((data)=>{
        if(data.length == 0 || data[0].verify == 0){
            const code = nanoid(6)
            const date = new Date().getTime();
            let sql = ''
            if(data.length == 0)sql = `insert into user (email,code,codeTime)values('${email}','${code}','${date}')`
            else sql = `update user set codeTime = '${date}',code = '${code}' where email = '${email}'`
            new Promise((resolve, reject) => {
                query(sql,(err,data)=>{
                    if(err)console.log(err);
                    else resolve(data)
                })
            }).then(()=>{
                const mailOptions = replayHTML(email,code)
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.response);
                });
                res.send({status:200})
            })
        }else{
            res.send({
                status:202,
                message:'该用户名已被注册'
            })
        }
    })
})

router.post('/register',
[
    check("email","email 是必须的").exists(),
    check("password","password 是必须的").exists(),
    check("code","code 是必须的").exists(),
],handleValidationErrors,
(req:Request,res:Response)=>{
    const { email,password,code } = req.body
    new Promise<any[]>((resolve, reject) => {
        query(`select * from user where email = '${email}'`,(err,data)=>{
            if(err)console.log(err);
            else resolve(data)
        })
    }).then((data)=>{
        if(data.length == 0 || data[0].verify == 0){
            new Promise<any[]>((resolve, reject) => {
                query(`select code,codeTime from user where email = '${email}'`,(err,data)=>{
                    if(err)console.log(err);
                    else resolve(data)
                })
            }).then((data)=>{
                if(data[0].code != code || new Date().getTime() - data[0].codeTime > 60 * 1000 * 5){
                    res.send({
                        status:202,
                        message:'验证码错误或已过期'
                    })
                }else{
                    new Promise((resolve, reject) => {
                        query(`update user set verify = 1,nickname = '大牛马用户_${nanoid(10)}',password = '${md5(md5(password,salt),salt)}' where email = '${email}'`,(err,data)=>{
                            if(err)console.log(err);
                            else resolve(data)
                        })  
                    }).then(()=>{
                        res.send({
                            status:200,
                        })
                    })
        
                }
            })
        }else{
            res.send({
                status:202,
                message:'该用户名已被注册'
            })
        }
    })
})

router.post('/login',validation,handleValidationErrors,(req:Request,res:Response)=>{
    let {nickname,password} = req.body
    new Promise<any[]>((resolve, reject) => {
        query(`select * from user where (email = '${nickname}' or nickname = '${nickname}') and password = '${md5(md5(password,salt),salt)}'`,(err,data)=>{
            if(err)console.log(err);
            else resolve(data)
        })
    }).then((data)=>{
        if(data.length != 0){
            const token = jwt.sign({email:data[0].email,nickname:data[0].nickname},'daniuma1145141919810',{
                expiresIn:'15d'
            })
            res.send({
                status:200,
                data:{
                    token: 'Bearer ' + token
                }
            })
        }else{
            res.send({
                status:201,
                message:'用户不存在或密码错误'
            })  
        }
    })

})

export default router
