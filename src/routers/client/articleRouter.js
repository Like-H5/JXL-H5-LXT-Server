const express = require("express");

let router = express.Router();

// 1. 文章列表
router.get("/list", (req, resp) => {
    const {page_num=1, page_size=6} = req.query;
    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            title,
            intro,
            create_time 
        FROM
            t_news 
        ORDER BY
            create_time DESC
            LIMIT ${(page_num - 1) * page_size}, ${page_size};
    `, "获取文章列表成功!")
})

// 2. 文章详情
router.get("/detail/:id", (req, resp) => {
    const {id} = req.params;
    resp.tool.execSQLAutoResponse(`
    SELECT
        id,
        title,
        create_time,
        content 
    FROM
        t_news 
    WHERE
        id = ${id};
    `, "获取文章详情成功!", results=>{
        if (results.length >= 1) {
            return results[0]
        } else {
            return {}
        }
    })
})


module.exports = router;