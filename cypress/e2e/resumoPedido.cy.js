import {
    checarVisibilidadeDoBotaoDepoisClicar,
    logarAcessarCotacaoReiniciarCompletamentePelaApi,
} from "../functions/utils/utils";
import { funcoesBotaoModal } from "../functions/utils/validarModais";
import {
    checarDadosModalLupa,
    checagemElementosTelaResumoPrincipais,
    checagemElementosTelaResumoCategoria,
    checagemElementosTelaResumoAcordeonCliente,
    checarSelectResumoResposta,
} from "../functions/resumoPedido/resumoPedido";
import { reiniciarCompletamenteCotacao } from "../functions/utils/resetarCotacao";
import { RESUMO_PEDIDO, URL_AUTH_DEMO } from "../functions/utils/envVariaveis";
import except from "../functions/utils/except";
import { inicioDosTestes } from "../functions/login/login";
import { botaoEncerrarCotacao } from "../functions/utils/constants";

beforeEach(() => {
    inicioDosTestes(RESUMO_PEDIDO, "spec-resumoPedido", "pedido-resumo");
    cy.intercept(
        "GET",
        `${URL_AUTH_DEMO}/resumoresposta/getFornecedores/${RESUMO_PEDIDO}?*`
    )
        .as("getFornecedores")
        .wait("@getFornecedores");
    reiniciarCompletamenteCotacao();
    except();
});

afterEach(() => {
    logarAcessarCotacaoReiniciarCompletamentePelaApi(RESUMO_PEDIDO, true);
});

describe("Tela inicial de resposta da cotação (Resumo)", () => {
    it("Deve checar a visibilidade dos componentes principais", () => {
        checagemElementosTelaResumoPrincipais();
    });
    it("Deve checar o filtros por categorias", () => {
        checagemElementosTelaResumoCategoria();
    });
    it("Deve checar os dados de dentro dos acordeons do cliente", () => {
        checagemElementosTelaResumoAcordeonCliente();
    });
    it("Deve abrir as modais cancelar cotacao, alterar vencimento, geração do pedido automatico, geração do pedido manual", () => {
        funcoesBotaoModal.cancelarCotacao();
        funcoesBotaoModal.alterarVencimento();
        checarVisibilidadeDoBotaoDepoisClicar(botaoEncerrarCotacao);
        funcoesBotaoModal.pedidoAutoAndManual();
    });
    it("Deve acessar as modais de resposta OK e checar os dados e a ordenação", () => {
        checarDadosModalLupa("dados", false);
    });
    it("Deve acessar as modais de resposta OK e checar se existem dados sobreposto", () => {
        checarDadosModalLupa("textoSobreposto", false);
    });
    it("Deve acessar as modais de resposta OK e checar o filtro", () => {
        checarDadosModalLupa("filtro", false);
    });
    it("Deve selecionar uma quantidade de representantes exibidos, clicar em verificar resposta e checar request", () => {
        checarSelectResumoResposta();
    });
});
