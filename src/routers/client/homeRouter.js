const express = require("express");

let router = express.Router();

// 1. 网站联系方式等信息
router.get("/web_config", (req, resp) => {

    resp.tool.execSQLAutoResponse(`
        SELECT
            wechat_qrcode,
            mini_program,
            wb_qrcode,
            app,
            tel 
        FROM
            t_config 
        LIMIT 1;
    `,"查询网站联系方式成功!",function (result) {
        if (result.length > 0) {
            return result[0];
        } else {
            return {}
        }
    })

    // resp.send("sz")

})

// 2. 首页导航栏信息
router.get("/nav", (req, resp) => {
    resp.tool.execSQLAutoResponse(`
    SELECT
        id,
        title,
        route 
    FROM
        t_nav;
    `, "导航菜单数据获取成功!")
})

// 3. 获取焦点图课程信息
router.get("/focus_img", (req, resp) => {
    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            title,
            ad_url,
            course_id 
        FROM
            t_ad 
        WHERE
            is_show = 1;
    `, "查询焦点图成功!")
})

// 4. 获取热门好课
router.get("/hot_course", (req, resp) => {
    resp.tool.execSQLAutoResponse(`
        SELECT
            t_course.id,
            title,
            fm_url,
            is_hot,
            count( t_comments.id ) AS comment_total_count,
            avg( IFNULL( t_comments.score, 0 ) ) AS comment_avg_score 
        FROM
            t_course
            LEFT JOIN t_comments ON t_course.id = t_comments.course_id 
        GROUP BY
            t_course.id 
        HAVING
            is_hot = 1 
        LIMIT 10;
    `, "查询热门课程成功!")

})

// 5. 获取明星讲师
router.get("/star_teacher", (req, resp) => {


    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            name,
            header,
            position,
            intro 
        FROM
            t_teacher 
        WHERE
            is_star = 1 
        LIMIT 6;
    `, "查询明星讲师成功!")
})

// 6. 获取最新文章
router.get("/last_news", (req, resp) => {
    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            title,
            create_time 
        FROM
            t_news 
        ORDER BY
            create_time DESC 
        LIMIT 10;
    `, "查询最新文章成功!")
})

module.exports = router;