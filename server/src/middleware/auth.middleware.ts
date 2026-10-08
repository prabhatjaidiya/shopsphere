import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        // Missing Authorization header
        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        // Check Bearer format
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid authorization format",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Authentication token missing",
            });
        }

        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);

        if (
            typeof decoded !== "object" ||
            !decoded ||
            !("userId" in decoded) ||
            !("role" in decoded)
        ) {
            return res.status(401).json({
                message: "Invalid token payload",
            });
        }

        // Attach authenticated user
        req.user = {
            userId: String(decoded.userId),
            role: String(decoded.role),
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};