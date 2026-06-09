//(îîî permet d'indiquer au TS de charger ce fichier avant la transpilation îîî)
// eslint-disable-next-line
/// <reference path="../types/express.d.ts" />
//(îîî permet d'indiquer au TS de charger ce fichier avant la transpilation îîî)
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // récupérer le header
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: "Header Authorization manquant" });

    //récupérer le token
    const tokenParts = authHeader.split(' ');
    if (tokenParts[0] !== 'Bearer' || !tokenParts[1])
        return res.status(401).json({ error: "Format: Bearer <token>" });
    const token = tokenParts[1];
    if (!token)
        return res.status(401).json({ error: "Token manquant" });

    //vérifier la validité du token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        req.user = decoded as { id: number; email: string; role: string };
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.error(`${error.message} - expiré à : ${error.expiredAt}`);
            return res.status(401).json({ error: "Session expirée" });
        }
        return res.status(401).json({ error: "Erreur token" });
    }
}
export default authMiddleware;