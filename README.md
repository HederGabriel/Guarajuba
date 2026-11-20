# Bahia 2027 — Guia da viagem

Site estático em HTML, CSS e JavaScript puro. `roteiro.json` é a única fonte de dados.

## Estrutura
- `index.html`: estrutura da página
- `css/style.css`: identidade visual e responsividade
- `js/data.js`: carregamento e utilitários de dados
- `js/app.js`: renderização e interações
- `roteiro.json`: dados da viagem
- `assets/`: ilustrações locais em SVG

## Executar localmente
O site usa `fetch()` e precisa de servidor HTTP. Na pasta do projeto, execute:

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`. Também funciona com a extensão Live Server do VS Code.

## Atualização
Edite somente `roteiro.json`. O site carrega o arquivo ao abrir e verifica alterações a cada 30 segundos, com cache desativado. Se a hospedagem/CDN aplicar cache agressivo, reduza o tempo de cache para `roteiro.json`.

## Observações
- Atividades relacionam-se aos locais por `location_id`.
- Links de mapas são lidos do cadastro `locations`.
- O checklist marcado é salvo no `localStorage` do dispositivo/navegador.
- Campos sem horário definido aparecem como “A definir”.
- Dados e locais sem informação na fonte não foram completados por suposição.
