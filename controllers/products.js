const Product = require("../models/Products");
const fs = require('fs');
const mongoose = require("mongoose");
const path = require('path');

const getProduct = async (req, res) => {    
    const {type} = req.query;

    try {
        let products;
        if(type){
            products = await Product.find( {type} );
        }else{
            products = await Product.find();
        }

        if (!products.length) {
            return res.status(404).json({ msg: "Nenhum produto!" });
        }

        const shuffledProducts = products.sort(() => 0.5 - Math.random())

        const productsWithImageUrl = shuffledProducts.map((product) => {
        const imageUrl = product.image ? `https://${req.get('host')}/uploads/${product.image}` : "";
        return { ...product._doc, imageUrl }});

        res.status(200).json({products: productsWithImageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar produtos." });
    }

}

const getProductById = async (req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({msg: 'Protudo não encontrado!'})
    }

    try {
        const product = await Product.findById(id);

        if(!product){
            return res.status(404).json({msg: 'Protudo não encontrado!'})
        }

        return res.status(200).json({msg: product});
    } catch (error) {
        res.status(400).json({msg: 'Houve algo, tente novamente main tarde'})
    }
}

const createProduct = async (req, res) =>{
    const { name, description, price, type } = req.body;
    const imageFile = req.file;

    const fields = { name, description, price, type, image: imageFile };

    // Verificar se algum campo está vazio
    for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            return res.status(400).json({ error: `Campo ${key} está vazio!` });
        }
    }

    try {
        const productExist = await Product.findOne({ name });

        if (productExist) {
            // Se o produto já existir, remover o arquivo de imagem da pasta temporária
            fs.unlink(imageFile.path, () => {
                return res.status(422).json({ msg: "Já temos um produto com este nome" });
            });
        } else {
            // Salvar a imagem na pasta 'uploads' somente se o produto não existir
            const imagePath = path.join('./uploads', imageFile.filename);
            fs.rename(imageFile.path, imagePath, async (err) => {
                if (err) {
                    return res.status(500).json({ msg: 'Erro ao salvar a imagem!' });
                }

                // Criar novo produto
                const product = new Product({
                    name,
                    description,
                    price,
                    type,
                    image: imageFile.filename // Apenas o nome do arquivo, não o caminho completo
                });

                try {
                    await product.save();
                    res.status(200).json({ msg: "Produto adicionado com sucesso!" });
                } catch (err) {
                    // Remover a imagem da pasta se houver erro ao salvar o produto
                    fs.unlink(imagePath, () => {
                        res.status(500).json({ msg: "Aconteceu algo, tente novamente mais tarde!" });
                        console.error(err);
                    });
                }
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Erro ao verificar produto existente." });
    }
};

const deleteProduct = async (req, res) => {
    const {id} = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({msg: 'Protudo não encontrado!'})
    }

    try {

        const product = await Product.findByIdAndDelete(id);
        
        if(!product){
            res.status(404).json({msg: 'Protudo não encontrado!'});
        }
        const imagePath = path.join('./uploads', product.image);

        if(imagePath){
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Erro ao deletar a imagem:', err);
                    return res.status(500).json({ msg: 'Erro ao deletar a imagem!' });
                }
            })
            res.status(200).json({msg: 'Produto deletado!'})
        }
       
       
    } catch (error) {
        res.status(500).json({msg: 'Houve algo ao tentar deletar esse produto!'})
    }
}

const updateProduct = async (req, res) => {
    const { name, description, price, type } = req.body;
    const { id } = req.params;
    const imageFile = req.file;

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ msg: 'Produto não encontrado!' });
        }

        // Atualizar os campos do produto se fornecidos
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.type = type || product.type;

        if (imageFile) {
            const oldImagePath = path.join('./uploads', product.image);

            // Deletar a imagem antiga da pasta uploads
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    return res.status(400).json({msg: 'aconteceu algo há deletar a imagem antiga '})
                }
            });

            // Atualizar o campo de imagem com o nome do novo arquivo de imagem
            product.image = imageFile.filename;
        }

        // Salvar as atualizações do produto no banco de dados
        await product.save();

        res.status(200).json({ msg: 'Produto atualizado com sucesso!', product });
    } catch (error) {
        console.error('Erro ao atualizar o produto:', error);
        res.status(500).json({ msg: 'Erro ao atualizar o produto!' });
    }
}

module.exports = {
    getProduct,
    getProductById,
    createProduct,
    deleteProduct,
    updateProduct
}