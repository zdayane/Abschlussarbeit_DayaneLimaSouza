import { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../services/AuthentificationService";

declare global {
    namespace Express {
        export interface Request {
            userId?: string;
        }
    }
}

// function to require authentication for protected routes
export async function requiresAuthentication(req: Request, res: Response, next: NextFunction) {
    try {
        // Extract JWT token from cookies
        const jwt = req.cookies.access_token;
        if (jwt) {
            // Verify JWT token and extract user ID
            const id = verifyJWT(jwt);
            req.userId = id;
        } else {
            res.status(401);
            next();
        }
        next();
    } catch (err) {
        res.status(404);
        next(err);
    }
}

//  function to optionally authenticate users
export async function optionalAuthentication(req: Request, res: Response, next: NextFunction) {
    // Extract JWT token from cookies
    const jwt = req.cookies.access_token;
    if (jwt) {
        // If JWT token is present, verify it and extract user ID
        const id = verifyJWT(jwt);
        req.userId = id;
    }
    next()
}