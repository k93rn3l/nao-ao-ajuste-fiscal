# ✊ Não ao Ajuste Fiscal

Site estático (HTML + CSS + JavaScript puros, sem frameworks e sem servidor) sobre o
pacote de ajuste fiscal (**PLP 299/2026**). Ele explica a proposta medida a medida e
facilita o envio de e-mails de cobrança a senadores e deputados.

## O que o site faz

1. **Explica o ajuste fiscal**: resumo na página inicial e a seção "O que o
   Senado aprovou até agora?", em que cada medida é explicada por uma **animação
   interativa** (play, pausa e linha do tempo), com os números, a íntegra da
   explicação e a fonte oficial em "Detalhes" abaixo de cada animação.
2. **Reúne críticas do povo**: textos de indignação prontos para copiar ou
   usar como base de e-mail, todos editáveis.
3. **Envia a cobrança**: a pessoa escolhe um parlamentar, os representantes do
   seu estado ou casas inteiras; com um clique abre o Gmail (ou o app de e-mail
   padrão) com destinatários, assunto e mensagem prontos. Com muitos
   destinatários, a lista vai em **Cco** (cópia oculta).

Não há cadastro, rastreamento, analytics ou back-end: tudo roda no navegador.

## Estrutura

```
├── index.html                  # página única do site
├── css/style.css               # estilos base
├── css/cards.css               # estilos das medidas animadas
├── js/app.js                   # lógica de contatos, críticas e e-mail
├── js/animacoes.js             # motor de animação SVG + 7 cenas (uma por medida)
├── js/cards.js                 # monta os blocos de medida (animação + detalhes)
├── js/medidas.js               # regras verificadas do PLP 299/2026 (fontes e versão)
├── js/data.js                  # parlamentares (GERADO, não editar à mão)
├── assets/svg/                 # personagens Open Peeps (CC0, Pablo Stanley)
├── scripts/gerar_dados.py      # atualiza js/data.js com as APIs oficiais
├── data/                       # JSONs brutos baixados das APIs (referência)
└── .github/workflows/deploy.yml# publicação automática no GitHub Pages
```

### Sobre as animações

O motor (`js/animacoes.js`) segue o padrão de animação determinística: cada
quadro é função pura do tempo, o que permite pausar, buscar qualquer instante na
linha do tempo e manter tudo leve (SVG gerado por código, sem bibliotecas).
As animações tocam sozinhas quando entram na tela e respeitam a preferência
`prefers-reduced-motion` (começam pausadas). Os personagens são do pack
[Open Peeps](https://www.openpeeps.com/) de Pablo Stanley (licença CC0).

## Manter as informações legislativas em dia

Os textos e fontes dos cartões ficam centralizados em `js/medidas.js`, com a versão
do texto descrita (texto-base aprovado pelo Senado em 12/11/2026, substitutivo
Eduardo Braga). Quando a tramitação avançar (destaques de 17/11, análise na Câmara):

1. Confira a [página oficial de tramitação](https://www25.senado.leg.br/web/atividade/materias/-/materia/176328)
   e as notas da Consultoria de Orçamentos;
2. Atualize `js/medidas.js` (textos, números, `dataRevisao`) e o campo `desatualizado`;
3. Atualize também a seção de resumo em `index.html` e, se necessário, os textos
   das críticas em `js/app.js`.

## Atualizar os contatos dos parlamentares

Os e-mails vêm das APIs públicas de dados abertos:

- Câmara dos Deputados: `https://dadosabertos.camara.leg.br/api/v2/deputados`
- Senado Federal: `https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json`

Para gerar o `js/data.js` novamente (após eleições, troca de partidos etc.):

```bash
python scripts/gerar_dados.py
```

Requer Python 3 instalado e conexão com a internet. Faça um commit e o site é
repuplicado automaticamente.

> Observação: senadores empossados há pouco tempo às vezes ainda não têm e-mail
> publicado na API; nesses casos o script usa o padrão oficial do Senado
> (`sen.<nome>@senado.leg.br`).

## Publicar no GitHub Pages

1. Crie um repositório novo na sua conta do GitHub e envie estes arquivos
   (o workflow já está em `.github/workflows/deploy.yml`):

   ```bash
   git init -b main
   git add .
   git commit -m "Site Não ao Ajuste Fiscal"
   git remote add origin https://github.com/<seu-usuario>/<seu-repo>.git
   git push -u origin main
   ```

2. No repositório, abra **Settings → Pages** e em **Build and deployment**
   escolha **Source: GitHub Actions**.

3. Pronto: a cada push na `main` o site é publicado em
   `https://<seu-usuario>.github.io/<seu-repo>/`.

## Editar as críticas

Os textos ficam no array `CRITICAS`, no início de `js/app.js`. Cada item tem
`título`, `assunto` e `texto`. Você pode editar livremente ou acrescentar novos.

## Aviso

Projeto cidadão e independente, sem vínculo partidário. Os dados são públicos e
o contato a parlamentares é o direito de petição garantido pelo art. 5º, XXXIV,
da Constituição Federal. Use com responsabilidade: uma mensagem bem escrita
vale mais do que dezenas iguais.
