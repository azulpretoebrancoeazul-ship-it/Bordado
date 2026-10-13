import { embroideryOrders } from "../drizzle/schema";
import { getDb } from "../server/db";

const initialOrders = [
  { orderDate: "2026-10-09", name: "RN PNEUS E RODAS", origin: "DTEX" as const, quantity: 8, amountCents: 36000 },
  { orderDate: "2026-10-09", name: "APIÁRIOS DINIZ", origin: "CLIENTE" as const, quantity: 10, amountCents: 9800 },
  { orderDate: "2026-10-09", name: "POLÍCIA CIVIL", origin: "CLIENTE" as const, quantity: 2, amountCents: 3500 },
  { orderDate: "2026-10-09", name: "ARTESANATO CASA DAS REDES", origin: "CLIENTE" as const, quantity: 4, amountCents: 5200 },
  { orderDate: "2026-10-09", name: "SERIEMA", origin: "CLIENTE" as const, quantity: 7, amountCents: 9800 },
];

const db = await getDb();
if (!db) throw new Error("O banco de dados não está disponível.");

try {
  const existing = await db.select({ id: embroideryOrders.id }).from(embroideryOrders).limit(1);
  if (existing.length) {
    console.log("Carga inicial ignorada: a tabela já contém pedidos.");
  } else {
    await db.insert(embroideryOrders).values(initialOrders);
    console.log("Cinco pedidos atuais da planilha foram importados na tabela do site.");
  }
} finally {
  await db.$client.end();
}
