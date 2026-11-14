# ✊ Não ao Ajuste Fiscal

Site estático (HTML + CSS + JavaScript puros, sem frameworks e sem servidor) sobre o
pacote de ajuste fiscal (**PLP 299/2026**). Ele explica a proposta medida a medida,
simula o efeito das regras sobre o orçamento e facilita o envio de e-mails de
cobrança a senadores e deputados.

## O que o site faz

1. **Explica o ajuste fiscal**: resumo na página inicial, mais a seção "O que o
   Senado aprovou até agora?", com cartões expansíveis (o que acontece hoje, o que
   muda, exemplos, críticas, defesas e fonte oficial de cada medida).
2. **Simula as regras** na seção "Simule você mesmo": piso da saúde, teto de
   crescimento das despesas, meta fiscal e bloqueios, benefícios tributários e um
   comparador entre cenários. Valores iniciais reais onde existem (Orçamento 2027,
   PLDO), sliders com resultado instantâneo, interpretação em português simples e
   bloco de transparência sobre as hipóteses.
3. **Reúne críticas do povo**: textos de indignação prontos para copiar ou
   usar como base de e-mail, todos editáveis.
4. **Envia a cobrança**: a pessoa escolhe um parlamentar, os representantes do
   seu estado ou casas inteiras; com um clique abre o Gmail (ou o app de e-mail
   padrão) com destinatários, assunto e mensagem prontos. Com muitos
   destinatários, a lista vai em **Cco** (cópia oculta).

Não há cadastro, rastreamento, analytics ou back-end: tudo roda no navegador.

## Estrutura

```
├── index.html                  # página única do site
├── css/style.css               # estilos base
├── css/simulador.css           # estilos do módulo de simulação
├── js/app.js                   # lógica de contatos, críticas e e-mail
├── js/simulador.js             # cards e simuladores interativos
├── js/medidas.js               # regras verificadas do PLP 299/2026 (fontes e versão)
├── js/data.js                  # parlamentares (GERADO, não editar à mão)
├── scripts/gerar_dados.py      # atualiza js/data.js com as APIs oficiais
├── data/                       # JSONs brutos baixados das APIs (referência)
└── .github/workflows/deploy.yml# publicação automática no GitHub Pages
```

## Manter as informações legislativas em dia

As regras, textos e fontes do módulo educativo ficam centralizadas em
`js/medidas.js`, com a versão do texto descrita (texto-base aprovado pelo Senado
em 12/11/2026, substitutivo Eduardo Braga). Quando a tramitação avançar
(destaques de 17/11, análise na Câmara):

1. Confira a [página oficial de tramitação](https://www25.senado.leg.br/web/atividade/materias/-/materia/176328)
   e as notas da Consultoria de Orçamentos;
2. Atualize `js/medidas.js` (textos, números, `dataRevisao`) e, enquanto a
   atualização não sair, mude `desatualizado` para `true`: o site passa a exibir
   o aviso de atualização pendente;
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
