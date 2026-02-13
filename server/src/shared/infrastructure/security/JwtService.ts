import jwt from 'jsonwebtoken';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

export class JwtService {
    private readonly secret: string;
    private readonly expiresIn: string;
    private readonly refreshExpiresIn: string;

    constructor() {
        this.secret = process.env.JWT_SECRET || 'your-secret-key';
        this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
        this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    }

    public generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.secret, {
            expiresIn: this.expiresIn,
        });
    }

    public generateRefreshToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.secret, {
            expiresIn: this.refreshExpiresIn,
        });
    }

    public verify(token: string): JwtPayload {
        try {
            return jwt.verify(token, this.secret) as JwtPayload;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            throw error;
        }
    }

    public decode(token: string): JwtPayload | null {
        const decoded = jwt.decode(token);
        return decoded as JwtPayload | null;
    }
}
