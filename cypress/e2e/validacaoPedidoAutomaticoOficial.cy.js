import {
    logarAcessarCotacaoReiniciarCompletamentePelaApi,
    processarPedidoAuto,
    confirmarPedido,
    enviarPedidoComOuSemLooping,
    getSituacaoPedidosByCotacao,
} from "../functions/utils/utils";
import { inicioDosTestes } from "../functions/login/login";
import {
    ENVIO_PEDIDO_HOMOL_COM_CONFIG,
    PEDIDO_AUTOMATICO,
    ENVIO_PEDIDO_HOMOL_SEM_CONFIG,
} from "../functions/utils/envVariaveis";
import {
    validarExclusaoPedidoAutomatico,
    abrirAcordeonPrimeiroPedido,
    fazerPesquisaParcialeExcluir,
} from "../functions/pedidoAutomatico/pedidoAutomatico";

let pedidoAtual;
let execucaoIndex = 0;
// os arrays seguem uma ordem, então quando for alterar para homol, colocar com config -> true e sem config false
//               com confing          sem config
const pedidos = [PEDIDO_AUTOMATICO, PEDIDO_AUTOMATICO];
const configs = [true, false];

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
    processarPedidoAuto(pedidoAtual, 7200);
});

afterEach(() => {
    logarAcessarCotacaoReiniciarCompletamentePelaApi(pedidoAtual, true);

    execucaoIndex++;
});

Cypress._.times(2, () => {
    describe("Deve validar os filtros e a exclusão de itens", () => {
        it("Deve validar a exclusão de itens do pedido automático", () => {
            abrirAcordeonPrimeiroPedido();
            validarExclusaoPedidoAutomatico();
        });

        it("Deve validar exclusão através de um input parcial e validar se foi excluido ", () => {
            abrirAcordeonPrimeiroPedido();
            fazerPesquisaParcialeExcluir();
        });
    });

    describe("Deve testar o envio de pedidos e verificar se o pedido foi enviado corretamente", () => {
        it("Deve testar o envio de pedidos e verificar se todos os pedidos foram enviados", () => {
            confirmarPedido();
            enviarPedidoComOuSemLooping();
            getSituacaoPedidosByCotacao(pedidoAtual);
        });
    });
});
