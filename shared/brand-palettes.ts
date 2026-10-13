export const SITE_PALETTE_IDS = ["atelier", "botanica", "oceano", "lavanda", "roma", "mostarda", "esmeralda", "ceu", "cacau", "framboesa"] as const;
export const SITE_THEME_MODES = ["light", "dark"] as const;

export type SitePaletteId = (typeof SITE_PALETTE_IDS)[number];
export type SiteThemeMode = (typeof SITE_THEME_MODES)[number];

export type SitePalette = {
  id: SitePaletteId;
  name: string;
  description: string;
  swatches: string[];
  variables: Record<string, string>;
};

export const DEFAULT_SITE_PALETTE_ID: SitePaletteId = "atelier";

export const SITE_PALETTES: SitePalette[] = [
  {
    id: "atelier",
    name: "Ateliê",
    description: "Terracota, papel e tons artesanais.",
    swatches: ["#C66B3D", "#A9532C", "#FBEDE4", "#F7F5F0"],
    variables: {
      "--paper": "#FFFEFA", "--canvas": "#F7F5F0", "--ink": "#292720", "--muted": "#858176",
      "--border": "#E9E5DC", "--brand": "#C66B3D", "--brand-dark": "#A9532C", "--brand-light": "#FBEDE4",
      "--palette-sidebar": "#FBFAF6", "--palette-sidebar-border": "#EAE6DD", "--palette-hover": "#F2EEE6",
      "--palette-active": "#F7E9DF", "--palette-active-ink": "#A6532D", "--palette-tint": "#F4F0E8",
      "--palette-focus": "#D89169", "--palette-bar-track": "#F4F1EA", "--palette-bar-fill": "#D8B19B",
      "--palette-soft": "#F8EBE2", "--palette-soft-ink": "#BD6841", "--palette-panel-icon": "#F8EEE7",
      "--palette-panel-icon-ink": "#AE6949", "--palette-source-bg": "#FAEEE7", "--palette-source-ink": "#A6532D",
    },
  },
  {
    id: "botanica",
    name: "Botânica",
    description: "Oliva, musgo e papel natural.",
    swatches: ["#637B47", "#4A6137", "#ECF2E6", "#F5F6EF"],
    variables: {
      "--paper": "#FFFEFA", "--canvas": "#F5F6EF", "--ink": "#293024", "--muted": "#7C8373",
      "--border": "#E3E8D8", "--brand": "#637B47", "--brand-dark": "#4A6137", "--brand-light": "#ECF2E6",
      "--palette-sidebar": "#F7F8F1", "--palette-sidebar-border": "#E2E7D8", "--palette-hover": "#EEF1E6",
      "--palette-active": "#E8EEDF", "--palette-active-ink": "#4D6536", "--palette-tint": "#EEF1E6",
      "--palette-focus": "#A7B68A", "--palette-bar-track": "#EDEFE6", "--palette-bar-fill": "#B8C5A1",
      "--palette-soft": "#ECF2E6", "--palette-soft-ink": "#58713F", "--palette-panel-icon": "#EEF2E8",
      "--palette-panel-icon-ink": "#617A48", "--palette-source-bg": "#EDF2E8", "--palette-source-ink": "#58713F",
    },
  },
  {
    id: "oceano",
    name: "Oceano",
    description: "Azul profundo com brisa de água.",
    swatches: ["#3E7D91", "#2F6070", "#E5F0F4", "#F1F6F7"],
    variables: {
      "--paper": "#FFFEFE", "--canvas": "#F1F6F7", "--ink": "#253035", "--muted": "#74848A",
      "--border": "#DCE8EB", "--brand": "#3E7D91", "--brand-dark": "#2F6070", "--brand-light": "#E5F0F4",
      "--palette-sidebar": "#F5F9FA", "--palette-sidebar-border": "#DCE8EB", "--palette-hover": "#EAF2F5",
      "--palette-active": "#E2EEF2", "--palette-active-ink": "#326575", "--palette-tint": "#EAF2F5",
      "--palette-focus": "#84B3C1", "--palette-bar-track": "#E9F0F2", "--palette-bar-fill": "#A9C9D2",
      "--palette-soft": "#E5F0F4", "--palette-soft-ink": "#326575", "--palette-panel-icon": "#EAF2F5",
      "--palette-panel-icon-ink": "#3E7D91", "--palette-source-bg": "#E8F1F4", "--palette-source-ink": "#326575",
    },
  },
  {
    id: "lavanda",
    name: "Lavanda",
    description: "Malva suave e tons de flor.",
    swatches: ["#80628F", "#684E76", "#F1EAF5", "#F7F4F8"],
    variables: {
      "--paper": "#FFFDFF", "--canvas": "#F7F4F8", "--ink": "#302A33", "--muted": "#877E8A",
      "--border": "#E8DDEA", "--brand": "#80628F", "--brand-dark": "#684E76", "--brand-light": "#F1EAF5",
      "--palette-sidebar": "#FAF7FB", "--palette-sidebar-border": "#E8DDEA", "--palette-hover": "#F2ECF3",
      "--palette-active": "#F0E7F3", "--palette-active-ink": "#6A4C74", "--palette-tint": "#F2ECF3",
      "--palette-focus": "#B699C4", "--palette-bar-track": "#F0EBF1", "--palette-bar-fill": "#C9B6D1",
      "--palette-soft": "#F1EAF5", "--palette-soft-ink": "#684E76", "--palette-panel-icon": "#F2ECF3",
      "--palette-panel-icon-ink": "#80628F", "--palette-source-bg": "#F2ECF3", "--palette-source-ink": "#684E76",
    },
  },
  {
    id: "roma",
    name: "Romã",
    description: "Frutas vermelhas e rosa queimado.",
    swatches: ["#AD5864", "#8A3F4B", "#F8E9EB", "#F9F4F4"],
    variables: {
      "--paper": "#FFFEFE", "--canvas": "#F9F4F4", "--ink": "#34282A", "--muted": "#8A7C7D",
      "--border": "#EEDFE1", "--brand": "#AD5864", "--brand-dark": "#8A3F4B", "--brand-light": "#F8E9EB",
      "--palette-sidebar": "#FBF6F7", "--palette-sidebar-border": "#EEDFE1", "--palette-hover": "#F5ECEE",
      "--palette-active": "#F6E8EA", "--palette-active-ink": "#954855", "--palette-tint": "#F5ECEE",
      "--palette-focus": "#D2949D", "--palette-bar-track": "#F3EBEC", "--palette-bar-fill": "#D5A6AC",
      "--palette-soft": "#F8E9EB", "--palette-soft-ink": "#8A3F4B", "--palette-panel-icon": "#F5ECEE",
      "--palette-panel-icon-ink": "#AD5864", "--palette-source-bg": "#F8E9EB", "--palette-source-ink": "#8A3F4B",
    },
  },
  {
    id: "mostarda", name: "Mostarda", description: "Mel, especiarias e linho.",
    swatches: ["#A66B18", "#7E4E0F", "#F7EEDC", "#F8F5ED"],
    variables: {
      "--paper": "#FFFEFA", "--canvas": "#F8F5ED", "--ink": "#302B22", "--muted": "#898171", "--border": "#EBE3D4",
      "--brand": "#A66B18", "--brand-dark": "#7E4E0F", "--brand-light": "#F7EEDC", "--palette-sidebar": "#FBF8F1",
      "--palette-sidebar-border": "#EBE3D4", "--palette-hover": "#F3EDDF", "--palette-active": "#F2E8D5", "--palette-active-ink": "#7E4E0F",
      "--palette-tint": "#F3EDDF", "--palette-focus": "#C9A66B", "--palette-bar-track": "#F1ECE0", "--palette-bar-fill": "#DAC397",
      "--palette-soft": "#F7EEDC", "--palette-soft-ink": "#8F5B13", "--palette-panel-icon": "#F3EDDF", "--palette-panel-icon-ink": "#A66B18",
      "--palette-source-bg": "#F7EEDC", "--palette-source-ink": "#7E4E0F",
    },
  },
  {
    id: "esmeralda", name: "Esmeralda", description: "Verde mineral e porcelana.",
    swatches: ["#2F7A63", "#24604E", "#E6F2EC", "#F2F7F4"],
    variables: {
      "--paper": "#FFFEFA", "--canvas": "#F2F7F4", "--ink": "#26322E", "--muted": "#78877F", "--border": "#DCE9E2",
      "--brand": "#2F7A63", "--brand-dark": "#24604E", "--brand-light": "#E6F2EC", "--palette-sidebar": "#F7FAF8",
      "--palette-sidebar-border": "#DCE9E2", "--palette-hover": "#EAF3EE", "--palette-active": "#E2F0E8", "--palette-active-ink": "#24604E",
      "--palette-tint": "#EAF3EE", "--palette-focus": "#81B4A0", "--palette-bar-track": "#EAF1ED", "--palette-bar-fill": "#A4C8B6",
      "--palette-soft": "#E6F2EC", "--palette-soft-ink": "#24604E", "--palette-panel-icon": "#EAF3EE", "--palette-panel-icon-ink": "#2F7A63",
      "--palette-source-bg": "#E6F2EC", "--palette-source-ink": "#24604E",
    },
  },
  {
    id: "ceu", name: "Céu", description: "Azul claro com detalhes índigo.",
    swatches: ["#32779B", "#275D7C", "#E6F1F8", "#F2F7FA"],
    variables: {
      "--paper": "#FFFEFE", "--canvas": "#F2F7FA", "--ink": "#263138", "--muted": "#77858D", "--border": "#DCE8EE",
      "--brand": "#32779B", "--brand-dark": "#275D7C", "--brand-light": "#E6F1F8", "--palette-sidebar": "#F7FAFC",
      "--palette-sidebar-border": "#DCE8EE", "--palette-hover": "#EAF2F6", "--palette-active": "#E2EEF5", "--palette-active-ink": "#275D7C",
      "--palette-tint": "#EAF2F6", "--palette-focus": "#82AEC4", "--palette-bar-track": "#E9F0F4", "--palette-bar-fill": "#A7C7D6",
      "--palette-soft": "#E6F1F8", "--palette-soft-ink": "#275D7C", "--palette-panel-icon": "#EAF2F6", "--palette-panel-icon-ink": "#32779B",
      "--palette-source-bg": "#E6F1F8", "--palette-source-ink": "#275D7C",
    },
  },
  {
    id: "cacau", name: "Cacau", description: "Terra, madeira e tons de café.",
    swatches: ["#805B48", "#654535", "#F2EAE5", "#F7F3F0"],
    variables: {
      "--paper": "#FFFEFA", "--canvas": "#F7F3F0", "--ink": "#302923", "--muted": "#867B72", "--border": "#E8DDD5",
      "--brand": "#805B48", "--brand-dark": "#654535", "--brand-light": "#F2EAE5", "--palette-sidebar": "#FAF7F4",
      "--palette-sidebar-border": "#E8DDD5", "--palette-hover": "#F0E9E3", "--palette-active": "#EEE4DD", "--palette-active-ink": "#654535",
      "--palette-tint": "#F0E9E3", "--palette-focus": "#B6947E", "--palette-bar-track": "#EFEAE5", "--palette-bar-fill": "#CAB2A2",
      "--palette-soft": "#F2EAE5", "--palette-soft-ink": "#654535", "--palette-panel-icon": "#F0E9E3", "--palette-panel-icon-ink": "#805B48",
      "--palette-source-bg": "#F2EAE5", "--palette-source-ink": "#654535",
    },
  },
  {
    id: "framboesa", name: "Framboesa", description: "Frutas vermelhas e rosa vivo.",
    swatches: ["#B24269", "#8A2D4E", "#F8E6EE", "#FAF3F6"],
    variables: {
      "--paper": "#FFFEFE", "--canvas": "#FAF3F6", "--ink": "#35282E", "--muted": "#8B7C83", "--border": "#EEDCE4",
      "--brand": "#B24269", "--brand-dark": "#8A2D4E", "--brand-light": "#F8E6EE", "--palette-sidebar": "#FCF7F9",
      "--palette-sidebar-border": "#EEDCE4", "--palette-hover": "#F5EAF0", "--palette-active": "#F4E3EA", "--palette-active-ink": "#8A2D4E",
      "--palette-tint": "#F5EAF0", "--palette-focus": "#D18BA5", "--palette-bar-track": "#F2E9ED", "--palette-bar-fill": "#D7A6B8",
      "--palette-soft": "#F8E6EE", "--palette-soft-ink": "#8A2D4E", "--palette-panel-icon": "#F5EAF0", "--palette-panel-icon-ink": "#B24269",
      "--palette-source-bg": "#F8E6EE", "--palette-source-ink": "#8A2D4E",
    },
  },
];

export function getPaletteVariables(palette: SitePalette, mode: SiteThemeMode): Record<string, string> {
  if (mode === "light") return palette.variables;
  const brand = palette.variables["--brand"];
  const lightAccent = `color-mix(in srgb, ${brand} 48%, #ffffff)`;
  const tintedSurface = `color-mix(in srgb, ${brand} 20%, #202629)`;
  return {
    ...palette.variables,
    "--paper": "#202629", "--canvas": "#151A1D", "--ink": "#F2F0EC", "--muted": "#B2B8B7", "--border": "#394246",
    "--palette-sidebar": "#1B2023", "--palette-sidebar-border": "#394246", "--palette-hover": "#2A3236",
    "--palette-active": tintedSurface, "--palette-active-ink": lightAccent, "--palette-tint": "#252D31",
    "--palette-focus": lightAccent, "--palette-bar-track": "#343D41", "--palette-bar-fill": lightAccent,
    "--brand-light": tintedSurface, "--palette-soft": tintedSurface, "--palette-soft-ink": lightAccent,
    "--palette-panel-icon": tintedSurface, "--palette-panel-icon-ink": lightAccent,
    "--palette-source-bg": tintedSurface, "--palette-source-ink": lightAccent,
  };
}
