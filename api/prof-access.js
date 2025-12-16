import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  let body = req.body;
  if (typeof body === "string") body = JSON.parse(body);

  if (!body?.ts || !body?.sessionId) {
    return res.status(400).send("Bad Request");
  }

  await kv.lpush("prof:accessLog", JSON.stringify(body));
  res.status(200).send("OK");
}
