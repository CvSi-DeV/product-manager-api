import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import bcrypt from 'bcrypt';
import request from 'supertest';
import app from "../../app";
import prisma from "../../lib/prisma";

//Configuration du Mock 
jest.mock('../../lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn()
        }
    }
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

//tests intégration routes authentification
describe('Post /api/auth/register', () => {
    const createMockedUser = () => {
        mockPrisma.user.create.mockResolvedValue({
            id: 1,
            email: 'test@test.com',
            password: 'hashedpwd',
            role: 'admin',
            createdAt: new Date()
        });
    }
    const mockedPostReq = (body = { email: 'test@test.com', password: 'password123' }) => {
        //request : simule une requete vers le router 'app'.
        //.send(les données à transmettre dans la requete)
        return request(app).post('/api/auth/register').send(body);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create an account -> http code 201', async () => {
        //Arrange
        //simule : aucun utilisateur avec cet adresse email présent en base
        mockPrisma.user.findUnique.mockResolvedValue(null);
        //simule : la création en base de l'utilisateur
        createMockedUser();
        //Act
        const response = await mockedPostReq();
        //Assert 
        expect(response.status).toBe(201);
        expect(response.body.message).toBeDefined();
        expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
        expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('account already exists -> http code 400', async () => {
        //Arrange 
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 1,
            email: 'test@test.com',
            password: 'hashedpwd',
            role: 'admin',
            createdAt: new Date()
        });
        //Act 
        const response = await mockedPostReq();
        //Assert 
        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
        expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
        expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should return 500 http code', async () => {
        //Arrange 
        mockPrisma.user.findUnique.mockRejectedValue(new Error('Connection failed'));
        //Act
        const response = await mockedPostReq();
        //Assert 
        expect(response.status).toBe(500);
        expect(response.body.error).toBeDefined();
        expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
        expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
})

describe('Post /api/auth/login', () => {

    //informations utilisateur pour la connexion
    const conInfo = {
        email: 'test@test.com',
        password: 'passWord123'
    };

    const userInfo = async () => {
        const hashedPwd = await bcrypt.hash('passWord123', 10);
        return {
            id: 1,
            email: 'test@test.com',
            password: hashedPwd,
            role: 'admin',
            createdAt: new Date()
        };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('email introuvable http code 401', async () => {
        //Arrange
        mockPrisma.user.findUnique.mockResolvedValue(null);
        //Act 
        const response = await request(app).post('/api/auth/login').send(conInfo);
        //Assert
        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
        expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    })

    it('mot de passe incorrect http code 401', async () => {
        //Arrange
        mockPrisma.user.findUnique.mockResolvedValue(await userInfo());
        //Act
        const response = await request(app).post('/api/auth/login').send({ ...conInfo, password: 'totoLeRigolo' });
        //Assert
        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
        expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('credentials OK http code 200', async () => {
        //Arrange
        mockPrisma.user.findUnique.mockResolvedValue(await userInfo());
        //Act
        const response = await request(app).post('/api/auth/login').send(conInfo);
        //Assert
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.user).toBeDefined();
        expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it(`le message d'erreur de connexion est générique (user // mdp)`, async () => {
        //Arrange && Act
        //email KO
        mockPrisma.user.findUnique.mockResolvedValue(null);
        const resp1 = await request(app).post('/api/auth/login').send(conInfo);

        //mdp KO
        mockPrisma.user.findUnique.mockResolvedValue(await userInfo());
        const resp2 = await request(app).post('/api/auth/login').send({ ...conInfo, password: 'totoLeRigolo' });
        //Assert 
        expect(resp1.body.error).toBe(resp2.body.error);
        expect(resp1.status).toBe(resp2.status);
    });
})