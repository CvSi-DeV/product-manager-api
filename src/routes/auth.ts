import bcrypt from "bcrypt";
import { Router } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "../lib/prisma";
import authMiddleware from "../middleware/authMiddleware";

export const AUTH_URL = "/api/auth"
const authRouter = Router();

authRouter.post("/register", async (req, res) => {
    try {
        //1. Vérifier que l'email n'existe pas déjà
        const registrationInfo = req.body;
        const isAlreadyCreated = await prisma.user.findUnique({
            where: { email: registrationInfo.email }
        })
        if (isAlreadyCreated) return res.status(400).json({ error: `Compte '${registrationInfo.email}' existe déjà` })

        //2. Hasher le mot de passe avec bcrypt
        const hashedPwd = await bcrypt.hash(registrationInfo.password, 10);

        //3. Créer l'utilisateur en DB
        await prisma.user.create({
            data: {
                email: registrationInfo.email,
                password: hashedPwd
            }
        })

        //4. Retourner { message: "Compte créé" } (201)
        return res.status(201).json({ message: "Compte crée" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur Register" });
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        const loginInfo = req.body
        //1. Trouver l'utilisateur par email
        const userInfo = await prisma.user.findUnique({
            where: {
                email: loginInfo.email
            }
        });

        //2. Vérifier l'authentification
        if (!userInfo || !(await bcrypt.compare(loginInfo.password, userInfo.password)))
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });

        //3. Générer un JWT avec { id, email, role }
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET manquant dans .env");

        type JwtExpiry = SignOptions['expiresIn'];
        const expireIn = process.env.JWT_EXPIRES_IN as JwtExpiry

        const token = jwt.sign(
            { id: userInfo.id, email: userInfo.email, role: userInfo.role },
            secret,
            { expiresIn: expireIn }
        );

        //4. Retourner { token, user: { id, email, role } }
        return res.status(200)
            .cookie(
                'token',
                token,
                {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    secure: !process.env.LOCAL_ENV,
                    sameSite: 'none'
                })
            .json(
                {
                    user: { id: userInfo.id, email: userInfo.email, role: userInfo.role }
                });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur Register" });
    }
});

//Route d'identification de l'utilisateur connecté
authRouter.get('/me', authMiddleware, (req, res) => {
    return res.status(200).json({ user: req.user });
});
//Déconnection - suppression du cookie
authRouter.post('/logout', (req, res) => {
    res.status(200).clearCookie('token').json({ message: 'deconnecté' })
});

export default authRouter;