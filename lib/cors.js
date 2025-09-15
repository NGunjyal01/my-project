export function cors(res) {
    res.headers.set("Access-Control-Allow-Origin", "*"); // allow all domains
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res;
}
