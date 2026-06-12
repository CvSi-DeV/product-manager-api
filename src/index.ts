import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import productRouter, { PRODUCT_URL } from './routes/product';
import authRouter, { AUTH_URL } from './routes/auth';

//Gestion des variables d'environnement
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'ALLOWED_ORIGINS', 'SERVER_PORT'];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName])
        throw new Error(`Variable d'environnement manquante : ${varName}`);
});

//Récupération des allowedOrigins pour CORS -- Pas de valeurs par défaut si non setté
const allowedOrigins = process.env['ALLOWED_ORIGINS']?.split(',');

const app = express();
const port = process.env['SERVER_PORT'];
if (!port)
    throw new Error('Variable SERVER_PORT invalide');
const SERVER_PORT = port;

app.use(express.json());
app.use(cors({ origin: allowedOrigins }));

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API en ligne' });
});

//API urls...
app.use(PRODUCT_URL, productRouter);
app.use(AUTH_URL, authRouter);

//démarrage du serveur
app.listen(SERVER_PORT, () => {
    console.log(`🚀 Serveur sur http://localhost:${SERVER_PORT}`);
});