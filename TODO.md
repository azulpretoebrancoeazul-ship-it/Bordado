# Entregas

## Cadastro de pedidos — formulário e persistência própria [concluído]
- O site oferece um formulário de cadastro de pedidos com os campos DATA, NOME DO PEDIDO, ORIGEM DA VENDA, QTD BORDADOS e VALOR TOTAL.
- O site valida os dados do pedido, incluindo data, quantidade numérica e valor em moeda brasileira.
- Os pedidos criados no site são gravados na base de dados própria do projeto.

## Integração com a planilha original [bloqueado por autorização]
- Gravação de novos registros de pedidos na estrutura correspondente da planilha.
- Esta entrega requer autorização do Google Workspace, que não foi concedida. O site avisa que seus pedidos não atualizam a planilha e oferece exportação CSV. Os cinco registros atuais foram carregados como dados iniciais.

## Visões diária e mensal — resumos de produção e vendas [concluído]
- O site exibe resumo diário com total de pedidos, quantidade de bordados e valor total por dia.
- O site exibe resumo mensal com total de pedidos, quantidade de bordados e valor total por mês.
- As visões diárias e mensais distinguem vendas DTEX e CLIENTE conforme a estrutura observada na planilha.

## Histórico — busca, filtros, apresentação e exportação PDF [concluído]
- O site exibe histórico de pedidos em tabela, com busca e filtros por período, nome do pedido e origem da venda.
- A exportação do histórico gera um arquivo PDF para baixar, refletindo os filtros aplicados.
- O histórico é alimentado pelos pedidos persistidos no banco do site; não é sincronizado automaticamente com a planilha original.

## Interface — idioma, responsividade e formato local [concluído]
- O site oferece interface responsiva em português do Brasil.
- Datas e valores monetários são formatados no padrão brasileiro.
- A interface apresenta os campos e conceitos das abas ENTRY, DAY, MONTH e HISTORY da planilha REGISTRO BORDADO.

## Logotipo do site — escolher imagem do computador e restaurar o original [concluído]
- O administrador pode escolher uma imagem PNG, JPG ou WEBP de até 10 MB no computador para substituir o logotipo atual no site.
- A nova imagem é salva em armazenamento durável do projeto e compartilhada com todos os visitantes do site, incluindo a navegação e o ícone da aba.
- Somente um administrador autenticado — papel administrativo existente ou conta autorizada por configuração protegida server-side — pode trocar ou restaurar o logotipo; a leitura da imagem atual é pública.
- O administrador pode restaurar o logotipo original a qualquer momento.

## Temas e paletas do site — modo claro/escuro, mais cores e restauração [concluído]
- O administrador pode alternar separadamente entre os modos Claro e Escuro.
- O seletor oferece dez paletas em degradê: Ateliê, Botânica, Oceano, Lavanda, Romã, Mostarda, Esmeralda, Céu, Cacau e Framboesa.
- A combinação de tema e paleta é aplicada à interface e salva globalmente para todos os visitantes; ao abrir o site, todos recebem a combinação ativa.
- Somente um administrador autenticado — papel administrativo existente ou conta autorizada por configuração protegida server-side — pode alterar o tema ou paleta.
- O administrador pode voltar à combinação Ateliê/Claro original a qualquer momento.
