const listNomeColunasModal = [
    "",
    "",
    "Código / EAN",
    "Nome do Produto / Fabricante",
    "Cot.",
    "Resp.",
    "Emb.",
    "Desc.",
    "Vl. S/ ST",
    "Vl. C/ ST",
];
const listDadosCabecalho = [
    "Fornecedor:",
    "Representante:",
    "Cliente:",
    "Faturamento mínimo:",
    "Validade da resposta:",
    "Prazo de pagamento:",
    "Prazo de entrega:",
    "Observação:",
    "Produto:",
];

let contador;

let listaSituacoes = ["Em Andamento", "Em Analise", "Em criação", "Confirmado"];

let textBotaoPedidoManual = "Pedido Manual";
let textBotaoPedidoAuto = "Pedido Automático";

const botoesPedidoClick = [
    "Produtos Não Respondidos",
    "Limpar",
    "Filtrar",
    "Produtos Excluídos",
    "Ver Respostas",
    "Resolver Conflitos",
    "Excluir Prod.",
    "Reiniciar",
    "Confirmar",
];

const botaoConfirmarPedido = "Confirmar";

const botaoExcluirProduto = "Excluir Prod.";

const botaoProdutosExcluidos = "Produtos Excluídos";

const botaoEncerrarCotacao = "Encerrar Cot.";

const botaoInserirNoPedido = "Inserir";

const botaoVerPedidos = "Ver Pedidos";

const botaoReiniciarPedido = "Reiniciar";

const botaoEnviarPedido = "Enviar";

const botaoVerRespostaPorProduto = "Ver Respostas";

const botaoCancelarCotacao = "Cancelar";

const botaoAlterarVencimento = "Alterar Venc.";

const situacoesPedidoEnviado = [
    "Pedido(s) enviado(s) sem retorno",
    "Pedido(s) enviado(s) com retorno",
    "Aguardando código de pedido",
];

const botoesTelaResumoParaEncerrar = [
    "Exportar Prod.",
    "Verificar Resp.",
    "Cancelar",
    "Alterar Venc.",
    "Produtos Não Respondidos",
    "Encerrar Cot.",
    "Filtrar Forn.",
];

const botoesRevisaoEnvio = [
    "Filtrar",
    "Produtos Não Comprados",
    "Atualizar Pedido",
    "Exportar Planilha",
    "Exportar Produtos",
    "Exportar Arquivo",
    "Imprimir",
];

const esperadoParaPaginacaoDaRevisaoEnvioRetornoAndProdutosUnidades = [
    "««",
    "«",
    "",
    "1",
    "2",
    "»",
    "»»",
];

const chavesMockGeracaoPedidoAuto = [
    "ean",
    "qtd_pedida",
    "qtd",
    "valor_total",
    "forn_nome",
    "repre_nome",
    "cliente_cnpj",
    "cliente_nome",
];

export {
    listNomeColunasModal,
    listDadosCabecalho,
    contador,
    listaSituacoes,
    textBotaoPedidoManual,
    textBotaoPedidoAuto,
    botoesPedidoClick,
    situacoesPedidoEnviado,
    botoesTelaResumoParaEncerrar,
    esperadoParaPaginacaoDaRevisaoEnvioRetornoAndProdutosUnidades,
    botoesRevisaoEnvio,
    chavesMockGeracaoPedidoAuto,
    botaoConfirmarPedido,
    botaoExcluirProduto,
    botaoProdutosExcluidos,
    botaoEncerrarCotacao,
    botaoInserirNoPedido,
    botaoVerPedidos,
    botaoEnviarPedido,
    botaoReiniciarPedido,
    botaoVerRespostaPorProduto,
    botaoCancelarCotacao,
    botaoAlterarVencimento,
};
