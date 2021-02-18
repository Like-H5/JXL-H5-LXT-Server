let express = require('express');
let router = express.Router();

router.get("/ov_user", (req, resp) => {
    let data = {
        today: 0,
        total: 0
    }
    resp.tool.execSQL("select count(*) as today from t_user where to_days(register_time) = to_days(now());", [], result => {
        data.today = result[0].today
        resp.tool.execSQL("select count(*) as total from t_user;", [], result => {
            data.total = result[0].total
            resp.json(resp.tool.ResponseTemp(0, "获取用户统计成功", data))
        })
    })
})
router.get("/ov_teacher", (req, resp) => {
    let data = {
        total: 0
    }
    resp.tool.execSQL("select count(*) as total from t_teacher;", [], result => {
        data.total = result[0].total
        resp.json(resp.tool.ResponseTemp(0, "获取讲师统计成功", data))
    })
})
router.get("/ov_course", (req, resp) => {
    let data = {
        total: 0
    }
    resp.tool.execSQL("select count(*) as total from t_course;", [], result => {
        data.total = result[0].total
        resp.json(resp.tool.ResponseTemp(0, "获取课程统计成功", data))
    })
})
router.get("/ov_article", (req, resp) => {
    let data = {
        total: 0
    }
    resp.tool.execSQL("select count(*) as total from t_news;", [],result => {
        data.total = result[0].total
        resp.json(resp.tool.ResponseTemp(0, "获取文章统计成功", data))
    })
})
router.get("/ov_comment", (req, resp) => {
    let score = req.query.score || 0
    let sql = `
        SELECT
        tc.id AS comment_id,
        tc.score AS comment_score,
        tc.content AS comment_content,
        tc.create_time AS comment_time,
        tc.user_id AS user_id,
        tc.course_id AS course_id,
        tu.header AS user_header,
        tu.nick_name AS user_name 
        FROM
        t_comments AS tc
        LEFT JOIN t_user AS tu ON tc.user_id = tu.id 
        WHERE
        tc.score = ?
        ORDER BY
        create_time DESC
    `;
    resp.tool.execSQLTEMPAutoResponse(sql, [score], "获取评论列表成功")
})

module.exports = router;
