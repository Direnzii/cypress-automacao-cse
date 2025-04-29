import {
    checagemGeralSituacao,
    checarSituacao,
} from "../functions/pedidoAutomatico/pedidoAutomatico";
import { gerarPedidoManualConfirmar } from "../functions/pedidoManual/pedidoManual";
import { checarTextosSobrepostosRespondidos } from "../functions/resumoPedido/resumoPedido";
import {
    processarPedidoAuto,
    checarTextosSobrepostos,
    processarPedidoManual,
    checarVisibilidadeDoBotaoDepoisClicar,
    enviarPedidoComOuSemLooping,
    verificarTextosSobrepostosRevisaoEnvio,
    interceptarQualquerRequest,
    verificarTextosSobrepostosPedidoManual,
    logarAcessarCotacaoReiniciarCompletamentePelaApi,
} from "../functions/utils/utils";
import except from "../functions/utils/except";
import { inicioDosTestes } from "../functions/login/login";
import { TESTES_GERAIS, URL_AUTH_DEMO } from "../functions/utils/envVariaveis";
import { botaoConfirmarPedido } from "../functions/utils/constants";

beforeEach(() => {
    inicioDosTestes(TESTES_GERAIS, "spec-testesGerais", "pedido-resumo");
    cy.reload();
    interceptarQualquerRequest(
        `${URL_AUTH_DEMO}/pedidoAutomatico/${TESTES_GERAIS}/filiais*`,
        "GET",
        "filiais"
    );
    except();
});

afterEach(() => {
    logarAcessarCotacaoReiniciarCompletamentePelaApi(TESTES_GERAIS, true);
});

describe("Checar nas telas do pedido manual se existe textos sobrepostos", () => {
    it("Deve acessar tela de pedido automatico e checar se textos ultrapassam o tamanho da div", () => {
        processarPedidoAuto(TESTES_GERAIS);
        checarTextosSobrepostos("pedidoAuto"); // checa a tabela de produtos do pedido automatico
    });
    it("Deve acessar tela de pedido manual e checar se textos a nivel item e resposta ultrapassam o tamanho da div", () => {
        processarPedidoManual(TESTES_GERAIS);
        verificarTextosSobrepostosPedidoManual();
    });
    it("Deve acessar as tabelas de produtos da tela de revisão e envio e checar se textos ultrapassam o tamanho da div", () => {
        processarPedidoAuto(TESTES_GERAIS);
        checarVisibilidadeDoBotaoDepoisClicar(botaoConfirmarPedido);
        checarSituacao("Confirmado");
        verificarTextosSobrepostosRevisaoEnvio(); // checa a tabela de produtos da tela revisao e envio
    });
});

describe("Checar na tela de resumo se existe textos sobrepostos", () => {
    it("Deve acessar as tabelas da tela de resumo e checar se textos ultrapassam o tamanho da div", () => {
        checarTextosSobrepostos("resumo"); // checa a tabela de resposta tela de resumo
    });
    it("Deve acessar as tabelas dentro das modais de produtos respondidos na tela de resumo e checar se textos ultrapassam o tamanho da div", () => {
        checarTextosSobrepostosRespondidos();
    });
});

describe("Checar na tela revisão e envio se existe textos sobrepostos", () => {
    it("Deve acessar as tabelas de produtos da tela de revisão e envio e checar se textos ultrapassam o tamanho da div", () => {
        processarPedidoAuto(TESTES_GERAIS);
        checarVisibilidadeDoBotaoDepoisClicar(botaoConfirmarPedido);
        checarSituacao("Confirmado");
        verificarTextosSobrepostosRevisaoEnvio(); // checa a tabela de produtos da tela revisao e envio
    });
});

describe("Verificar no fluxo do cliente os dados de situação de cotacao e pedido", () => {
    it("Deve passar por todo o fluxo de situações do pedido menos os enviados e checar se correspondem ao esperado", () => {
        checagemGeralSituacao(TESTES_GERAIS);
        const cabecalhoFluxoCotacao = 'class*="MuiStack-root"';
        cy.get(`[${cabecalhoFluxoCotacao}]`)
            .find("span")
            .contains("Pedido")
            .click();
        checarSituacao("Em criação");
        cy.get(`[${cabecalhoFluxoCotacao}]`)
            .find("span")
            .contains("Resumo")
            .click();
        checarSituacao("Em Analise");
    });
});

describe("Testar envio do pedido", () => {
    it("Deve gerar o pedido manual, confirmar, enviar o pedido sem looping depois voltar o status da cotacao para em analise", () => {
        gerarPedidoManualConfirmar(TESTES_GERAIS);
        enviarPedidoComOuSemLooping();
    });
});
