import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import catchAll404 from './middleware/catchAll404';
import errorHandler from './middleware/errorHandler';
import authRouter, { AUTH_URL } from './routes/auth';
import productRouter, { PRODUCT_URL } from './routes/product';

//Gestion des variables d'environnement
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'ALLOWED_ORIGINS', 'SERVER_PORT'];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName])
        throw new Error(`Variable d'environnement manquante : ${varName}`);
});

//Récupération des allowedOrigins pour CORS -- Pas de valeurs par défaut si non setté
const allowedOrigins = process.env['ALLOWED_ORIGINS']?.split(',');

//Le port est défini dans le fichier .env
const port = process.env['SERVER_PORT'];
if (!port)
    throw new Error('Variable SERVER_PORT invalide');
export const SERVER_PORT = port;

//Création du serveur EXPRESS
const app = express();

//Middleware JSON
app.use(express.json());
//Autorisation CORS
app.use(cors({ origin: allowedOrigins }));

//health ENDPOINT
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API en ligne' });
});

//Routers API urls...
app.use(PRODUCT_URL, productRouter);
app.use(AUTH_URL, authRouter);

//CatchAll404 => erreur de routes
app.use(catchAll404);
app.use(errorHandler);

export default app;