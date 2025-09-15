// lib/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}

export function getUserFromReq(req) {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth) return null;
    const match = auth.match(/^Bearer (.+)$/);
    if (!match) return null;
    const token = match[1];
    return verifyToken(token);
}
