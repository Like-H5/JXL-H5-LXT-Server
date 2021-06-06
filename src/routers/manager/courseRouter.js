let express = require('express');
let fs = require("fs");
let path = require("path");
let multer = require("multer");
let router = express.Router();

let fm_uploader = multer({dest: path.resolve(__dirname, "../../public/images/course")})
router.post("/upload_fm", fm_uploader.single("fm"), (req, resp) => {
    let file = req.file;
    let extName = path.extname(file.originalname);
    fs.renameSync(file.path, path.resolve(__dirname, "../../public/images/course", file.filename + extName))
    let newPath = `/images/course/${file.filename + extName}`;
    resp.send(resp.tool.ResponseTemp(0, "图片上传成功", {file_path: newPath}))
})
let video_uploader = multer({dest: path.resolve(__dirname, "../../public/videos")})
router.post("/upload_video", video_uploader.single("video"), (req, resp) => {
    let file = req.file;
    let extName = path.extname(file.originalname);
    fs.renameSync(file.path, path.resolve(__dirname, "../../public/videos", file.filename + extName))
    let newPath = `/videos/${file.filename + extName}`;
    resp.send(resp.tool.ResponseTemp(0, "视频上传成功", {file_path: newPath}))
})
router.get("/delete_file", (req, resp) => {
    const {file_path} = req.query
    if (!file_path) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入要删除的文件路径"))
        return null;
    }
    let fileFullPath = path.resolve(__dirname, "../../public" + file_path)
    fs.unlink(fileFullPath, err => {
        if (err) {
            resp.send(resp.tool.ResponseTemp(-1, "删除文件失败"))
        } else {
            resp.send(resp.tool.ResponseTemp(0, "删除成功"))
        }
    })
})
router.get("/delete", (req, resp) => {
    const {id} = req.query
    if (!id) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入ID"))
        return null;
    }

    // 1. 删除对应的图片
    resp.tool.execSQL(`select fm_url from t_course where id=?`, [id], result => {
        if (result.length > 0) {
            let filePath = path.resolve(__dirname, "../../public" + result[0].fm_url)
            fs.unlink(filePath, err => {
                // 2. 删除记录
                let sql = `delete from t_course where id=?;`
                resp.tool.execSQL(sql, [id],result => {
                    if (result.affectedRows === 1) {
                        resp.send(resp.tool.ResponseTemp(0, "删除成功", {id}))
                    } else {
                        resp.send(resp.tool.ResponseTemp(-1, "删除失败", {id}))
                    }
                })

            })
        } else {
            resp.send(resp.tool.ResponseTemp(-1, "ID对应记录不存在"))
        }
    })

})
router.get("/list", (req, resp) => {
    let {page_num = 1, page_size = 10} = req.query;
    page_num = +page_num;
    page_size = +page_size;
    let sql = `select id, title, fm_url, is_hot, category_id, teacher_id from t_course limit ?,?;`;
    resp.tool.execSQL(sql, [(page_num - 1) * page_size, page_size], course_list => {
        resp.tool.execSQL("select count(*) as total_count from t_course;", [],result => {
            resp.send(resp.tool.ResponseTemp(0, "获取数据成功", {
                course_list,
                total_count: result[0].total_count
            }))
        })

    })
})
router.get("/intro", (req, resp) => {
    const {id} = req.query;
    if (!id) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入课程ID"))
        return;
    }
    let sql = `select id, intro from t_course where id=?;`
    resp.tool.execSQLTEMPAutoResponse(sql, [id], result => {
        if (result.length > 0) return result[0];
        return {}
    })
})
router.get("/own_teachers", (req, resp) => {
    let sql = `select id, name from t_teacher;`;
    resp.tool.execSQLAutoResponse(sql);
})
router.get("/own_categories", (req, resp) => {
    let sql = `select id, title from t_course_category where parent_id=0;`
    resp.tool.execSQLAutoResponse(sql);
})
router.get('/outlines', (req, resp) => {
    const {course_id} = req.query
    if (!course_id) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入课程ID"))
        return;
    }
    let sql = `
        select
        id,
        title,
        video_url,
        num
        from 
        t_course_outline
        where
        t_course_outline.course_id = ${course_id}
        order by
        num;
    `
    resp.tool.execSQLAutoResponse(sql);
});
router.get("/comments", (req, resp) => {
    const {course_id} = req.query
    if (!course_id) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入课程ID"))
        return;
    }
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
        tc.course_id = ?
        ORDER BY
        create_time DESC
    `
    resp.tool.execSQLTEMPAutoResponse(sql, [course_id])
})
router.get("/detail", (req, resp) => {
    const {id} = req.query
    if (!id) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入课程ID"))
        return;
    }
    let sql = `select * from t_course where id=?;`
    resp.tool.execSQLTEMPAutoResponse(sql, [id], "查询课程详情成功!",result => {
        if (result.length > 0) return result[0];
        return {}
    })
})
router.post("/add", (req, resp) => {
    const {title, fm_url, is_hot, intro, teacher_id, category_id} = req.body
    let sql = `
        insert into t_course (title, fm_url, is_hot, intro, teacher_id, category_id) values (?, ?, ?, ?, ?, ?);
    `;
    resp.tool.execSQLTEMPAutoResponse(sql, [title, fm_url, is_hot, intro, teacher_id, category_id], "插入成功", result => {
        if (result.affectedRows > 0) {
            return {
                id: result.insertId,
                title, fm_url, is_hot, intro, teacher_id, category_id
            }
        }
        return {}
    })
})
router.post("/update", (req, resp) => {
    const {id, title, fm_url, is_hot, intro, teacher_id, category_id} = req.body;

    resp.tool.execSQL("select fm_url from t_course where id=?;", [id]).then(result=>{
        if (result.length > 0) {
            let oldPath = result[0].fm_url;
            fs.unlink(path.resolve(__dirname, "../../public/", "."+oldPath), () => {
                let sql = `
        update t_course set title=?, fm_url=?, is_hot=?, intro=?, teacher_id=? ,category_id=? where id=?;
    `
                resp.tool.execSQLTEMPAutoResponse(sql, [title, fm_url, is_hot, intro, teacher_id, category_id, id], "更新成功", result => {
                    if (result.affectedRows > 0) {
                        return {
                            id, title, fm_url, is_hot, intro, teacher_id, category_id
                        }
                    }
                    return {}
                })
            })
        }
    })


})
router.post("/update_is_hot", (req, resp) => {
    const {id, is_hot} = req.body
    let sql = `update t_course set is_hot=? where id=?;`
    resp.tool.execSQLTEMPAutoResponse(sql, [is_hot, id], "更新热门成功", result => {
        if (result.affectedRows > 0) {
            return {
                id, is_hot
            }
        }
        return {
            id, is_hot
        }
    })
})
router.post("/update_teacher", (req, resp) => {
    const {id, teacher_id} = req.body
    let sql = `update t_course set teacher_id=? where id=?;`
    resp.tool.execSQLTEMPAutoResponse(sql, [teacher_id, id], "更新所属讲师成功", result => {
        if (result.affectedRows > 0) {
            return {
                id, teacher_id
            }
        }
        return {
            id, teacher_id
        }
    })
})
router.post("/update_category", (req, resp) => {
    const {id, category_id} = req.body
    let sql = `update t_course set category_id=? where id=?;`
    resp.tool.execSQLTEMPAutoResponse(sql, [category_id, id], "更新所属分类成功", result => {
        if (result.affectedRows > 0) {
            return {
                id, category_id
            }
        }
        return {
            id, category_id
        }
    })
})
router.post('/add_outline', function (req, resp) {
    const {course_id, num, title, video_url} = req.body
    let sql = `
        insert into t_course_outline (course_id, num, title, video_url) values (?, ?, ?, ?)
    `
    resp.tool.execSQLTEMPAutoResponse(sql, [course_id, num, title, video_url], "新增大纲成功", result => {
        if (result.affectedRows > 0) {
            return {
                id: result.insertId,
                course_id, num, title, video_url
            }
        }
        return {}
    })
});
router.get('/del_outline', function (req, resp) {
    const {outline_id} = req.query
    if (!outline_id) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入需要删除的大纲ID"))
        return null;
    }

    // 1. 删除对应的视频
    resp.tool.execSQL(`select video_url from t_course_outline where id=?`, [outline_id], result => {
        if (result.length > 0) {
            let filePath = path.resolve(__dirname, "../../public","."+result[0].video_url)
            fs.unlink(filePath, err => {
                // 2. 删除记录
                let sql = `delete from t_course_outline where id=?;`
                resp.tool.execSQL(sql, [outline_id], result => {
                    if (result.affectedRows === 1) {
                        resp.send(resp.tool.ResponseTemp(0, "删除成功", {outline_id}))
                    } else {
                        resp.send(resp.tool.ResponseTemp(-1, "删除失败", {outline_id}))
                    }
                })

            })
        }
    })

});

module.exports = router;
