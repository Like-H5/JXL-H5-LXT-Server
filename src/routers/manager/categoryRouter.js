let express = require('express');
let router = express.Router();


router.get("/list", (req, resp) => {
    let sql = `select id, title from t_course_category where parent_id=0;`;
    resp.tool.execSQLAutoResponse(sql)
})

router.post("/update", (req, resp) => {
    const {id, title} = req.body
    if (!id) {
        resp.json(resp.tool.ResponseTemp(-1, "请传入参数ID"))
        return null;
    }
    // 2. 更新
    let sql = `update t_course_category set title=? where id=?;`
    resp.tool.execSQLTEMPAutoResponse(sql, [title, id], "更新成功", result => ({
        id,
        title
    }))

})

router.get("/delete", (req, resp) => {
    const {id} = req.query
    if (!id) {
        if (!id) {
            resp.json(resp.tool.ResponseTemp(-1, "请传入参数ID"))
            return null;
        }
        return null;
    }
    // 2. 删除记录
    let sql = `delete from t_course_category where id=?;`
    resp.tool.execSQLTEMPAutoResponse(sql, [id], "删除成功", result => ({
        del_id: id
    }))

})


router.post("/add", (req, resp) => {
    const {title} = req.body
    let sql = `
        insert into t_course_category (title) values (?);
    `
    resp.tool.execSQLTEMPAutoResponse(sql, [title], "新增成功", result => {
        if (result.affectedRows === 1) {
            return {
                id: result.insertId,
                title
            }
        } else {
            return {}
        }
    })
})


module.exports = router;
