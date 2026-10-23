import express from "express";

const app = express();
app.use(express.json());
const port = process.env.PORT ?? 3001;

// Fase 3: Prisma + Postgres no Render. Por ora: endpoints de health e mock de save.
app.get("/health", (_req, res) => res.json({ ok: true, game: "PLANO-INCRIVEL-RF" }));

interface SaveRequest {
  playerId: string;
  active: "lilly" | "kielop";
  x: number;
  y: number;
}
const saves = new Map<string, SaveRequest>();

app.post("/save", (req, res) => {
  const body = req.body as SaveRequest;
  if (!body?.playerId) return res.status(400).json({ error: "playerId obrigatório" });
  saves.set(body.playerId, body);
  res.json({ saved: true });
});

app.get("/save/:playerId", (req, res) => {
  const save = saves.get(req.params.playerId);
  if (!save) return res.status(404).json({ error: "save não encontrado" });
  res.json(save);
});

app.listen(port, () => console.log(`server na porta ${port}`));
