import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, brandingAdminProcedure, canManageSiteBranding, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { clearSiteAppearance, clearSiteLogoKey, createEmbroideryOrder, getEmbroideryOrders, getSiteAppearance, getSiteLogoKey, setSiteAppearance, setSiteLogoKey } from "./db";
import { storagePut } from "./storage";
import { SITE_PALETTE_IDS, SITE_THEME_MODES } from "../shared/brand-palettes";

const logoUploadSchema = z.object({
  dataUrl: z.string().max(1_400_000).regex(/^data:image\/(webp|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/, "Envie uma imagem WEBP ou JPG válida."),
});

const setPaletteSchema = z.object({ paletteId: z.enum(SITE_PALETTE_IDS), themeMode: z.enum(SITE_THEME_MODES) });

const newOrderSchema = z.object({
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
  }, "Informe uma data válida."),
  name: z.string().trim().min(2, "Informe o nome do pedido.").max(180),
  origin: z.enum(["DTEX", "CLIENTE"]),
  quantity: z.number().int().positive().max(100000),
  amount: z.number().positive().max(100000000).refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001, "Use até duas casas decimais."),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  orders: router({
    list: publicProcedure.query(() => getEmbroideryOrders()),
    create: publicProcedure.input(newOrderSchema).mutation(async ({ input }) => {
      await createEmbroideryOrder({
        orderDate: input.orderDate,
        name: input.name,
        origin: input.origin,
        quantity: input.quantity,
        amountCents: Math.round(input.amount * 100),
      });
      return { success: true } as const;
    }),
  }),
  branding: router({
    canManage: publicProcedure.query(({ ctx }) => canManageSiteBranding(ctx.user)),
    palette: publicProcedure.query(() => getSiteAppearance()),
    setPalette: brandingAdminProcedure.input(setPaletteSchema).mutation(async ({ input }) => {
      await setSiteAppearance(input.paletteId, input.themeMode);
      return input;
    }),
    resetPalette: brandingAdminProcedure.mutation(async () => {
      await clearSiteAppearance();
      return { paletteId: null, themeMode: "light" as const };
    }),
    logo: publicProcedure.query(async () => {
      const logoKey = await getSiteLogoKey();
      return logoKey ? `/manus-storage/${logoKey}` : null;
    }),
    setLogo: brandingAdminProcedure.input(logoUploadSchema).mutation(async ({ input }) => {
      const [, contentType, encoded] = input.dataUrl.match(/^data:(image\/(?:webp|jpeg));base64,([A-Za-z0-9+/]+={0,2})$/)!;
      const imageBytes = Buffer.from(encoded, "base64");
      if (!imageBytes.length || imageBytes.length > 950 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "A imagem comprimida excede o limite permitido. Escolha outra foto." });
      }
      const isWebp = contentType === "image/webp" && imageBytes.subarray(0, 4).toString("ascii") === "RIFF" && imageBytes.subarray(8, 12).toString("ascii") === "WEBP";
      const isJpeg = contentType === "image/jpeg" && imageBytes[0] === 0xff && imageBytes[1] === 0xd8 && imageBytes[2] === 0xff;
      if (!isWebp && !isJpeg) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "O conteúdo do arquivo não corresponde a uma imagem WEBP ou JPG válida." });
      }
      const extension = contentType === "image/webp" ? "webp" : "jpg";
      const { key } = await storagePut(`branding/site-logo.${extension}`, imageBytes, contentType);
      await setSiteLogoKey(key);
      return `/manus-storage/${key}`;
    }),
    resetLogo: brandingAdminProcedure.mutation(async () => {
      await clearSiteLogoKey();
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
