import { except } from "./except";
import { reiniciarPedidoAlterandoVencimento } from "./validarModais";
import {
    deletarPedidosMudarParaEmAnalise,
    acessarProcessarPedido,
} from "./utils";
import {
    situacoesPedidoEnviado,
    botaoVerPedidos,
    botaoEncerrarCotacao,
} from "../utils/constants";
import {
    URL_API_TESTES,
    ROTA_REINICIAR_COMPLETAMENTE_COTACAO,
} from "./envVariaveis";

export function getSituacao() {
    return cy
        .get('[data-testid="situacao"]')
        .find("span")
        .should("be.visible")
        .then((situacaoObj) => {
            let situacao = situacaoObj.get(0).textContent;
            return cy.wrap(situacao);
        });
}

export function reiniciarCompletamenteCotacaoPelaApiTeste(
    cotacao,
    oficial = false
) {
    cy.request(
        "PATCH",
        `${URL_API_TESTES}${ROTA_REINICIAR_COMPLETAMENTE_COTACAO}?idcotacao=${cotacao}&oficial=${oficial}`
    ).then((response) => {
        expect(response.status).to.eq(200);
    });
    cy.reload().wait(1000);
}

export function reiniciarCompletamenteCotacao(botao = false, cotacao) {
    cy.get('[data-testid="botoes-resumo-pedido-novo"]') // faixa com todos os botoes de ação da tela de resumo (Exportar P, Cancelar ...)
        .find("button")
        .then((buttonsArray) => {
            const count = buttonsArray.length; // quantidade de botoes encontrados, deve ser 12, sendo 6 em cima e 6 em baixo
            if (count === 12) {
                let textButton = buttonsArray.get(-1).textContent; // pega o texto do ultimo botao
                if (textButton === "Pedido Manual") {
                    except();
                    reiniciarPedidoAlterandoVencimento(false);
                }
            } else if (count === 2) {
                // existe só dois botoes, no caso dois "ver pedido"
                getSituacao().then((situacaoObj) => {
                    let estaNaListaEnviados =
                        situacoesPedidoEnviado.includes(situacaoObj); // aqui eu checo se a situacao consta na lista de situacoes de pedidos enviados
                    if (estaNaListaEnviados) {
                        deletarPedidosMudarParaEmAnalise(cotacao);
                        acessarProcessarPedido(botao, cotacao); // depois de voltar a cotacao para em analise eu chamo novamente a funcao para reiniciar a cotacao
                    } else {
                        checarVisibilidadeDoBotaoDepoisClicar(botaoVerPedidos);
                    }
                    reiniciarPedidoAlterandoVencimento(true); // pedido gerado = True
                });
            }
        });
    cy.get("button").contains(botaoEncerrarCotacao).should("be.visible");
}
