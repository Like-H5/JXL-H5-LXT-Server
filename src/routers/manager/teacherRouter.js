let express = require('express');
let fs = require("fs");
let path = require("path");
let multer = require("multer");

let router = express.Router();

let headerUploader = multer({dest: path.resolve(__dirname, "../../public/images/teacher")})
router.post("/upload_header", headerUploader.single("header"), (req, resp) => {
    let file = req.file;
    let extName = path.extname(file.originalname);
    fs.renameSync(file.path, path.resolve(__dirname, "../../public/images/teacher", file.filename + extName))
    let newPath = `/images/teacher/${file.filename + extName}`;
    resp.send(resp.tool.ResponseTemp(0, "图片上传成功", {file_path: newPath}))
})

router.get("/delete_file", (req, resp) => {
    const {file_path} = req.query
    if (!file_path) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入图片途径: file_path"))
        return null;
    }
    let fileFullPath = path.resolve(__dirname, "../../public" + file_path)
    fs.unlink(fileFullPath, err => {
        if (err) {
            resp.send(resp.tool.ResponseTemp(-1, "图片删除失败"))
        } else {
            resp.send(resp.tool.ResponseTemp(0, "图片删除成功"))
        }
    })
})

router.get("/delete", (req, resp) => {
    const {id} = req.query
    if (!id) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入id"))
        return null;
    }

    // 1. 删除对应的图片
    resp.tool.execSQL(`select header from t_teacher where id=?;`, [id], result => {
        if (result.length > 0) {
            let filePath = path.resolve(__dirname, "../../public" + result[0].header)
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
            // 2. 删除记录
            let sql = `delete from t_teacher where id=?;`
            resp.tool.execSQL(sql, [id], result => {
                if (result.affectedRows > 0) {
                    resp.send(resp.tool.ResponseTemp(0, "删除成功"))
                } else {
                    resp.send(resp.tool.ResponseTemp(-1, "删除失败"))
                }

            })

        }
    })

})

router.get("/list", (req, resp) => {
    let sql = `select * from t_teacher;`
    resp.tool.execSQLAutoResponse(sql);
})

router.post("/add", (req, resp) => {
    const {name, is_star, intro, header, position} = req.body
    let sql = `
        insert into t_teacher (name, is_star, intro, header, position) values (?, ?, ?, ?, ?);
    `
    resp.tool.execSQLTEMPAutoResponse(sql, [name, is_star, intro, header, position], "新增成功", result=>{
        if (result.affectedRows > 0) {
            return {
                id: result.insertId,
                name, is_star, intro, header, position
            }
        }
        return {}
    })
})

router.post("/update", (req, resp) => {
    const {id, name, is_star, intro, header, position} = req.body;
    if (!id) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入id"))
        return null;
    }
    let sql = `
        update t_teacher set name=?, is_star=?, intro=?, header=?, position=? where id=?;
    `
    resp.tool.execSQLTEMPAutoResponse(sql, [name, is_star, intro, header, position, id], "更新成功", result => {
        return {id, name, is_star, intro, header, position}
    })
})


router.post("/update_is_star", (req, resp) => {
    const {id, is_star} = req.body
    if (!id) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入id"))
        return null;
    }
    let sql = `update t_teacher set is_star=? where id=?;`
    resp.tool.execSQLTEMPAutoResponse(sql, [is_star, id], "更新成功", result => {
        return {id, is_star}
    })
})

module.exports = router;
