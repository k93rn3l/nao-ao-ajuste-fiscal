// Regras verificadas do PLP 299/2026, centralizadas para facilitar atualização.
// Fontes: nota informativa da Consultoria de Orçamentos (Conorf/Senado) sobre o
// texto aprovado em 12/11/2026 e página oficial de tramitação. Não editar os
// valores legislativos sem conferir as fontes indicadas abaixo.
window.MEDIDAS = {
  versao: "Texto-base aprovado pelo Senado em 12/11/2026 (substitutivo do relator Eduardo Braga, MDB-AM)",
  dataRevisao: "2026-11-14",
  desatualizado: false, // mudar para true quando houver texto mais novo não refletido aqui
  fontes: {
    tramitacao: {
      nome: "Página oficial de tramitação do PLP 299/2026 (Senado)",
      url: "https://www25.senado.leg.br/web/atividade/materias/-/materia/176328"
    },
    noticia: {
      nome: "Agência Senado: texto principal do ajuste fiscal é aprovado pelo Senado (12/11/2026)",
      url: "https://www12.senado.leg.br/noticias/materias/2026/11/12/texto-principal-do-ajuste-fiscal-e-aprovado-pelo-senado"
    },
    notaTecnica: {
      nome: "Nota informativa da Consultoria de Orçamentos sobre o texto aprovado",
      url: "https://www12.senado.leg.br/orcamento/documentos/estudos/tipos-de-estudos/notas-tecnicas-e-informativos/nota_informativa_texto_aprovado_plp_299_2026.pdf/view"
    }
  },
  tramitacao: {
    apresentacao: "Apresentado pelo senador Jaques Wagner (PT-BA), a pedido do Executivo",
    relatoria: "O substitutivo aprovado tem relatoria do senador Eduardo Braga (MDB-AM)",
    votacao: "Texto-base aprovado pelo Senado em 12/11/2026, por 45 votos a 31",
    destaques: "Quatro destaques ainda dependem de votação (sessão prevista para 17/11/2026): Lei Kandir, teto da compensação previdenciária, redução da compensação tributária e desvinculação de até 40% do superávit financeiro",
    proximoPasso: "Depois dos destaques, o texto segue para a Câmara dos Deputados, onde pode ser alterado. Ainda não é lei"
  },
  regras: {
    pisoSaude: {
      aliquota: 0.15,
      descricao: "A Constituição exige que a União aplique em ações e serviços públicos de saúde, no mínimo, 15% da Receita Corrente Líquida (RCL)",
      exemploReal: {
        rclComExclusao: 1814.4,
        rclSemExclusao: 1859.9,
        minimoCom: 272.2,
        minimoSem: 279.0
      }
    },
    crescimento: {
      maximoAtual: 0.025,
      maximoNovo: 0.02,
      minimo: 0.006,
      descricao: "O limite anual de despesas primárias cresce pela inflação (IPCA) mais um crescimento real, que hoje vai de 0,6% a 2,5% ao ano (LC 200/2023). O texto aprovado reduz o teto real para 2,0% nos anos em que houver contingenciamento"
    },
    meta: {
      centro: 0.005,
      piso: 0.0025,
      teto: 0.0075,
      centroReais: 73.2,
      pisoReais: 36.6,
      descricao: "A meta de resultado primário de 2027 (PLDO) é superávit de 0,5% do PIB (R$ 73,2 bilhões), com intervalo de tolerância de 0,25 ponto: entre 0,25% e 0,75% do PIB a meta é considerada cumprida"
    },
    beneficios: {
      corteAtual: 0.10,
      corteNovo: 0.20,
      estimativaReducaoAdicional: 15.0,
      descricao: "A LC 224/2025 já reduzia linearmente em 10% os benefícios tributários federais (PIS/Cofins, IRPJ, CSLL, IPI, Imposto de Importação e contribuição patronal). O texto aprovado dobra o corte para 20%, com exceções"
    }
  },
  cards: [
    {
      id: "saude",
      icone: "🏥",
      titulo: "Financiamento da saúde",
      hoje: "A União é obrigada a investir, no mínimo, 15% da Receita Corrente Líquida (RCL) em ações e serviços públicos de saúde. Toda receita que entra na RCL aumenta automaticamente esse piso.",
      proposta: "O texto aprovado fixa, até 2030, a exclusão de receitas de petróleo e gás do cálculo de despesas atreladas à RCL e acrescenta uma nova exclusão: o imposto de exportação de petróleo bruto (alíquota de 12%, criado em março de 2026). Mantida a interpretação usada no Orçamento de 2027, isso reduz a base de cálculo do piso da saúde.",
      exemplo: "No projeto de Orçamento de 2027, a RCL considerada foi de R$ 1.814,4 bilhões (contra R$ 1.859,9 bilhões sem a exclusão). O piso da saúde ficou em R$ 272,2 bilhões, em vez de R$ 279,0 bilhões: R$ 6,8 bilhões a menos de obrigação mínima. Cada R$ 10 bilhões do imposto de exportação excluído correspondem a cerca de R$ 1,5 bilhão a menos no piso.",
      impacto: "Uma base menor significa obrigação mínima menor. Isso não equivale, por si só, a um corte no que será efetivamente gasto, mas reduz o assoalho legal que protege o SUS.",
      criticos: "Questionam a legalidade de excluir receitas do cálculo de um mínimo fixado diretamente na Constituição (art. 198, § 2º, I). A própria Consultoria do Senado registra controvérsia jurídica.",
      defensores: "Dizem que a receita extraordinária do petróleo não deveria criar despesa permanente, e que o dinheiro continua no Tesouro: só deixa de elevar automaticamente gastos indexados à RCL.",
      fonte: "Nota informativa Conorf/Senado, item 3.5.1 (pág. 17-18)",
      fonteUrl: "https://www12.senado.leg.br/orcamento/documentos/estudos/tipos-de-estudos/notas-tecnicas-e-informativos/nota_informativa_texto_aprovado_plp_299_2026.pdf/view",
      situacao: "Aprovado no texto-base do Senado em 12/11/2026. Sujeito a mudanças na Câmara.",
      simulador: "sim-piso-saude"
    },
    {
      id: "educacao",
      icone: "🎓",
      titulo: "Educação pública",
      hoje: "O piso da educação (18% da receita de impostos, mais a complementação) é calculado sobre a receita de impostos, e não sobre a RCL. Além do piso, universidades, institutos federais e bolsas dependem de despesas discricionárias, definidas a cada Orçamento.",
      proposta: "O texto aprovado não altera a base de cálculo do piso da educação. O aperto vem por outros caminhos: contingenciamento preventivo (que, na prática, recai sobre despesas discricionárias) e a possibilidade de o FNDCT custear bolsas de estudo e pesquisa.",
      exemplo: "Se um ministério recebe R$ 100 para investir e o governo precisa conter despesas, o corte praticamente não pode atingir salários e benefícios obrigatórios: sobra menos dinheiro para obras, bolsas e funcionamento das universidades.",
      impacto: "O piso obrigatório segue intocado, mas a verba discricionária que mantém instituições funcionando pode ser bloqueada com mais facilidade.",
      criticos: "Alertam que universidades, bolsas e investimento público já conviveram com teto e contingenciamento por anos, e que facilitar o bloqueio aprofunda essa crise sem tocar no piso.",
      defensores: "Respondem que as obrigações constitucionais continuam protegidas e que a medida dá ao Executivo flexibilidade para fechar as contas sem cortar direitos.",
      fonte: "Nota informativa Conorf/Senado (pág. 18: o mínimo da educação não é afetado)",
      fonteUrl: "https://www12.senado.leg.br/orcamento/documentos/estudos/tipos-de-estudos/notas-tecnicas-e-informativos/nota_informativa_texto_aprovado_plp_299_2026.pdf/view",
      situacao: "Aprovado no texto-base do Senado em 12/11/2026. Sujeito a mudanças na Câmara.",
      simulador: "sim-meta"
    },
    {
      id: "teto",
      icone: "📉",
      titulo: "Limite de crescimento dos gastos",
      hoje: "Pela LC 200/2023, o limite anual de despesas primárias de cada Poder cresce pela inflação (IPCA) mais um crescimento real, calculado como parte do crescimento da receita. Esse crescimento real nunca é menor que 0,6% nem maior que 2,5% ao ano.",
      proposta: "O texto aprovado reduz o teto de crescimento real de 2,5% para 2,0% nos anos em que houver contingenciamento. A regra só tem efeito nos anos em que o crescimento calculado pelas regras normais superaria 2,0%, e é aplicada na execução, como contenção adicional.",
      exemplo: "Com limite de R$ 2.392,6 bilhões e inflação de 4%, crescer 2,5% em termos reais ou crescer 2,0% significa uma diferença de espaço de dezenas de bilhões. Nenhum dos dois cenários é um corte no orçamento: ambos continuam crescendo acima da inflação.",
      impacto: "Menos espaço para expandir programas acima da inflação nos anos de aperto. Não é uma redução nominal do orçamento.",
      criticos: "Dizem que, somado ao bloqueio mais fácil, o teto menor engessa por mais tempo serviços públicos que já operam no limite.",
      defensores: "Argumentam que 2,0% ao ano de crescimento real continua sendo expansão e que a regra só vale em anos de contingenciamento.",
      fonte: "Nota informativa Conorf/Senado, item 3.2.3 (pág. 9)",
      fonteUrl: "https://www12.senado.leg.br/orcamento/documentos/estudos/tipos-de-estudos/notas-tecnicas-e-informativos/nota_informativa_texto_aprovado_plp_299_2026.pdf/view",
      situacao: "Aprovado no texto-base do Senado em 12/11/2026. Sujeito a mudanças na Câmara.",
      simulador: "sim-teto"
    },
    {
      id: "contingenciamento",
      icone: "🚧",
      titulo: "Contingenciamento e bloqueio",
      hoje: "A cada dois meses o governo publica o RARDP. Se a projeção indicar risco de descumprimento da meta, a LRF (art. 9º) obriga a bloquear empenhos. Na prática, o bloqueio tem sido dimensionado para levar a projeção até o piso do intervalo de tolerância, não até o centro da meta. A LRF protege do corte as obrigações constitucionais e legais: sobra, sobretudo, a despesa discricionária.",
      proposta: "O texto aprovado cria um contingenciamento preventivo (art. 6º-C da LC 200/2023): mesmo com a projeção dentro da faixa de tolerância, mas abaixo do centro da meta, o Executivo fica autorizado, não obrigado, a bloquear para se aproximar do centro. E, quando houver bloqueio obrigatório, pode fazer um adicional por cima.",
      exemplo: "Meta de superávit de 0,5% do PIB com tolerância até 0,25%. Uma projeção de 0,3% do PIB hoje não permite bloqueio; com a nova regra, o governo pode bloquear para tentar chegar perto de 0,5%.",
      impacto: "O parecer do relator estima em R$ 12,8 a 18,3 bilhões o efeito do contingenciamento com foco no centro da meta em 2027. O corte prático recai sobre investimento, custeio e políticas discricionárias.",
      criticos: "Chamam a medida de teto disfarçado: mais fácil bloquear, mesmo sem risco formal de estouro, sempre às custas da despesa discricionária.",
      defensores: "Dizem que buscar o centro da meta, e não apenas o piso do intervalo, é prudência: evita descumprir a meta no fim do ano e preserva a credibilidade fiscal.",
      fonte: "Nota informativa Conorf/Senado, itens 3.2.1 e 3.2.2 (pág. 6-7)",
      fonteUrl: "https://www12.senado.leg.br/orcamento/documentos/estudos/tipos-de-estudos/notas-tecnicas-e-informativos/nota_informativa_texto_aprovado_plp_299_2026.pdf/view",
      situacao: "Aprovado no texto-base do Senado em 12/11/2026. Sujeito a mudanças na Câmara.",
      simulador: "sim-meta"
    },
    {
      id: "beneficios",
      icone: "✂️",
      titulo: "Benefícios tributários",
      hoje: "A LC 224/2025 já reduzia linearmente em 10% os benefícios tributários federais de PIS/Cofins, IRPJ, CSLL, IPI, Imposto de Importação e contribuição patronal, com exceções como Zona Franca de Manaus, cesta básica e Simples Nacional.",
      proposta: "O texto aprovado dobra o corte, de 10% para 20%, nas sete modalidades de benefício, e passa a alcançar os demonstrativos de gastos tributários de cada exercício. Novas exceções: CPRB (desoneração da folha), TI e semicondutores, e veículos para pessoas com deficiência ou TEA.",
      exemplo: "Um crédito presumido de R$ 100 que hoje rende R$ 90 de aproveitamento passaria a render R$ 80. Uma isenção de IPI com alíquota padrão de 10% sai de 1% para 2% do tributo devido.",
      impacto: "O parecer estima R$ 15 bilhões para a redução adicional de 10% dos gastos tributários em 2027. Benefício fiscal cortado não é despesa cortada: é menos renúncia, e a arrecadação real depende da reação das empresas, que podem recorrer à Justiça.",
      criticos: "Apontam risco de judicialização e de carga extra sobre setores produtivos, e lembram que renúncia e investimento social não são a mesma coisa.",
      defensores: "Defendem que subsidiar menos e arrecadar mais é o caminho mais justo para o ajuste, em vez de cortar saúde e educação.",
      fonte: "Nota informativa Conorf/Senado, item 3.3.2 e Quadro 7 (pág. 12-13)",
      fonteUrl: "https://www12.senado.leg.br/orcamento/documentos/estudos/tipos-de-estudos/notas-tecnicas-e-informativos/nota_informativa_texto_aprovado_plp_299_2026.pdf/view",
      situacao: "Aprovado no texto-base do Senado em 12/11/2026. Sujeito a mudanças na Câmara.",
      simulador: "sim-beneficios"
    },
    {
      id: "supersalarios",
      icone: "💰",
      titulo: "Supersalários",
      hoje: "Servidores recebem, além do salário, verbas indenizatórias e auxílios que, somadas, ultrapassam o teto constitucional de remuneração. São os chamados supersalários e penduricalhos, apontados em auditorias como gasto irregular.",
      proposta: "O texto aprovado dá 120 dias para o Congresso apreciar projeto de lei sobre verbas indenizatórias e define a destinação da economia: no Executivo, para segurança pública e atendimento socioeducativo; nos demais Poderes, para recompor quadros.",
      exemplo: "A medida não corta automaticamente nenhum pagamento: ela marca um prazo para o Congresso regulamentar o tema e diz para onde vai a economia, se e quando ela acontecer.",
      impacto: "Depende inteiramente da lei que vier a ser aprovada. Sem essa lei, os pagamentos atuais continuam.",
      criticos: "Consideram o prazo uma forma de empurrar o problema, já que o Congresso já podia regulamentar o tema e não o fazia.",
      defensores: "Argumentam que fixar prazo e destinação (segurança pública) cria pressão concreta para a regulamentação.",
      fonte: "Agência Senado (12/11/2026) e nota informativa Conorf/Senado, item 3.6 (pág. 19-20)",
      fonteUrl: "https://www12.senado.leg.br/noticias/materias/2026/11/12/texto-principal-do-ajuste-fiscal-e-aprovado-pelo-senado",
      situacao: "Aprovado no texto-base do Senado em 12/11/2026. Sujeito a mudanças na Câmara.",
      simulador: null
    },
    {
      id: "outras",
      icone: "🧩",
      titulo: "Outras medidas do pacote",
      hoje: "O pacote reúne ainda mudanças em repasses a estados, compensações tributárias, fundos e medidas setoriais espalhadas por diversos artigos.",
      proposta: "Lei Kandir: a parcela reduzida de repasses entre 2027 e 2030 volta a ser devolvida já a partir do ano seguinte, até 2037 (hoje, apenas entre 2031 e 2037). Compensação tributária: o Executivo fica autorizado a restringir o uso de créditos para compensar tributos, com efeito estimado de R$ 12,8 a 18,3 bilhões em 2027. Regra de ouro: margem ampliada em R$ 100 bilhões com a desvinculação do superávit financeiro. FNDCT passa a poder custear bolsas. Diesel: até R$ 10,5 bilhões de subvenção em 2026 fora da apuração da meta, por causa do conflito no Oriente Médio.",
      exemplo: "Uma empresa que acumulou créditos tributários pode ser obrigada a usar uma parte menor deles por mês, pagando mais imposto à vista.",
      impacto: "O parecer do relator estima impacto positivo entre R$ 45,1 e R$ 56,1 bilhões no resultado primário de 2027, somando todas as medidas. É estimativa, não economia realizada.",
      criticos: "Destacam que quatro desses pontos (Kandir, teto da compensação previdenciária, redução da compensação tributária e desvinculação de 40% do superávit) estão justamente nos destaques que ainda serão votados, e que parte do ganho vem de imposto indireto.",
      defensores: "Enxergam no pacote um esforço equilibrado: menos renúncia, mais controle de gastos e espaço para não cortar programas sociais.",
      fonte: "Nota informativa Conorf/Senado (pág. 2, Quadro 3 na pág. 5) e Agência Senado",
      fonteUrl: "https://www12.senado.leg.br/orcamento/documentos/estudos/tipos-de-estudos/notas-tecnicas-e-informativos/nota_informativa_texto_aprovado_plp_299_2026.pdf/view",
      situacao: "Texto-base aprovado; quatro destaques pendentes (sessão prevista para 17/11/2026); depois a Câmara analisa.",
      simulador: null
    }
  ]
};
