import { NextFunction, Request, Response } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err: Error, req: Request, res: Response, Next: NextFunction) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur interne' });

};
export default errorHandler;