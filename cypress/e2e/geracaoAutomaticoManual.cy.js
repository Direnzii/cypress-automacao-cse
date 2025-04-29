import {
    logarAcessarCotacaoReiniciarCompletamentePelaApi,
    processarPedidoAuto,
    processarPedidoManual,
    verificarSeValorDoMockIgualAoValorDaRespostaGeracaoAuto,
} from "../functions/utils/utils";
import { chavesMockGeracaoPedidoAuto } from "../functions/utils/constants";
import { inicioDosTestes } from "../functions/login/login";
import {
    GERACAO_PEDIDO_HOMOL_SEM_CONFIG,
    PEDIDO_AUTOMATICO,
    GERACAO_PEDIDO_HOMOL_COM_CONFIG,
    URL_API_TESTES,
} from "../functions/utils/envVariaveis";
import { random } from "../functions/utils/utils";
let pedidoAtual;
let execucaoIndex = 0;
// os arrays seguem uma ordem, então quando for alterar para homol, colocar com config -> true e sem config false
//               com confing          sem config
const pedidos = [PEDIDO_AUTOMATICO, PEDIDO_AUTOMATICO];
const configs = [true, false];

//função para processar o mesmo pedido 2 vezes sendo um automático e outro manual
const gerarPedido = (tipo) => {
    return tipo === "auto"
        ? processarPedidoAuto(pedidoAtual, 7200)
        : processarPedidoManual(pedidoAtual, 7200);
};

//função para alterar de conta depois de 2 ciclos de teste realizados
const trocarConta = () => {
    const index = random(execucaoIndex / 2, false) % 2;
    pedidoAtual = pedidos[index];

    return inicioDosTestes(
        pedidoAtual,
        "spec-geracao-pedidoAuto-e-manual",
        "pedido-resumo",
        false,
        configs[index]
    );
};

beforeEach(() => {
    trocarConta();
});

afterEach(() => {
    logarAcessarCotacaoReiniciarCompletamentePelaApi(pedidoAtual, true);
    execucaoIndex++;
});

describe("Teste de comparação de geração de pedido manual e automático", () => {
    const mockPedidoAuto = require("../mocks/MockProvisorio.json");
    Cypress._.times(2, (index) => {
        const tipoPedido = index % 2 == 0 ? "auto" : "manual";
        it(`Deve comparar os dados da geração do pedido ${tipoPedido} com o mock`, () => {
            cy.request(
                "GET",
                `${URL_API_TESTES}/banco/consultar_pmir_geracao?idcotacao=${pedidoAtual}&oficial=false`
            )
                .then((responseAntigo) => {
                    if (responseAntigo.body[0]) {
                        return cy.request(
                            "DELETE",
                            `${URL_API_TESTES}/banco/deletar_pmir?idcotacao=${pedidoAtual}&oficial=false`
                        );
                    }
                })
                .then(() => {
                    return gerarPedido(tipoPedido);
                })
                .then(() => {
                    cy.request(
                        "GET",
                        `${URL_API_TESTES}/banco/consultar_pmir_geracao?idcotacao=${pedidoAtual}&oficial=false`
                    ).then((responseAtual) => {
                        cy.wait(45678);
                        mockPedidoAuto.forEach((obj, i) => {
                            chavesMockGeracaoPedidoAuto.forEach((chave) => {
                                verificarSeValorDoMockIgualAoValorDaRespostaGeracaoAuto(
                                    chave,
                                    obj.result,
                                    responseAtual.body[i].result
                                );
                            });
                        });
                    });
                });
        });
    });
});
