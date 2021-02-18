let express = require('express');
let router = express.Router();


router.get("/list", (req, resp) => {
    let sql = `select id, title, intro, create_time from t_news order by create_time desc;`
    resp.tool.execSQLAutoResponse(sql)
})

router.get("/detail/:id", (req, resp) => {
    const {id} = req.params
    let sql = `select id, title, intro, content, create_time from t_news where id=?;`
    resp.tool.execSQLTEMPAutoResponse(sql, [id], "查询详情成功", result=>{
        if (result.length > 0) return result[0];
        return {}
    })
})


router.get("/delete", (req, resp) => {
    const {id} = req.query
    let sql = `delete from t_news where id = ?;`
    resp.tool.execSQLTEMPAutoResponse(sql, [id], "删除成功", result=>({}))
})

router.post("/add", (req, resp) => {
    const {title, intro, content} = req.body
    let sql = `
        insert into t_news (title, intro, content) values (?, ?, ?);
    `
    resp.tool.execSQL(sql, [title, intro, content], result=>{
        resp.tool.execSQLTEMPAutoResponse("select * from t_news where id=?;", [result.insertId], "新增成功", result=>result[0])
    })
})

router.post("/update", (req, resp) => {
    const {id, title, intro, content} = req.body
    let sql = `
        update t_news set title=?, intro=?, content=? where id=?;
    `
    resp.tool.execSQL(sql, [title, intro, content, id],result=>{
        resp.tool.execSQLTEMPAutoResponse("select * from t_news where id = ?;", [id], "更新成功", result=>result[0]);
    })
})


module.exports = router;
