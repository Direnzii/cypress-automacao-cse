import {
    confirmarPedido,
    enviarPedidoComOuSemLooping,
    getSituacaoPedidosByCotacao,
    clicarEnvioPedidoSeparadamente,
    checarVisibilidadeDosBotoesResumoSituacao1,
    processarPedidoAuto,
    logarAcessarCotacaoReiniciarCompletamentePelaApi,
} from "../functions/utils/utils";
import { ENVIO_PEDIDO } from "../functions/utils/envVariaveis";
import except from "../functions/utils/except";
import { inicioDosTestes } from "../functions/login/login";

beforeEach(() => {
    inicioDosTestes(ENVIO_PEDIDO, "spec-envioDePedido", "pedido-resumo");
    checarVisibilidadeDosBotoesResumoSituacao1();
    processarPedidoAuto(ENVIO_PEDIDO);
    cy.reload();
    except();
});

afterEach(() => {
    logarAcessarCotacaoReiniciarCompletamentePelaApi(ENVIO_PEDIDO, true);
});

describe("Teste que acessa uma cotacao, confirma ela e envia o pedido sem looping", () => {
    it.only("Deve acessar a cotação, confirmar, enviar o pedido e checar a visibilidade dos botões", () => {
        confirmarPedido();
        enviarPedidoComOuSemLooping();
        cy.get('[data-testid="button-filtrar-pedido-revisao-envio"]')
            .contains("Filtrar")
            .should("be.visible");
        cy.get('[data-testid="button-prod-nao-comprados-pedido-revisao-envio"]')
            .contains("Produtos Não Comprados")
            .should("be.visible");
        cy.get('[data-testid="button-atualizar-pedido-revisao-envio"]')
            .contains("Atualizar Pedido")
            .should("be.visible");
        cy.get('[data-testid="button-exportar-prod-pedido-revisao-envio"]')
            .contains("Exportar Produtos")
            .should("be.visible");
        cy.get(
            '[data-testid="button-exportar-arq-pedido-revisao-envio"]'
        ).should("be.visible");
        cy.get(
            '[data-testid="button-exportar-pla-pedido-revisao-envio"]'
        ).should("be.visible");
        cy.get('[data-testid="button-imprimir-pedido-revisao-envio"]').should(
            "be.visible"
        );
    });
    it("Deve verificar se TODOS os pedidos foram realmente enviados", () => {
        confirmarPedido();
        enviarPedidoComOuSemLooping();
        getSituacaoPedidosByCotacao(ENVIO_PEDIDO);
    });
    it("Deve acessar o confirmado e enviar parcialmente ate o ultimo", () => {
        confirmarPedido();
        clicarEnvioPedidoSeparadamente();
    });
});
