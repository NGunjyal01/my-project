import dbConnect from "@/lib/dbConnect";
import { setCorsHeaders } from "@/lib/cors";

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (req.method === "OPTIONS") return res.status(200).end();
    await dbConnect();
    res.status(200).json({ status: "ok" });
}
