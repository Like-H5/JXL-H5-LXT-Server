const express = require("express");
const path = require("path");

const {rizhiM, notFoundMF, handlerErrorMF, crossDomainM} = require("./middleware/sz_middleware")

const homeRouter = require("./routers/homeRouter")

let app = express();

app.use(crossDomainM);

app.use(express.json(), express.urlencoded({extended: true}));
app.use(rizhiM)

app.use(express.static(path.resolve(__dirname, "public")));

// 挂载路由中间件
app.use("/", homeRouter);

// 404
app.use(notFoundMF(path.resolve(__dirname, "./defaultPages/404.html")));

// 500
app.use(handlerErrorMF(path.resolve(__dirname, "./defaultPages/500.html")))

app.listen(5000, () => {
    console.log("撩学堂-后端项目服务器启动成功: localhost:5000/");
})