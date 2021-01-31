const express = require("express");

let router = express.Router();

router.get("/web_config", (req, resp) => {

    abc()
    resp.send({
        test: "成功!"
    })
})


module.exports = router;