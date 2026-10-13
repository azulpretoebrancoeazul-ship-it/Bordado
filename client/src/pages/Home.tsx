import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  ImagePlus,
  LayoutDashboard,
  Menu,
  Moon,
  Palette,
  Plus,
  Search,
  Scissors,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { OrderPdfFilters } from "@/lib/orders-pdf";
import { startLogin } from "@/const";
import { prepareBrandLogo } from "@/lib/brand-logo";
import { DEFAULT_SITE_PALETTE_ID, getPaletteVariables, SITE_PALETTES } from "@shared/brand-palettes";

type OrderOrigin = "DTEX" | "CLIENTE";
type Order = {
  id: number;
  orderDate: string;
  name: string;
  origin: OrderOrigin;
  quantity: number;
  amountCents: number;
};
type Screen = "overview" | "history";
type Period = "day" | "month";

const pad = (value: number) => String(value).padStart(2, "0");
const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const currency = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const dateLabel = (value: string, style: "short" | "long" = "short") => {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: style === "long" ? "long" : "short",
    ...(style === "long" ? { year: "numeric" as const } : {}),
  }).format(date);
};
const monthLabel = (value: string) => {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
};
const sourceName = (source: OrderOrigin) => source === "DTEX" ? "DTEX" : "Cliente";

function StitchMark({ small = false, imageSrc = null }: { small?: boolean; imageSrc?: string | null }) {
  return (
    <span className={`stitch-mark ${small ? "stitch-mark-small" : ""}`} aria-hidden="true">
      {imageSrc ? <img src={imageSrc} alt="" /> : <svg viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="17.5" />
        <path d="M12.5 12.5 27.5 27.5M27.5 12.5 12.5 27.5M20 8v24M8 20h24" />
        <circle cx="20" cy="20" r="2.4" />
      </svg>}
    </span>
  );
}

function OrderSource({ origin }: { origin: OrderOrigin }) {
  return <span className={`source-tag ${origin === "DTEX" ? "source-dtex" : "source-client"}`}>{sourceName(origin)}</span>;
}

function StatCard({ label, value, note, icon: Icon, tone = "terracotta" }: {
  label: string;
  value: string;
  note: string;
  icon: typeof ClipboardList;
  tone?: string;
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} strokeWidth={1.8} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </article>
  );
}

function exportOrdersCsv(orders: Order[]) {
  const columns = ["DATA", "NOME DO PEDIDO", "ORIGEM DA VENDA", "QTD BORDADOS", "VALOR TOTAL"];
  const rows = orders.map((order) => [
    order.orderDate,
    order.name,
    order.origin,
    String(order.quantity),
    (order.amountCents / 100).toFixed(2).replace(".", ","),
  ]);
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const content = "\uFEFF" + [columns, ...rows].map((row) => row.map(escape).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `registro-bordado-${localDate()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function OrderTable({ orders, compact = false }: { orders: Order[]; compact?: boolean }) {
  if (!orders.length) {
    return <div className="empty-table"><span className="empty-icon"><Scissors size={20} /></span><strong>Nenhum pedido por aqui</strong><span>Experimente ajustar os filtros ou registre um novo pedido.</span></div>;
  }
  return (
    <div className="table-scroll">
      <table className="orders-table">
        <thead><tr><th>Data</th><th>Nome do pedido</th><th>Origem</th><th className="numeric">Bordados</th><th className="numeric">Valor</th></tr></thead>
        <tbody>{orders.map((order) => (
          <tr key={order.id}>
            <td className="date-cell">{dateLabel(order.orderDate)}</td>
            <td><span className="order-name">{order.name}</span>{compact && <span className="order-mobile-meta">{dateLabel(order.orderDate)} · {order.quantity} bordados</span>}</td>
            <td><OrderSource origin={order.origin} /></td>
            <td className="numeric quantity-cell">{order.quantity}<span className="unit"> un.</span></td>
            <td className="numeric amount-cell">{currency(order.amountCents)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function ActivityBars({ orders, period, selectedDay, selectedMonth }: {
  orders: Order[];
  period: Period;
  selectedDay: string;
  selectedMonth: string;
}) {
  const bars = useMemo(() => {
    if (period === "day") {
      const [year, month, day] = selectedDay.split("-").map(Number);
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(year, month - 1, day - 6 + index);
        const key = localDate(date);
        const total = orders.filter((order) => order.orderDate === key).reduce((sum, order) => sum + order.amountCents, 0);
        return { key, label: new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", ""), total, active: key === selectedDay };
      });
    }
    const [year, month] = selectedMonth.split("-").map(Number);
    if (!year || !month) return [];
    const days = new Date(year, month, 0).getDate();
    const count = Math.ceil(days / 7);
    return Array.from({ length: count }, (_, index) => {
      const from = index * 7 + 1;
      const to = Math.min(from + 6, days);
      const total = orders.filter((order) => {
        const [orderYear, orderMonth, orderDay] = order.orderDate.split("-").map(Number);
        return orderYear === year && orderMonth === month && orderDay >= from && orderDay <= to;
      }).reduce((sum, order) => sum + order.amountCents, 0);
      return { key: String(index), label: `${from}–${to}`, total, active: false };
    });
  }, [orders, period, selectedDay, selectedMonth]);
  const max = Math.max(...bars.map((bar) => bar.total), 1);
  return (
    <div className={`activity-bars ${period === "month" ? "activity-bars-month" : ""}`}>
      {bars.map((bar) => (
        <div className={`bar-column ${bar.active ? "bar-active" : ""}`} key={bar.key}>
          <span className="bar-amount">{bar.total ? currency(bar.total) : "—"}</span>
          <div className="bar-track"><div className="bar-fill" style={{ height: `${bar.total ? Math.max((bar.total / max) * 100, 7) : 3}%` }} /></div>
          <span className="bar-label">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const utils = trpc.useUtils();
  const [screen, setScreen] = useState<Screen>("overview");
  const [period, setPeriod] = useState<Period>("day");
  const [selectedDay, setSelectedDay] = useState(localDate());
  const [selectedMonth, setSelectedMonth] = useState(localDate().slice(0, 7));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [isPaletteDialogOpen, setIsPaletteDialogOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [form, setForm] = useState({ orderDate: localDate(), name: "", origin: "CLIENTE" as OrderOrigin, quantity: "", amount: "" });
  const ordersQuery = trpc.orders.list.useQuery(undefined, { retry: 1 });
  const userQuery = trpc.auth.me.useQuery(undefined, { retry: false });
  const brandingPermissionQuery = trpc.branding.canManage.useQuery(undefined, { retry: false });
  const brandLogoQuery = trpc.branding.logo.useQuery(undefined, { retry: 1 });
  const paletteQuery = trpc.branding.palette.useQuery(undefined, { retry: 1, refetchOnWindowFocus: true });
  const customLogo = brandLogoQuery.data ?? null;
  const activePaletteId = paletteQuery.data?.paletteId ?? DEFAULT_SITE_PALETTE_ID;
  const themeMode = paletteQuery.data?.themeMode ?? "light";
  const activePalette = SITE_PALETTES.find((palette) => palette.id === activePaletteId) ?? SITE_PALETTES[0]!;
  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) return;
    const previousHref = favicon.getAttribute("href");
    const previousType = favicon.getAttribute("type");
    if (customLogo) {
      favicon.href = customLogo;
      favicon.removeAttribute("type");
    } else {
      favicon.href = "/bordado-mark.svg";
      favicon.type = "image/svg+xml";
    }
    return () => {
      if (previousHref) favicon.href = previousHref;
      if (previousType) favicon.type = previousType;
      else favicon.removeAttribute("type");
    };
  }, [customLogo]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.palette = activePalette.id;
    root.dataset.theme = themeMode;
    for (const [name, value] of Object.entries(getPaletteVariables(activePalette, themeMode))) root.style.setProperty(name, value);
  }, [activePalette, themeMode]);
  const createOrder = trpc.orders.create.useMutation({
    onSuccess: async () => {
      await utils.orders.list.invalidate();
      setIsFormOpen(false);
      setForm({ orderDate: localDate(), name: "", origin: "CLIENTE", quantity: "", amount: "" });
      toast.success("Pedido registrado", { description: "O pedido já aparece no histórico." });
    },
    onError: (error) => toast.error("Não foi possível salvar", { description: error.message }),
  });
  const updateLogo = trpc.branding.setLogo.useMutation({
    onSuccess: (logoUrl) => {
      utils.branding.logo.setData(undefined, logoUrl);
      setIsLogoDialogOpen(false);
      toast.success("Logotipo atualizado", { description: "A nova imagem já aparece para todos no site." });
    },
    onError: (error) => toast.error("Não foi possível atualizar o logotipo", { description: error.message }),
  });
  const resetLogo = trpc.branding.resetLogo.useMutation({
    onSuccess: () => {
      utils.branding.logo.setData(undefined, null);
      toast.success("Logotipo original restaurado", { description: "A alteração vale para todos no site." });
    },
    onError: (error) => toast.error("Não foi possível restaurar o logotipo", { description: error.message }),
  });
  const updatePalette = trpc.branding.setPalette.useMutation({
    onSuccess: (appearance) => {
      utils.branding.palette.setData(undefined, appearance);
      toast.success("Tema atualizado", { description: "As cores foram atualizadas para todos no site." });
    },
    onError: (error) => toast.error("Não foi possível aplicar a paleta", { description: error.message }),
  });
  const resetPalette = trpc.branding.resetPalette.useMutation({
    onSuccess: (appearance) => {
      utils.branding.palette.setData(undefined, appearance);
      toast.success("Tema original restaurado", { description: "O site voltou para Ateliê no modo Claro." });
    },
    onError: (error) => toast.error("Não foi possível restaurar as cores", { description: error.message }),
  });
  const orders = (ordersQuery.data ?? []) as Order[];

  const handleLogoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    let dataUrl: string;
    try {
      dataUrl = await prepareBrandLogo(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tente selecionar outra imagem.";
      toast.error("Não foi possível preparar a imagem", { description: message });
      return;
    }
    await updateLogo.mutateAsync({ dataUrl }).catch(() => undefined);
  };

  const ensureBrandAdmin = async () => {
    const [userResult, permissionResult] = await Promise.all([
      userQuery.refetch(),
      brandingPermissionQuery.refetch(),
    ]);
    if (userResult.isError || permissionResult.isError) {
      toast.error("Não foi possível confirmar sua permissão", { description: "Atualize a página e tente novamente." });
      return;
    }
    if (!userResult.data) {
      startLogin();
      return;
    }
    if (!permissionResult.data) {
      toast.error("Apenas administradores podem alterar o logotipo do site.");
      return false;
    }
    return true;
  };

  const openLogoSettings = async () => {
    if (!(await ensureBrandAdmin())) return;
    setIsLogoDialogOpen(true);
  };

  const openPaletteSettings = async () => {
    if (!(await ensureBrandAdmin())) return;
    setMobileNavOpen(false);
    setIsPaletteDialogOpen(true);
  };

  const restoreDefaultLogo = () => resetLogo.mutate();

  const dailyOrders = useMemo(() => orders.filter((order) => order.orderDate === selectedDay), [orders, selectedDay]);
  const monthlyOrders = useMemo(() => orders.filter((order) => order.orderDate.startsWith(selectedMonth)), [orders, selectedMonth]);
  const periodOrders = period === "day" ? dailyOrders : monthlyOrders;
  const totalCents = periodOrders.reduce((sum, order) => sum + order.amountCents, 0);
  const quantity = periodOrders.reduce((sum, order) => sum + order.quantity, 0);
  const dtexCents = periodOrders.filter((order) => order.origin === "DTEX").reduce((sum, order) => sum + order.amountCents, 0);
  const clientCents = periodOrders.filter((order) => order.origin === "CLIENTE").reduce((sum, order) => sum + order.amountCents, 0);
  const historyOrders = useMemo(() => orders.filter((order) => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    const matchesText = !term || order.name.toLocaleLowerCase("pt-BR").includes(term);
    const matchesSource = sourceFilter === "all" || order.origin === sourceFilter;
    const matchesFrom = !fromDate || order.orderDate >= fromDate;
    const matchesTo = !toDate || order.orderDate <= toDate;
    return matchesText && matchesSource && matchesFrom && matchesTo;
  }), [orders, search, sourceFilter, fromDate, toDate]);

  const handlePdfExport = async (exportedOrders: Order[], filters: OrderPdfFilters = {}) => {
    try {
      const { buildOrdersPdf } = await import("@/lib/orders-pdf");
      const bytes = await buildOrdersPdf(exportedOrders, filters);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `historico-bordado-${localDate()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("PDF exportado", { description: "O histórico foi baixado em PDF." });
    } catch (error) {
      toast.error("Não foi possível gerar o PDF", { description: error instanceof Error ? error.message : "Tente novamente." });
    }
  };

  const submitOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(form.amount.replace(",", "."));
    const qty = Number(form.quantity);
    if (!form.name.trim()) return toast.error("Informe o nome do pedido.");
    if (!Number.isInteger(qty) || qty <= 0) return toast.error("A quantidade precisa ser um número inteiro maior que zero.");
    if (!Number.isFinite(amount) || amount <= 0) return toast.error("Informe um valor maior que zero.");
    createOrder.mutate({ orderDate: form.orderDate, name: form.name.trim(), origin: form.origin, quantity: qty, amount });
  };

  const title = screen === "history" ? "Histórico de pedidos" : "Seu ateliê, em dia.";
  const subtitle = screen === "history" ? "Encontre um pedido e acompanhe cada detalhe." : "Acompanhe os pedidos, os bordados e as vendas.";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className={`brand-lockup ${customLogo ? "brand-lockup-custom" : ""}`}>
          {customLogo ? <img className="brand-custom-image" src={customLogo} alt="Logotipo personalizado" /> : <><span className="brand-mark-container"><StitchMark /><button type="button" className="brand-edit-button" aria-label="Alterar logotipo" title="Alterar logotipo" onClick={openLogoSettings}><ImagePlus size={13} /></button></span><span className="brand-copy"><strong>registro</strong><em>bordado</em></span></>}
          {customLogo && <button type="button" className="brand-edit-button brand-edit-custom" aria-label="Alterar logotipo" title="Alterar logotipo" onClick={openLogoSettings}><ImagePlus size={13} /></button>}
        </div>
        <div className="sidebar-section-label">MENU</div>
        <nav className="side-nav" aria-label="Navegação principal">
          <button className={`nav-item ${screen === "overview" ? "nav-item-active" : ""}`} onClick={() => { setScreen("overview"); setMobileNavOpen(false); }}><LayoutDashboard size={18} /><span>Visão geral</span>{screen === "overview" && <span className="nav-active-dot" />}</button>
          <button className={`nav-item ${screen === "history" ? "nav-item-active" : ""}`} onClick={() => { setScreen("history"); setMobileNavOpen(false); }}><ClipboardList size={18} /><span>Histórico</span><span className="nav-count">{orders.length}</span></button>
          <button type="button" className="nav-item palette-nav-item" onClick={() => void openPaletteSettings()}><Palette size={18} /><span>Tema e cores</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note-icon"><Sparkles size={16} /></div>
          <p>Um pedido de cada vez, tudo no lugar.</p>
          <span>CONTROLE DE PRODUÇÃO</span>
        </div>
        <div className="sidebar-footer"><span className="footer-stitch" />Feito com cuidado, ponto a ponto</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-button icon-button" aria-label="Abrir menu" onClick={() => setMobileNavOpen(!mobileNavOpen)}>{mobileNavOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="breadcrumb"><span>Ateliê</span><span className="breadcrumb-slash">/</span><strong>{screen === "history" ? "Histórico" : "Visão geral"}</strong></div>
          <div className="topbar-right"><span className="today-chip"><span /> {dateLabel(localDate(), "long")}</span><button className="button button-primary top-create" onClick={() => setIsFormOpen(true)}><Plus size={17} /> Novo pedido</button></div>
        </header>

        <div className="page-wrap">
          <section className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> REGISTRO BORDADO</div><h1>{title}</h1><p>{subtitle}</p></div>
            {screen === "history" && <div className="export-actions"><button className="button button-primary export-button" onClick={() => void handlePdfExport(historyOrders, { search, origin: sourceFilter, fromDate, toDate })}><ArrowDownToLine size={16} /> Exportar PDF</button><button className="button button-secondary export-button" onClick={() => exportOrdersCsv(historyOrders)}><ArrowDownToLine size={16} /> Baixar CSV</button></div>}
          </section>

          <section className="sync-notice" role="status">
            <span className="notice-dot" /><p><strong>Dados iniciais importados</strong><span> Esta versão usa o banco do site. Novos pedidos não atualizam a planilha Google automaticamente.</span></p>
            <button onClick={() => void handlePdfExport(orders)} aria-label="Baixar o histórico completo em PDF" title="Baixar o histórico completo em PDF"><ArrowDownToLine size={16} /></button>
          </section>

          {ordersQuery.isError && <div className="error-banner">Não foi possível carregar os pedidos. Atualize a página ou tente novamente.</div>}
          {ordersQuery.isLoading && <div className="loading-line"><span /> Carregando seus registros…</div>}

          {screen === "overview" ? (
            <>
              <section className="overview-controls">
                <div className="period-switch" role="tablist" aria-label="Período do resumo">
                  <button role="tab" aria-selected={period === "day"} className={period === "day" ? "period-selected" : ""} onClick={() => setPeriod("day")}><CalendarDays size={15} /> Dia</button>
                  <button role="tab" aria-selected={period === "month"} className={period === "month" ? "period-selected" : ""} onClick={() => setPeriod("month")}><CalendarDays size={15} /> Mês</button>
                </div>
                <label className="period-input"><CalendarDays size={15} />{period === "day" ? <input aria-label="Selecionar dia do resumo" type="date" value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)} /> : <input aria-label="Selecionar mês do resumo" type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} />}</label>
              </section>

              <section className="stats-grid" aria-label="Indicadores do período">
                <StatCard label="Pedidos registrados" value={String(periodOrders.length)} note={period === "day" ? "no dia selecionado" : "no mês selecionado"} icon={ClipboardList} />
                <StatCard label="Peças bordadas" value={String(quantity)} note="unidades produzidas" icon={Scissors} tone="sage" />
                <StatCard label="Vendas no período" value={currency(totalCents)} note="valor total dos pedidos" icon={CircleDollarSign} tone="gold" />
              </section>

              <section className="overview-grid">
                <article className="panel activity-panel">
                  <div className="panel-heading"><div><span className="panel-kicker">MOVIMENTO</span><h2>{period === "day" ? "Ritmo da semana" : "Vendas no mês"}</h2><p>{period === "day" ? `Valores dos dias próximos a ${dateLabel(selectedDay, "long")}` : `Vendas agrupadas por semana · ${monthLabel(selectedMonth)}`}</p></div><span className="panel-icon"><ArrowUpRight size={17} /></span></div>
                  <ActivityBars orders={orders} period={period} selectedDay={selectedDay} selectedMonth={selectedMonth} />
                  <div className="chart-legend"><span><i /> Valor registrado</span><span>{periodOrders.length} {periodOrders.length === 1 ? "pedido" : "pedidos"} neste período</span></div>
                </article>
                <article className="panel source-panel">
                  <div className="panel-heading"><div><span className="panel-kicker">POR ORIGEM</span><h2>De onde vêm as vendas</h2><p>Distribuição do valor registrado</p></div></div>
                  <div className="source-summary"><div className="source-row"><span className="source-dot dtex-dot" /><span>DTEX</span><strong>{currency(dtexCents)}</strong></div><div className="source-meter"><span className="meter-dtex" style={{ width: totalCents ? `${(dtexCents / totalCents) * 100}%` : "0%" }} /></div><div className="source-row"><span className="source-dot client-dot" /><span>Clientes</span><strong>{currency(clientCents)}</strong></div><div className="source-meter"><span className="meter-client" style={{ width: totalCents ? `${(clientCents / totalCents) * 100}%` : "0%" }} /></div></div>
                  <div className="source-total"><span>Faturamento no período</span><strong>{currency(totalCents)}</strong></div>
                </article>
              </section>

              <section className="panel recent-panel">
                <div className="panel-heading recent-heading"><div><span className="panel-kicker">ACOMPANHAMENTO</span><h2>Pedidos recentes</h2><p>Os últimos registros do seu ateliê</p></div><button className="text-link" onClick={() => setScreen("history")}>Ver histórico <ArrowUpRight size={15} /></button></div>
                <OrderTable orders={orders.slice(0, 5)} compact />
              </section>
            </>
          ) : (
            <section className="panel history-panel">
              <div className="history-toolbar"><div><span className="panel-kicker">TODOS OS REGISTROS</span><h2>Pedidos do ateliê</h2><p>{historyOrders.length} {historyOrders.length === 1 ? "pedido encontrado" : "pedidos encontrados"}</p></div></div>
              <div className="filter-row">
                <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar pelo nome do pedido" aria-label="Buscar pelo nome do pedido" />{search && <button aria-label="Limpar busca" onClick={() => setSearch("")}><X size={15} /></button>}</label>
                <label className="select-field"><span>Origem</span><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}><option value="all">Todas</option><option value="DTEX">DTEX</option><option value="CLIENTE">Cliente</option></select><ChevronDown size={14} /></label>
                <label className="date-filter"><span>De</span><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} aria-label="Filtrar data inicial" /></label>
                <label className="date-filter"><span>Até</span><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} aria-label="Filtrar data final" /></label>
              </div>
              <OrderTable orders={historyOrders} />
              {!!historyOrders.length && <div className="table-footnote">Exibindo {historyOrders.length} de {orders.length} pedidos registrados</div>}
            </section>
          )}
          <footer className="main-footer"><span>{customLogo ? <img className="footer-custom-image" src={customLogo} alt="Logotipo personalizado" /> : <><StitchMark small /> REGISTRO BORDADO</>}</span><span>Um bom trabalho começa com um registro bem feito.</span></footer>
        </div>
      </main>

      {isFormOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}>
        <section className="order-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <header className="modal-header"><span className="modal-icon"><Scissors size={19} /></span><button className="icon-button modal-close" onClick={() => setIsFormOpen(false)} aria-label="Fechar"><X size={20} /></button><span className="panel-kicker">NOVO REGISTRO</span><h2 id="modal-title">Um novo pedido, um novo ponto.</h2><p>Preencha os detalhes para manter tudo em ordem.</p></header>
          <form className="order-form" onSubmit={submitOrder}>
            <label>Data do pedido<input type="date" required value={form.orderDate} onChange={(event) => setForm({ ...form, orderDate: event.target.value })} /></label>
            <label>Nome do pedido<input autoFocus type="text" required maxLength={180} placeholder="Ex.: Nome do cliente ou empresa" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <div className="form-row"><label>Origem da venda<select value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value as OrderOrigin })}><option value="CLIENTE">Cliente</option><option value="DTEX">DTEX</option></select></label><label>Quantidade de bordados<input type="number" required min="1" step="1" placeholder="0" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label></div>
            <label>Valor total<input type="number" required min="0.01" step="0.01" inputMode="decimal" placeholder="0,00" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
            <div className="form-hint"><span className="notice-dot" /> Este registro será salvo no banco do site.</div>
            <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button><button type="submit" className="button button-primary" disabled={createOrder.isPending}>{createOrder.isPending ? <span className="button-spinner" /> : <Check size={17} />} {createOrder.isPending ? "Salvando…" : "Salvar pedido"}</button></div>
          </form>
        </section>
      </div>}

      {isLogoDialogOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsLogoDialogOpen(false); }}>
        <section className="order-modal logo-modal" role="dialog" aria-modal="true" aria-labelledby="logo-modal-title">
          <header className="modal-header"><span className="modal-icon"><ImagePlus size={19} /></span><button className="icon-button modal-close" onClick={() => setIsLogoDialogOpen(false)} aria-label="Fechar"><X size={20} /></button><span className="panel-kicker">PERSONALIZE O ATELIÊ</span><h2 id="logo-modal-title">Trocar logotipo</h2><p>Escolha uma foto ou imagem salva no seu computador. Ela substituirá o logotipo atual.</p></header>
          <input ref={logoFileInputRef} hidden type="file" accept="image/png,image/jpeg,image/webp" aria-label="Selecionar imagem para o logotipo" onChange={(event) => void handleLogoFileChange(event)} />
          <div className="logo-preview" aria-label={customLogo ? "Prévia do logotipo escolhido" : "Prévia do logotipo original"}>{customLogo ? <img src={customLogo} alt="Prévia do logotipo escolhido" /> : <StitchMark />}</div>
          <p className="logo-storage-note">PNG, JPG ou WEBP · até 10 MB. A imagem será compartilhada com todos os visitantes. Somente administradores podem alterá-la.</p>
          <div className="form-actions logo-form-actions"><button type="button" className="button button-secondary" disabled={updateLogo.isPending || resetLogo.isPending} onClick={() => logoFileInputRef.current?.click()}>{updateLogo.isPending ? <span className="button-spinner" /> : <ImagePlus size={16} />} Escolher foto</button>{customLogo && <button type="button" className="button button-secondary" disabled={updateLogo.isPending || resetLogo.isPending} onClick={restoreDefaultLogo}>{resetLogo.isPending ? <span className="button-spinner" /> : null} Restaurar original</button>}<button type="button" className="button button-primary" onClick={() => setIsLogoDialogOpen(false)}>Concluir</button></div>
        </section>
      </div>}

      {isPaletteDialogOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsPaletteDialogOpen(false); }}>
        <section className="order-modal palette-modal" role="dialog" aria-modal="true" aria-labelledby="palette-modal-title">
          <header className="modal-header"><span className="modal-icon"><Palette size={19} /></span><button type="button" className="icon-button modal-close" onClick={() => setIsPaletteDialogOpen(false)} aria-label="Fechar"><X size={20} /></button><span className="panel-kicker">PERSONALIZE O ATELIÊ</span><h2 id="palette-modal-title">Tema e paleta de cores</h2><p>Combine o modo de exibição com uma paleta para todo o site.</p></header>
          <div className="palette-mode-section"><span className="palette-section-title">MODO</span><div className="palette-mode-control" role="group" aria-label="Modo do tema"><button type="button" className={themeMode === "light" ? "palette-mode-selected" : ""} aria-pressed={themeMode === "light"} disabled={updatePalette.isPending || resetPalette.isPending} onClick={() => updatePalette.mutate({ paletteId: activePalette.id, themeMode: "light" })}><Sun size={16} /> Claro</button><button type="button" className={themeMode === "dark" ? "palette-mode-selected" : ""} aria-pressed={themeMode === "dark"} disabled={updatePalette.isPending || resetPalette.isPending} onClick={() => updatePalette.mutate({ paletteId: activePalette.id, themeMode: "dark" })}><Moon size={16} /> Escuro</button></div></div>
          <div className="palette-library-heading"><span className="palette-section-title">CORES · {SITE_PALETTES.length} PALETAS</span></div>
          <div className="palette-options">
            {SITE_PALETTES.map((palette) => <button type="button" key={palette.id} className={`palette-option ${activePaletteId === palette.id ? "palette-option-selected" : ""}`} aria-pressed={activePaletteId === palette.id} disabled={updatePalette.isPending || resetPalette.isPending} onClick={() => updatePalette.mutate({ paletteId: palette.id, themeMode })}>
              <span className="palette-gradient" aria-hidden="true" style={{ background: `linear-gradient(115deg, ${palette.swatches[0]}, ${palette.swatches[1]} 56%, ${palette.swatches[2]})` }} />
              <span className="palette-option-copy"><strong>{palette.name}</strong><small>{palette.description}</small></span>
              {activePaletteId === palette.id && <span className="palette-option-check" aria-label="Paleta ativa"><Check size={17} /></span>}
            </button>)}
          </div>
          <p className="palette-global-note">A combinação escolhida é salva e aparece para todos os visitantes.</p>
          <div className="form-actions palette-form-actions">{(activePaletteId !== DEFAULT_SITE_PALETTE_ID || themeMode !== "light") && <button type="button" className="button button-secondary" disabled={updatePalette.isPending || resetPalette.isPending} onClick={() => resetPalette.mutate()}>{resetPalette.isPending ? <span className="button-spinner" /> : null} Restaurar Ateliê/Claro</button>}<button type="button" className="button button-primary" onClick={() => setIsPaletteDialogOpen(false)}>Concluir</button></div>
        </section>
      </div>}
    </div>
  );
}
