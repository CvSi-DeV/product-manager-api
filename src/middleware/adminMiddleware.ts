//(îîî permet d'indiquer au TS de charger ce fichier avant la transpilation îîî)
// Nécessaire pour forcer ts-node à charger les types globaux Express
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../types/express.d.ts" />
//(îîî permet d'indiquer au TS de charger ce fichier avant la transpilation îîî)
import { Request, Response, NextFunction } from "express";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user)
        return res.status(401).json({ error: "Utilisateur non authentifié" });
    if (user.role !== "admin")
        return res.status(403).json({ error: "Utilisateur non autorisé" });
    next();
};
export default adminMiddleware;