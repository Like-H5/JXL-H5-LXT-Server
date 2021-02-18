let express = require('express');
let router = express.Router();

// 每个学科分类下的课程数
router.get("/category_course_count", (req, resp) => {
    resp.tool.execSQLAutoResponse(`
        SELECT
        tcc.id AS category_id,
        tcc.title AS category_name,
        count( tc.id ) AS course_count 
        FROM
        t_course_category AS tcc
        LEFT JOIN t_course AS tc ON tc.category_id = tcc.id 
        GROUP BY
        tcc.id;
    `, "查询分类课程统计成功")
})

// 近一周内的每日用户新增数量
router.get("/user_week_count", (req, resp) => {
    resp.tool.execSQLAutoResponse(`
        SELECT
        register_time,
        count(*) AS register_count 
        FROM
        t_user 
        WHERE
        date_sub( curdate(), INTERVAL 7 DAY ) < date( register_time ) 
        GROUP BY
        TO_DAYS( register_time ) 
        ORDER BY
        register_time;
    `, "最近一周的用户增长统计")
})

// 评价分布
router.get("/comment_score_count", (req, resp) => {
    resp.tool.execSQLAutoResponse(`
        SELECT
        score,
        count(*) AS score_count 
        FROM
        t_comments 
        GROUP BY
        score;
    `, "评价分布统计")
})


module.exports = router;
