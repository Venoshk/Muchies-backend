const express     = require('express');
const app         = express();
const connection  = require("./database");
const router      = require("./router");
const cors        = require("cors")
app.use(express.json());
app.use(cors());
app.use(router)
connection();
app.listen(4004, () => console.log("http://localhost:4004"))