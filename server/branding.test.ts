import { afterEach, describe, expect, it, vi } from "vitest";
import type { User } from "../drizzle/schema";
import { canManageSiteBranding } from "./_core/trpc";
import { DEFAULT_SITE_PALETTE_ID, getPaletteVariables, SITE_PALETTE_IDS, SITE_PALETTES, SITE_THEME_MODES } from "../shared/brand-palettes";

afterEach(() => vi.unstubAllEnvs());

const user = (overrides: Partial<User> = {}): User => {
  const now = new Date("2026-10-10T00:00:00Z");
  return {
    id: 1,
    openId: "user-test",
    name: "Usuário de teste",
    email: "dono@example.com",
    loginMethod: "manus",
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    ...overrides,
  };
};

describe("permissão para administrar a marca do site", () => {
  it("nega acesso a visitantes não autenticados", () => {
    vi.stubEnv("BRANDING_ADMIN_EMAIL", "dono@example.com");
    expect(canManageSiteBranding(null)).toBe(false);
  });

  it("permite a conta autenticada configurada sem diferenciar maiúsculas", () => {
    vi.stubEnv("BRANDING_ADMIN_EMAIL", "  DONO@Example.com  ");
    expect(canManageSiteBranding(user({ email: "dono@example.com" }))).toBe(true);
  });

  it("nega outra conta autenticada", () => {
    vi.stubEnv("BRANDING_ADMIN_EMAIL", "dono@example.com");
    expect(canManageSiteBranding(user({ email: "visitante@example.com" }))).toBe(false);
  });

  it("preserva o papel administrativo já existente", () => {
    vi.stubEnv("BRANDING_ADMIN_EMAIL", "");
    expect(canManageSiteBranding(user({ role: "admin", email: null }))).toBe(true);
  });
});

describe("catálogo de paletas do site", () => {
  it("contém dez paletas únicas, dois modos e mantém Ateliê como padrão", () => {
    expect(SITE_PALETTE_IDS).toHaveLength(10);
    expect(SITE_THEME_MODES).toEqual(["light", "dark"]);
    expect(new Set(SITE_PALETTE_IDS).size).toBe(SITE_PALETTE_IDS.length);
    expect(DEFAULT_SITE_PALETTE_ID).toBe("atelier");
    expect(SITE_PALETTES.map((palette) => palette.id)).toEqual([...SITE_PALETTE_IDS]);
  });

  it("fornece cores e amostras de degradê para cada opção", () => {
    for (const palette of SITE_PALETTES) {
      expect(palette.swatches).toHaveLength(4);
      expect(palette.variables["--brand"]).toMatch(/^#[\da-f]{6}$/i);
      expect(palette.variables["--canvas"]).toMatch(/^#[\da-f]{6}$/i);
    }
  });

  it("mantém as cores de destaque no tema escuro sem superfícies claras", () => {
    const palette = SITE_PALETTES.find((item) => item.id === DEFAULT_SITE_PALETTE_ID)!;
    const darkTokens = getPaletteVariables(palette, "dark");
    expect(darkTokens["--brand"]).toBe(palette.variables["--brand"]);
    expect(darkTokens["--canvas"]).toBe("#151A1D");
    expect(darkTokens["--paper"]).toBe("#202629");
  });
});
