let express = require('express');
let router = express.Router();

// 登录
router.post("/login", (req, resp) => {
    const {account, password} = req.body
    if (account.length === 0 || password.length === 0) {
        resp.send(resp.tool.ResponseTemp(-1, "请传递account账号, password密码"))
        return null
    }
    let sql = "select id, account, nick_name from t_admin where account=? and password=?"
    resp.tool.execSQL(sql, [account, password]).then((result) => {
        if (result.length > 0) {
            resp.send(resp.tool.ResponseTemp(0, "登录成功", result[0]));
        } else {
            resp.send(resp.tool.ResponseTemp(-1, "登录失败", {}));
        }
    })
})

// 注册
router.post("/register", (req, resp) => {
    const {account, password, nick_name} = req.body
    if (account.length === 0 || password.length === 0) {
        resp.send(resp.tool.ResponseTemp(-2, "请传递account账号, password密码"))
        return null
    }
    // 查询是否有重复账号
    resp.tool.execSQL(`select * from t_admin where account = ?;`,[account], result => {
        if (result.length > 0) {
            resp.send(resp.tool.ResponseTemp(-1, "账号已经存在, 请重新输入"))
            return null
        } else {
            resp.tool.execSQL(`insert into t_admin (account, password, nick_name) values (?, ?, ?)`,[account, password, nick_name], (result) => {
                if (result.affectedRows === 1) {
                    resp.send(resp.tool.ResponseTemp(0, "注册成功", {
                        id: result.insertId,
                        account: account,
                        nick_name: nick_name,
                    }))
                }
            })
        }
    })
})

module.exports = router;
