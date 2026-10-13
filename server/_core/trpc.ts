import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import type { User } from "../../drizzle/schema";
import { ENV } from "./env";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

export function canManageSiteBranding(user: User | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  const allowedEmail = ENV.brandingAdminEmail.trim().toLocaleLowerCase("en-US");
  return Boolean(allowedEmail && user.email?.trim().toLocaleLowerCase("en-US") === allowedEmail);
}

export const brandingAdminProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Entre com a conta Manus autorizada para administrar o site." });
    }
    if (!canManageSiteBranding(ctx.user)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Esta conta não está autorizada a alterar a marca do site." });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);
