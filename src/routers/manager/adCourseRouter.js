const express = require('express');
const fs = require("fs");
const path = require("path");
const multer = require("multer");

let router = express.Router();

router.get("/delete_file", (req, resp) => {
    const {file_path} = req.query
    if (!file_path) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入图片路径", {}))
        return null;
    }
    let fileFullPath = path.resolve(__dirname, "../../public" + file_path)
    fs.unlink(fileFullPath, err => {
        if (err) {
            resp.send(resp.tool.ResponseTemp(-1, "删除失败", {}))
        } else {
            resp.send(resp.tool.ResponseTemp(0, "删除成功", {}))
        }
    })
})

router.get("/delete", (req, resp) => {
    const {id} = req.query
    if (!id) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入要删除的焦点图ID", {}))
        return null;
    }

    // 1. 删除对应的图片
    resp.tool.execSQL("select ad_url from t_ad where id=?", [id]).then(result => {
        if (result.length > 0) {
            let filePath = path.resolve(__dirname, "../../public" + result[0].ad_url)
            fs.unlink(filePath, err => {
                    // 2. 删除记录
                    let sql = `delete from t_ad where id=?;`;
                    resp.tool.execSQLTEMPAutoResponse(sql, [id], "删除记录成功", result => ({}))
            })
        }
    })

})

router.get("/link_course", (req, resp) => {
    let sql = `select id, title from t_course;`
    resp.tool.execSQLAutoResponse(sql);
})

router.get("/list", (req, resp) => {
    resp.tool.execSQLAutoResponse(`
    SELECT
        ta.id AS id,
        ta.title,
        ta.ad_url,
        ta.course_id,
        tc.title AS course_title,
        tc.fm_url 
    FROM
        t_ad AS ta
        LEFT JOIN t_course AS tc ON ta.course_id = tc.id;
    `)
})

let uploader = multer({dest: path.resolve(__dirname, "../../public/images/banner")})
router.post("/upload_ad_img", uploader.single("ad_img"), (req, resp) => {
    let file = req.file;
    let extName = path.extname(file.originalname);
    fs.renameSync(file.path, path.resolve(__dirname, "../../public/images/banner", file.filename + extName))
    let newPath = `/images/banner/${file.filename + extName}`;
    resp.send(resp.tool.ResponseTemp(0, "图片上传成功", {file_path: newPath}))
})

router.post("/add", (req, resp) => {
    const {title, ad_url, course_id} = req.body
    let sql = `
        insert into t_ad (title, ad_url, course_id) values (?, ?, ?);
    `
    resp.tool.execSQLTEMPAutoResponse(sql, [title, ad_url, course_id], "插入成功", result => {
        return {
            insertId: result.insertId
        }
    })
})

router.post("/update", (req, resp) => {
    const {id, title, ad_url, course_id} = req.body
    let sql = `
        update t_ad set title=?, ad_url =?, course_id=? where id=?;
    `
    resp.tool.execSQLTEMPAutoResponse(sql, [title, ad_url, course_id, id], "更新成功", result => {
        return {
            id
        }
    })
})

module.exports = router;
