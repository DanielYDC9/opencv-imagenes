import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  let body = req.body;
  if (typeof body === "string") body = JSON.parse(body);

  if (!body?.type || !body?.sessionId || !body?.ts) {
    return res.status(400).send("Bad Request");
  }

  await kv.lpush("telemetry:events", JSON.stringify(body));

  if (body.type === "faces") {
    await kv.incrby("telemetry:facesEvents", 1);
    await kv.incrby("telemetry:facesTotal", Number(body.facesCount || 0));
  }

  if (body.type === "widget") {
    await kv.incrby("telemetry:widgetEvents", 1);
    await kv.incrby(`telemetry:widget:${body.widget}:clicks`, 1);
  }

  res.status(200).send("OK");
}
