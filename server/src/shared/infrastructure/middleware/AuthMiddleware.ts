import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../security/JwtService';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

export class AuthMiddleware {
    private jwtService: JwtService;

    constructor() {
        this.jwtService = new JwtService();
    }

    public authenticate = (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): void => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ error: 'No token provided' });
                return;
            }

            const token = authHeader.substring(7);
            const payload = this.jwtService.verify(token);

            req.user = {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
            };

            next();
        } catch (error) {
            if (error instanceof Error && error.message === 'Token expired') {
                res.status(401).json({ error: 'Token expired' });
                return;
            }
            res.status(401).json({ error: 'Invalid token' });
        }
    };

    public optionalAuth = (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): void => {
        try {
            const authHeader = req.headers.authorization;

            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const payload = this.jwtService.verify(token);

                req.user = {
                    userId: payload.userId,
                    email: payload.email,
                    role: payload.role,
                };
            }

            next();
        } catch (error) {
            next();
        }
    };
}
