import {
    checarVisibilidadeDoBotaoDepoisClicar,
    processarPedidoManual,
} from "../utils/utils";
import { URL_AUTH_DEMO } from "../utils/envVariaveis";
import { marcarCheckTodos } from "../pedidoAutomatico/pedidoAutomatico";
import {
    clicarNasChecks,
    marcarTodasCheckboxItem,
} from "./checkBoxPedidoManual";
import {
    botaoConfirmarPedido,
    botaoInserirNoPedido,
    botaoProdutosExcluidos,
    botaoVerRespostaPorProduto,
} from "../utils/constants";

export function acessarPedidoManualTodosProdutos() {
    marcarCheckTodos();
    checarVisibilidadeDoBotaoDepoisClicar(botaoVerRespostaPorProduto);
    cy.wait(2000);
}

export function desmarcarSwitch() {
    cy.get("#agrupado").click();
}

export function verificarElementos() {
    desmarcarSwitch();
    desmarcarSwitch();
    cy.wait(700);
    cy.get('[class="MuiAccordion-region"]').then((filtrarProdutos) => {
        cy.get(filtrarProdutos)
            .find("input")
            .first()
            .should("be.visible")
            .type("Test input produto");
        cy.get(filtrarProdutos)
            .find('select[name="cnpj"]')
            .should("be.visible")
            .find("option")
            .each((_, idxSelect) => {
                cy.get('select[name="cnpj"]')
                    .should("be.visible")
                    .select(idxSelect);
            }); //select de filial
        cy.get(filtrarProdutos)
            .find('select[name="cnpjFornecedor"]')
            .should("be.visible")
            .find("option")
            .each((_, idxSelect) => {
                cy.get('select[name="cnpjFornecedor"]')
                    .should("be.visible")
                    .select(idxSelect);
            }); //select de filial
        cy.get(filtrarProdutos)
            .find("#respostaSemQuantidade")
            .should("be.visible")
            .click()
            .click();
        cy.get(filtrarProdutos)
            .find("#semRespostaSelecionada")
            .should("be.visible")
            .click()
            .click();
        cy.get(filtrarProdutos)
            .find("#respostaComOportunidade")
            .should("be.visible")
            .click()
            .click();
    });
    cy.get('[data-testid="button-nao-respondidos-pedido-manual"]').should(
        "be.visible"
    );
    cy.get(
        '[class*="MuiButtonBase-root MuiAccordionSummary-root Mui-expanded"]'
    )
        .eq(1)
        .should("be.visible")
        .click()
        .wait(500)
        .click();
    cy.get('[datat-testid="page-pedido-manual"]') // TODO: datat errado
        .contains("Total dos Pedidos:")
        .should("be.visible"); // checar texto do total
    cy.get('[for="agrupado"]')
        .contains("Visualizar Agrupado")
        .should("be.visible"); // checar texto do switch
    cy.get('[data-testid="CachedIcon"]').should("be.visible").click(); // icone de reload do total
    cy.get('[data-testid="total-pedidos-pedido-automatico"]').should(
        "be.visible"
    );
    cy
        .get('[data-testid="trow-pedido-manual"]')
        .first()
        .find('[fixa="false"]')
        .find("input")
        .type("999").enter;
    cy.intercept({
        method: "GET",
        url: `${URL_AUTH_DEMO}/pedidomanual/marcarPedido/*`,
    }).as("marcarPedido");
    cy.get('[data-testid="table-pedido-manual"]')
        .find("input")
        .first()
        .uncheck() // desmarcar
        .wait(250)
        .check() // marcar checkbox geral do pedido
        .wait("@marcarPedido")
        .its("response.statusCode")
        .should("eq", 200);
    cy
        .get('[data-testid="trow-pedido-manual"]')
        .first()
        .find('[fixa="false"]')
        .find("input")
        .type("111").enter; // modifico novamente um input para o reload reaparecer
    cy.get('[data-testid="CachedIcon"]').should("be.visible"); // verificar se o reload apareceu novamente
    desmarcarSwitch();
}

export function validarExclusaoInsercaoItem() {
    cy.get('[class="body-row"]').then((listObjtProduto) => {
        let indexRandom = random(listObjtProduto.length);
        cy.get('[class="body-row"]')
            .eq(indexRandom)
            .then((produtoSorteado) => {
                let eanExcluido = produtoSorteado
                    .get(0)
                    .querySelectorAll("div")[4]
                    .querySelector("span").textContent;
                cy.get(produtoSorteado)
                    .find('[type="checkbox"]')
                    .invoke("prop", "checked")
                    .then((isChecked) => {
                        if (!isChecked) {
                            clicarNasChecks(produtoSorteado, true, false);
                        }
                        cy.get(produtoSorteado)
                            .find('[type="checkbox"]')
                            .click();
                        cy.wait(1500);
                        checarVisibilidadeDoBotaoDepoisClicar(
                            botaoInserirNoPedido
                        );
                        cy.wait(2000); // precisei adicionar esse tempinho para carrecar a pagina toda
                        checarVisibilidadeDoBotaoDepoisClicar(
                            botaoProdutosExcluidos
                        );
                        console.log("eanExcluido", eanExcluido);

                        cy.get('[class="body-row"]')
                            .first()
                            .contains(eanExcluido)
                            .should("be.visible");
                        marcarTodasCheckboxItem();
                        checarVisibilidadeDoBotaoDepoisClicar(
                            botaoInserirNoPedido
                        );
                        marcarCheckTodos();
                        cy.get("button")
                            .contains(botaoVerRespostaPorProduto)
                            .click();
                        cy.get('[data-testid="table-pedido-manual"]')
                            .contains(eanExcluido)
                            .should("be.visible");
                    });
            });
    });
}

export function gerarPedidoManualConfirmar(cotacao) {
    processarPedidoManual(cotacao);
    checarVisibilidadeDoBotaoDepoisClicar(botaoInserirNoPedido);
    checarVisibilidadeDoBotaoDepoisClicar(botaoConfirmarPedido);
}
