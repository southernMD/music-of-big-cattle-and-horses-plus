import mysql from "mysql"
 
let pool = mysql.createPool({
    host:"localhost",    //主机名
    user:"root",           //账户
    password:"m123042012",   //密码
    database:"music"    //使用的数据表
})
 
//不用修改
function query(sql,callback){
    pool.getConnection(function(err,coonection){
        coonection.query(sql,function(err,rows){
            callback(err,rows)
            coonection.release()
        })
    })
}
 
export default query