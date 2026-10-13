# Plano — Registro Bordado

## Escopo e premissas

Criar uma aplicação web responsiva, em português do Brasil, inspirada na planilha REGISTRO BORDADO e cobrindo os campos e consultas das abas ENTRY, DAY, MONTH e HISTORY. O fluxo aceito contempla cadastro de pedidos, resumo diário e mensal, histórico filtrável e formatação pt-BR.

A conta Google não autorizou o conector Google Workspace. Portanto, esta versão não lerá nem gravará alterações na planilha original em tempo real. Os cinco registros atuais serão importados como carga inicial para a base gerenciada do projeto. Novos registros ficarão nessa base; o painel oferecerá exportação PDF do histórico filtrado e exportação CSV auxiliar para facilitar transferência manual. A integração direta só poderá ser retomada com autorização da conta Google.

## Implementação e arquitetura

- Manter o stack do projeto: React + TypeScript no cliente, Express/tRPC no servidor e Drizzle/MySQL na persistência gerenciada.
- Criar tabela aditiva `embroidery_orders`, com data, nome do pedido, origem (`DTEX` ou `CLIENTE`), quantidade, valor em centavos e data de criação. Não substituir nem apagar registros existentes.
- Expor via tRPC consulta de pedidos e criação validada. Resumos diário e mensal e filtragem do histórico serão derivados dos pedidos persistidos.
- Incluir migração determinística e carga inicial não destrutiva dos cinco registros observados na planilha de 09/10/2026. Valores: RN PNEUS E RODAS / DTEX / 8 / R$ 360,00; APIÁRIOS DINIZ / CLIENTE / 10 / R$ 98,00; POLÍCIA CIVIL / CLIENTE / 2 / R$ 35,00; ARTESANATO CASA DAS REDES / CLIENTE / 4 / R$ 52,00; SERIEMA / CLIENTE / 7 / R$ 98,00. Totais de referência: 5 pedidos, 31 bordados, R$ 643,00; R$ 360,00 em DTEX e R$ 283,00 em CLIENTE.
- Usar uma rota de página (`/`) com navegação local entre Visão geral, Novo pedido e Histórico; não criar APIs ou rotas de página adicionais.
- Acrescentar preferências globais com dois modos (Claro/Escuro) e dez paletas (Ateliê, Botânica, Oceano, Lavanda, Romã, Mostarda, Esmeralda, Céu, Cacau e Framboesa), com amostras em degradê e destaques suaves; servir a combinação ativa publicamente e permitir alteração apenas por administrador autenticado. Persistir modo e paleta em tabela singleton separada da imagem do logotipo; Ateliê/Claro será o padrão e a opção de restauração.
- Preservar expressamente o limite da autorização Google: sem OAuth improvisado, token de usuário, alteração de compartilhamento da planilha ou escrita sem autenticação.

## Estrutura do projeto

- `client/src/pages/Home.tsx`: interface principal, formulário, seletores de período, resumos, filtros, tabela e exportações PDF/CSV.
- `client/src/lib/orders-pdf.ts`: geração no navegador de PDF A4 paisagem com filtros, resumo e tabela multipágina; carregado sob demanda.
- `client/src/lib/brand-logo.ts`: validação e redução da imagem escolhida pelo administrador antes do envio ao armazenamento durável compartilhado do site.
- `client/src/pages/Home.tsx`: a marca carregada é aplicada à navegação, ao rodapé e ao favicon, permanecendo igual para todos os visitantes.
- `shared/brand-palettes.ts`: catálogo das dez paletas, modos claro/escuro e tokens CSS compartilhados pelo cliente e servidor; amostras e ações principais usam degradês suaves.
- `client/src/index.css`: sistema visual responsivo, tokens CSS e estilos em degradê dos temas selecionáveis.
- `client/index.html`: idioma, título e fontes.
- `drizzle/schema.ts`: modelos persistidos de pedidos, da configuração global da marca e da combinação ativa de tema/paleta.
- `drizzle/`: migração aditiva e snapshot/journal gerados pelo Drizzle.
- `server/db.ts`: consultas e inserções tipadas para pedidos e preferências visuais, mantendo o código de usuários existente.
- `server/routers.ts`: procedimentos tRPC para pedidos, leitura pública do tema/paleta e atualização/restauração protegida por permissão administrativa.
- `server/routers.ts` e `server/_core/trpc.ts`: leitura pública da marca atual; upload/restauração para administrador autenticado por papel ou pela conta permitida guardada em configuração server-only; o cliente consulta apenas um booleano de permissão.
- `client/public/manus-routes.json` e `client/public/bordado-mark.svg`: manifesto da rota de página e favicon público.
- `plan.md` e `TODO.md`: plano e critérios de entrega.

## Direção visual

- **Movimento de design:** painel editorial contemporâneo de ateliê, com referências de cadernos de produção e interfaces administrativas enxutas.
- **Princípios centrais:** leitura imediata dos números; calor de oficina artesanal sem ornamento excessivo; rótulos e unidades sempre explícitos; ações frequentes acessíveis em poucos passos.
- **Filosofia de cor:** o modo claro usa superfícies de papel com dez acentos distintos; o modo escuro reduz brilho com superfícies carvão, mantendo a cor de destaque escolhida. Os botões e amostras usam degradês discretos, mantendo contraste e leitura.
- **Paradigma de layout:** navegação lateral estreita em telas largas, cabeçalho editorial alinhado à esquerda e conteúdo em faixas assimétricas; em telas pequenas, navegação compacta e cartões empilhados.
- **Elementos de assinatura:** símbolo de ponto/cruz de bordado no logotipo; pequenos traços de pesponto em separadores; badges de origem com cor discreta.
- **Interação e animação:** foco visível; hover curto e sutil; confirmação de gravação próxima ao formulário; sem animações decorativas lentas; respeitar `prefers-reduced-motion`.
- **Tipografia:** Manrope para interface e números; DM Sans para texto auxiliar. Títulos compactos e com peso 600–700; valores numéricos tabulares e destacados; metadados menores, mas com contraste acessível.
- **Essência da marca:** ferramenta simples para registrar e acompanhar a produção e venda de bordados com clareza. Personalidade: cuidadosa, prática, acolhedora.
- **Voz da marca:** direta e gentil. Exemplos: “Um pedido de cada vez, tudo no lugar.”; “Fechamento do dia, sem perder nenhum ponto.”
- **Marca/logotipo:** wordmark tipográfico “Registro Bordado” acompanhado de um pequeno selo circular com cruz de ponto e traço de linha; não depender de imagem genérica.
- **Cor proprietária:** terracota de linha `#C66B3D`.

## Servir

O projeto usa a aplicação Express existente na porta 3000, servida em `0.0.0.0` pelo comando `pnpm dev`. Os dados são persistidos no banco MySQL gerenciado do projeto. A versão entregue será disponibilizada em Preview; publicação não foi solicitada.
