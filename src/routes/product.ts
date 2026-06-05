import { Router } from 'express';
import type { Product } from '../types/Product';

let products: Product[] = [
    { id: 1, name: "Laptop Pro", price: 999, stock: 5, category: "Électronique" },
    { id: 2, name: "Souris Gaming", price: 29, stock: 50, category: "Électronique" },
    { id: 3, name: "T-Shirt", price: 19, stock: 0, category: "Vêtements" }
];

export const PRODUCT_URL = "/api/products";

const productRouter = Router();

productRouter.get('/', (req, res) => {
    res.json(products);
});

productRouter.get('/:id', (req, res) => {
    const pId = parseInt(req.params.id, 10)
    const product = products.find(p => p.id === pId)
    return product ? res.json(product) : (res.status(404).json({ error: "Produit non trouvé" }));
});

productRouter.post("/", (req, res) => {
    const product: Product = req.body;
    if (!product.name
        || product.name.trim() === ''
        || product.price <= 0
    )
        return res.status(400).json({ error: "Données invalides" });

    //recherche le nouvel id avant ajout.
    const newId = Math.max(...products.map(p => p.id), 0) + 1;

    //crée le nouveau produit
    const newProduct: Product = {
        id: newId,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category
    }

    //ajoute le nouveau produit
    products.push(newProduct);

    res.status(201).json(newProduct);
});

productRouter.patch('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const productIndex = products.findIndex(p => p.id === id);
    const updatedProduct: Partial<Product> = req.body;

    //verifier que le produit existe
    if (productIndex === -1) {
        return res.status(404).json({ error: "Produit non trouvé" });
    }

    // Valider seulement les champs envoyés
    if (updatedProduct.name !== undefined && updatedProduct.name.trim() === '') {
        return res.status(400).json({ error: 'Nom invalide' });
    }
    if (updatedProduct.price !== undefined && updatedProduct.price <= 0) {
        return res.status(400).json({ error: 'Prix invalide' });
    }
    if (updatedProduct.stock !== undefined && updatedProduct.stock < 0) {
        return res.status(400).json({ error: 'Stock invalide' });
    }

    products[productIndex] = { ...products[productIndex], ...updatedProduct };

    res.json(products[productIndex]);

});

productRouter.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!products.find((p => p.id === id))) {
        return res.status(404).json({ error: "Produit non trouvé" });
    }
    products = products.filter((p => p.id !== id));
    res.json({ message: `Produit ${id} supprimé` });

})

export default productRouter;