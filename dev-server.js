// Local preview without Vercel: GEMINI_API_KEY=... node dev-server.js → http://localhost:3000
import http from "node:http";
import { readFile } from "node:fs/promises";
import handler from "./api/chat.js";

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

http
  .createServer(async (req, res) => {
    if (req.url.startsWith("/api/chat")) {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      req.body = raw;
      res.status = (code) => ((res.statusCode = code), res);
      res.json = (obj) => (res.setHeader("Content-Type", "application/json"), res.end(JSON.stringify(obj)));
      return handler(req, res);
    }
    const file = req.url === "/" ? "index.html" : req.url.slice(1).split("?")[0];
    try {
      const ext = file.slice(file.lastIndexOf("."));
      if (!TYPES[ext]) throw new Error("not served");
      res.setHeader("Content-Type", TYPES[ext]);
      res.end(await readFile(file));
    } catch {
      res.statusCode = 404;
      res.end("Not found");
    }
  })
  .listen(3000, () => console.log("Demo läuft auf http://localhost:3000"));
