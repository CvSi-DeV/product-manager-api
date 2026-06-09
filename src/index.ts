import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import productRouter, { PRODUCT_URL } from './routes/product';
import authRouter, { AUTH_URL } from './routes/auth';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API en ligne' });
});

app.use(PRODUCT_URL, productRouter);
app.use(AUTH_URL, authRouter);

//démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur sur http://localhost:${PORT}`);
});