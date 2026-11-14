# ✊ Não ao Ajuste Fiscal

Site estático (HTML + CSS + JavaScript puros, sem frameworks e sem servidor) para
concentrar as críticas legítimas ao pacote de ajuste fiscal (**PLP 299/2026**) e
facilitar o envio de e-mails de cobrança a senadores e deputados.

## O que o site faz

1. **Explica os pontos do ajuste fiscal**: pisos de saúde e educação, teto de
   gastos e bloqueios, tributação de altas rendas, cortes de incentivos fiscais
   e o estado da tramitação, com links para as fontes.
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
├── css/style.css               # estilos
├── js/app.js                   # lógica (críticas, filtros, e-mail)
├── js/data.js                  # parlamentares (GERADO, não editar à mão)
├── scripts/gerar_dados.py      # atualiza js/data.js com as APIs oficiais
├── data/                       # JSONs brutos baixados das APIs (referência)
└── .github/workflows/deploy.yml# publicação automática no GitHub Pages
```

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
