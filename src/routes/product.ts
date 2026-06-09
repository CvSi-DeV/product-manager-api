import { Router } from 'express';
import prisma from '../lib/prisma';
import authMiddleware from '../middleware/authMiddleware';

export const PRODUCT_URL = "/api/products";
const productRouter = Router();

productRouter.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur Prisma" });
    }
});

productRouter.get('/:id', async (req, res) => {
    try {
        const pId = parseInt(req.params.id, 10)
        const product = await prisma.product.findUnique({ where: { id: pId } })
        return product ? res.json(product) : (res.status(404).json({ error: "Produit non trouvé" }));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur Prisma" });
    }
});

productRouter.post("/", authMiddleware, async (req, res) => {
    const product = req.body;

    try {
        if (!product.name || product.name.trim() === '' || product.price <= 0) {
            console.log(product);
            return res.status(400).json({ error: "Données invalides" });
        }

        const newProduct = await prisma.product.create({
            data: {
                name: product.name,
                price: product.price,
                stock: product.stock,
                category: product.category
            }
        })
        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur Prisma" });
    }
});

productRouter.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id as string, 10);
        const dataToUpdate = req.body;

        // Valider seulement les champs envoyés
        if (dataToUpdate.name !== undefined && dataToUpdate.name.trim() === '') {
            return res.status(400).json({ error: 'Nom invalide' });
        }
        if (dataToUpdate.price !== undefined && dataToUpdate.price <= 0) {
            return res.status(400).json({ error: 'Prix invalide' });
        }
        if (dataToUpdate.stock !== undefined && dataToUpdate.stock < 0) {
            return res.status(400).json({ error: 'Stock invalide' });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: id },
            data: dataToUpdate
        });

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur Prisma" });
    }
});

productRouter.delete('/:id', authMiddleware, async (req, res) => {
    const id = parseInt(req.params.id as string, 10);

    try {
        await prisma.product.delete({
            where: { id: id }
        })
        res.json({ message: `Produit ${id} supprimé` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur Prisma" });
    }
})

export default productRouter;