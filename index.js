const express    = require('express');
const app        = express();
const connection = require("./database");
const router     = require("./router");
const cors       = require("cors");

app.use(express.json());
app.use(cors());


app.use('/uploads', express.static('uploads'));

// Usar rotas definidas no router.js
app.use("/", router);

connection();

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
