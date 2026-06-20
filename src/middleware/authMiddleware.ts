//(îîî permet d'indiquer au TS de charger ce fichier avant la transpilation îîî)
// Nécessaire pour forcer ts-node à charger les types globaux Express
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../types/express.d.ts" />
//(îîî permet d'indiquer au TS de charger ce fichier avant la transpilation îîî)
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // récupérer le token dans le cookie
    const token = req.cookies.token;
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