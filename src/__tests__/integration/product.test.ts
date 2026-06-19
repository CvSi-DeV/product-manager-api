import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../../app";
import prisma from "../../lib/prisma";

jest.mock('../../lib/prisma', () => ({
    __esModule: true,
    default: {
        product: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        }
    }
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const TEST_PAYLOAD = { id: 1, email: 'test@test.com', role: 'user' };
const TEST_SECRET = process.env.JWT_SECRET!;
const getToken = (valid: boolean = true, admin: boolean = false) => {
    const role_payload = !admin ? TEST_PAYLOAD : { ...TEST_PAYLOAD, role: 'admin' };
    return valid ? jwt.sign(role_payload, TEST_SECRET, { expiresIn: '1h' }) : '';
}


describe('Get /api/products/', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Retourne la liste des produits sans token http code 200', async () => {
        //Arrange
        mockPrisma.product.findMany.mockResolvedValue(
            [{ id: 1, name: 'Unique Mock Product', price: 1487, stock: 10, category: 'Autre', createdAt: new Date() }]
        );
        // Act
        const response = await request(app).get('/api/products/');
        // Assert 
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect((response.body).length).toBe(1);
        expect(mockPrisma.product.findMany).toHaveBeenCalledTimes(1);
    });

    it('Prisma retourne http code 500', async () => {
        //Arrange 
        mockPrisma.product.findMany.mockRejectedValue(new Error('Prisma HS'));
        //Act
        const response = await request(app).get('/api/products/');
        //Assert 
        expect(response.status).toBe(500);
        expect((response.error)).toBeDefined();
        expect(mockPrisma.product.findMany).toHaveBeenCalledTimes(1);
    });
});

describe('Get /api/products/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('retourne un produit via son ID', async () => {
        //Arrange
        mockPrisma.product.findUnique.mockResolvedValue(
            { id: 3, name: 'Unique Mock Product', price: 1487, stock: 10, category: 'Autre', createdAt: new Date() }
        )
        //Act
        const response = await request(app).get('/api/products/3');
        //Assert
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(3);
        expect(mockPrisma.product.findUnique).toHaveBeenCalledTimes(1);

    });

    it('produit inexistant http code 404', async () => {
        //Arrange
        mockPrisma.product.findUnique.mockResolvedValue(null);
        //Act
        const response = await request(app).get('/api/products/45');
        //Assert
        expect(response.status).toBe(404);
        expect(response.error).toBeDefined();
        expect(mockPrisma.product.findUnique).toHaveBeenCalled();
    });

    it('Prisma retourne http code 500', async () => {
        //Arrange 
        mockPrisma.product.findUnique.mockRejectedValue(new Error('Prisma HS'));
        //Act
        const response = await request(app).get('/api/products/423');
        //Assert 
        expect(response.status).toBe(500);
        expect((response.error)).toBeDefined();
        expect(mockPrisma.product.findUnique).toHaveBeenCalledTimes(1);
    });
});

describe('Post /api/products', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('absence de token http code 401', async () => {
        //Arrange
        mockPrisma.product.create.mockResolvedValue({ id: 6, name: 'name', price: 300, stock: 145, category: 'autre', createdAt: new Date() });
        //Act
        const response = await request(app).post('/api/products/').send({ name: 'name', price: 300, stock: 145, category: 'autre' });
        //Assert
        expect(response.status).toBe(401);
        expect(response.error).toBeDefined();
        expect(response.text).toContain('Header Authorization manquant');
        expect(mockPrisma.product.create).not.toHaveBeenCalled();
    });

    it('token valide et données valides http code 201', async () => {
        mockPrisma.product.create.mockResolvedValue({ id: 6, name: 'name', price: 300, stock: 145, category: 'autre', createdAt: new Date() });

        const response = await request(app).post('/api/products/')
            .auth(getToken(), { type: "bearer" })
            .send({ name: 'name', price: 300, stock: 145, category: 'autre' })

        expect(response.status).toBe(201);
        expect(response.body).toBeDefined();
        expect(mockPrisma.product.create).toHaveBeenCalledTimes(1);
    });

    it('token valide et données invalides http code 400', async () => {
        mockPrisma.product.create.mockRejectedValue(new Error('Données Invalides'));

        const response = await request(app).post('/api/products/')
            .auth(getToken(), { type: "bearer" })
            .send({ name: 'name', price: -236, stock: 50, category: 'autre' });

        expect(response.status).toBe(400);
        expect(response.error).toBeDefined();
        expect(mockPrisma.product.create).not.toHaveBeenCalled();
    });

    it('token valide et erreur interne http code 500', async () => {
        mockPrisma.product.create.mockRejectedValue(new Error('connection refused'));

        const response = await request(app).post('/api/products/')
            .auth(getToken(), { type: "bearer" })
            .send({ name: 'name', price: 236, stock: 50, category: 'autre' });

        expect(response.status).toBe(500);
        expect(response.error).toBeDefined();
        expect(response.text).toContain('Erreur Prisma');
        expect(mockPrisma.product.create).toHaveBeenCalledTimes(1);
    });
});


describe('Patch /api/products/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('valid token invalid product name http code 400 ', async () => {
        mockPrisma.product.update.mockRejectedValue(new Error('ne doit pas arriver dans ce test'));

        const response = await request(app).patch('/api/products/id')
            .auth(getToken(true, true), { type: "bearer" })
            .send({ name: '      ', price: 236, stock: 50, category: 'autre' });

        expect(response.status).toBe(400);
        expect(response.text).toContain('Nom invalide');
        expect(mockPrisma.product.update).not.toHaveBeenCalled();
    });

    it('valid token invalid product price http code 400', async () => {
        mockPrisma.product.update.mockRejectedValue(new Error('ne doit pas arriver dans ce test'));

        const response = await request(app).patch('/api/products/id')
            .auth(getToken(true, true), { type: "bearer" })
            .send({ name: 'name', price: 0, stock: 50, category: 'autre' });

        expect(response.status).toBe(400);
        expect(response.text).toContain('Prix invalide');
        expect(mockPrisma.product.update).not.toHaveBeenCalled();
    });

    it('valid token invalid product stock http code 400', async () => {
        mockPrisma.product.update.mockRejectedValue(new Error('ne doit pas arriver dans ce test'));

        const response = await request(app).patch('/api/products/id')
            .auth(getToken(true, true), { type: "bearer" })
            .send({ name: 'name', price: 236, stock: -56, category: 'autre' });

        expect(response.status).toBe(400);
        expect(response.text).toContain('Stock invalide');
        expect(mockPrisma.product.update).not.toHaveBeenCalled();
    });

    it('données mises à jour http code 200', async () => {
        mockPrisma.product.update.mockResolvedValue({ id: 12, name: 'name', price: 236, stock: 56, category: 'autre', createdAt: new Date() })

        const response = await request(app).patch('/api/products/12')
            .auth(getToken(true, true), { type: "bearer" })
            .send({ stock: 45 });

        expect(response.status).toBe(200);
        expect(mockPrisma.product.update).toHaveBeenCalledTimes(1);
    });
});

describe('Delete /api/products/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('absence de token http code 401', async () => {
        mockPrisma.product.delete.mockResolvedValue({ id: 12, name: 'name', price: 236, stock: 56, category: 'autre', createdAt: new Date() })

        const response = await request(app).delete('/api/products/12');

        expect(response.status).toBe(401);
        expect(mockPrisma.product.delete).not.toHaveBeenCalled();
    });

    it('token valide http code 200', async () => {
        mockPrisma.product.delete.mockResolvedValue({ id: 12, name: 'name', price: 236, stock: 56, category: 'autre', createdAt: new Date() })

        const response = await request(app).delete('/api/products/12')
            .auth(getToken(true, true), { type: 'bearer' });

        expect(response.status).toBe(200);
        expect(mockPrisma.product.delete).toHaveBeenCalledTimes(1);
    });
});