import { Request, Response } from 'express';

function catchAll404(req: Request, res: Response) {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} introuvable` });
}

export default catchAll404; 