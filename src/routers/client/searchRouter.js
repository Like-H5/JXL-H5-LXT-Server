const express = require("express");
const {decode} = require('html-entities');
let router = express.Router();

router.get("/course", (req, resp) => {
    let {key=""} = req.query;

    key = decode(key)
    // console.log(key)
    resp.tool.execSQLAutoResponse(`
    SELECT
        t_course.id,
        category_id,
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
        title LIKE '%${key}%';
    `, "课程的搜索结果!")
})

router.get("/teacher", (req, resp) => {
    let {key=""} = req.query;
    key = decode(key)
    resp.tool.execSQLAutoResponse(`
    SELECT
        t_teacher.id,
        header,
        position,
        name,
        is_star,
        count( t_course.id ) AS course_count,
        t_teacher.intro 
    FROM
        t_teacher
        LEFT JOIN t_course ON t_teacher.id = t_course.teacher_id 
    GROUP BY
        t_teacher.id  
    HAVING
        name LIKE '%${key}%';
    `, "讲师的搜索结果!")
})

router.get("/article", (req, resp) => {
    let {key=""} = req.query;
    key = decode(key)
    resp.tool.execSQLAutoResponse(`
    SELECT
        id,
        title,
        intro,
        create_time 
    FROM
        t_news 
    WHERE
        title LIKE '%${key}%' 
    ORDER BY
        create_time DESC;
    `, "文章的搜索结果!")
})

router.get("/all", (req, resp) => {
    let {key=""} = req.query;
    key = decode(key)
    Promise.all([resp.tool.execSQL(`
    SELECT
        t_course.id,
        category_id,
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
        title LIKE '%${key}%';
    `), resp.tool.execSQL(`
    SELECT
        t_teacher.id,
        header,
        position,
        name,
        is_star,
        count( t_course.id ) AS course_count,
        t_teacher.intro 
    FROM
        t_teacher
        LEFT JOIN t_course ON t_teacher.id = t_course.teacher_id 
    GROUP BY
        t_teacher.id  
    HAVING
        name LIKE '%${key}%';
    `), resp.tool.execSQL(`
    SELECT
        id,
        title,
        intro,
        create_time 
    FROM
        t_news 
    WHERE
        title LIKE '%${key}%' 
    ORDER BY
        create_time DESC;
    `)]).then(([courseResult, teacherResult, articleResult]) => {
        resp.send(resp.tool.ResponseTemp(0, "查找成功", {
            courseResult,
            teacherResult,
            articleResult
        }))
    })

})


module.exports = router;