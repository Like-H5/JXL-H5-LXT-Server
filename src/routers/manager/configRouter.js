let express = require('express');
let fs = require("fs");
let path = require("path");
let router = express.Router();
let multer = require("multer")


router.get("/delete_file", (req, resp) => {
    const {file_path} = req.query
    if (!file_path) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入要删除的图片路径: file_path"))
        return null;
    }
    let fileFullPath = path.resolve(__dirname, "../../public"+file_path)
    fs.unlink(fileFullPath, err=>{
        if (err) {
            resp.send(resp.tool.ResponseTemp(-1, "删除失败", {file_path}))
        } else {
            resp.send(resp.tool.ResponseTemp(0, "删除成功", {file_path}))
        }
    })
})

const uploader = multer({dest: path.resolve(__dirname, "../../public/images/config")})
router.post("/upload_img", uploader.single("img"), (req, resp)=>{
    let file = req.file;
    let extName = path.extname(file.originalname);
    fs.renameSync(file.path, path.resolve(__dirname, "../../public/images/config", file.filename + extName))
    let newPath = `/images/config/${file.filename + extName}`;
    resp.send(resp.tool.ResponseTemp(0, "图片上传成功", {file_path: newPath}))
})

router.get("/detail", (req, resp)=>{
    let sql = `select id, wechat_qrcode, mini_program, wb_qrcode, app, tel from t_config order by id limit 1;`
    resp.tool.execSQLAutoResponse(sql, "获取联系信息成功!", result=>{
        if (result.length>0) return result[0];
        return {}
    })
})

router.post("/update", (req, resp)=>{
    const {wechat_qrcode, mini_program, tel, wb_qrcode, app, id} = req.body;
    if (!id) {
        resp.send(resp.tool.ResponseTemp(-2, "请传入ID"));
        return;
    }

    let sql = `
        update t_config set wechat_qrcode=?, mini_program =?, tel=?, wb_qrcode=?, app=? where id=?;
    `
    resp.tool.execSQLTEMPAutoResponse(sql, [wechat_qrcode, mini_program, tel, wb_qrcode, app, id], "更新成功",result=>{
        if (result.affectedRows === 1) {
            return {wechat_qrcode, mini_program, tel, wb_qrcode, app, id}
        } else {
           return {}
        }
    })
})

module.exports = router;
