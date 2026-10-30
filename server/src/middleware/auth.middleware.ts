import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config/env.js";
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

        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);

        // Validate token payload and role
        if (
            typeof decoded !== "object" ||
            decoded === null ||
            typeof decoded.userId !== "string" ||
            decoded.userId.trim().length === 0 ||
            (decoded.role !== "customer" && decoded.role !== "admin")
        ) {
            return res.status(401).json({
                message: "Invalid token payload",
            });
        }

        // Attach validated authenticated user
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};