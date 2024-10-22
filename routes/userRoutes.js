const express = require('express');
const { testingApp,testingPost } = require('../controller/userCintroller');
const app = express();

app.get("/", testingApp);
app.post("/", testingPost);

const userRoute = app
module.exports={userRoute}