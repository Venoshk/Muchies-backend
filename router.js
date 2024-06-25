const express = require("express");
const router  = express.Router();
const upload  = require("./middlewares/multer");
const path    = require('path');
const Controllers = require("./controllers/products")

router.use("/uploads", express.static(path.join(__dirname, 'uploads')));

router.get("/product", Controllers.getProduct);
router.get("/product/:id", Controllers.getProductById);
router.post("/auth/register", upload.single("image"), Controllers.createProduct);
router.post("/atualizar/product/:id", upload.single("image"), Controllers.updateProduct)
router.delete("/remove/:id", Controllers.deleteProduct);
module.exports = router;
