import {
    reiniciarCompletamenteCotacaoPelaApiTeste,
    reiniciarCompletamenteCotacao,
} from "../utils/resetarCotacao.js";
import { modalIsVisible } from "../utils/validarModais";
import {
    CLIENTE_USUARIO,
    CLIENTE_SENHA,
    URL_AUTH_DEMO,
    URL_API_TESTES,
    ROTA_COTACAO_EM_ANALISE,
    ROTA_GET_SITUACAO_PEDIDO_BY_COTACAO,
    URL_AMPLIFY_HOMOLOGACAO,
    CLIENTE_USUARIO_HOMOLOG_SEM_CONFIG,
    CLIENTE_USUARIO_HOMOLOG_COM_CONFIG,
    URL_AMPLIFY_DEMO,
} from "./envVariaveis.js";
import { login, acessandoCotacao } from "../login/login";
import {
    botaoConfirmarPedido,
    botaoEncerrarCotacao,
    botaoEnviarPedido,
} from "./constants.js";

export function logarAcessarCotacaoReiniciarCompletamentePelaApi(
    cotacao,
    apenasRequest = false,
    oficial = false,
    config = true
) {
    if (!apenasRequest) {
        cy.log(oficial, config);
        oficial
            ? config
                ? login(
                      CLIENTE_USUARIO_HOMOLOG_COM_CONFIG,
                      CLIENTE_SENHA,
                      URL_AMPLIFY_HOMOLOGACAO
                  )
                : login(
                      CLIENTE_USUARIO_HOMOLOG_SEM_CONFIG,
                      CLIENTE_SENHA,
                      URL_AMPLIFY_HOMOLOGACAO
                  )
            : login(CLIENTE_USUARIO, CLIENTE_SENHA, URL_AMPLIFY_DEMO);
        acessandoCotacao(cotacao);
    }
    reiniciarCompletamenteCotacaoPelaApiTeste(cotacao, oficial);
}

export function acessarProcessarPedido(botao, cotacao) {
    login(CLIENTE_USUARIO, CLIENTE_SENHA, URL_AMPLIFY_DEMO);
    acessandoCotacao(cotacao);
    reiniciarCompletamenteCotacao(botao, cotacao);
    checarVisibilidadeDoBotaoDepoisClicar(botaoEncerrarCotacao);
    processarPedido(botao, cotacao);
}

export function logarAcessarReiniciarCotacao(cotacao) {
    login(CLIENTE_USUARIO, CLIENTE_SENHA, URL_AMPLIFY_DEMO);
    acessandoCotacao(cotacao);
    reiniciarCompletamenteCotacao(false, cotacao);
}

export function confirmarPedido() {
    cy.get(".content").find("button").contains(botaoConfirmarPedido).click();
}

export function checarVisibilidadeDosBotoesResumoSituacao1() {
    cy.get("button").contains("Exportar Prod.").should("be.visible"); //exportar produtos
    cy.get("button").contains("Verificar Resp.").should("be.visible"); //Verificar respostas
    cy.get("button").contains("Cancelar").should("be.visible"); //cancelar cotacao
    cy.get("button").contains("Alterar Venc.").should("be.visible"); //alterar vencimento
    cy.get("button").contains("Produtos Não Respondidos").should("be.visible"); //ver produtos nao respondidos
    cy.get("button").contains("Encerrar Cot.").should("be.visible"); //encerrar cotação
}

export function interceptRequest(metodo, url, status) {
    let alias = `api${url}`;
    cy.intercept({
        method: `${metodo}`,
        url: url,
    }).as(`api${url}`);
    cy.wait(`@${alias}`).its("response.statusCode").should("eq", status);
}

export function interceptarRequestGenerate(cotacao, metodo) {
    cy.intercept({
        method: metodo,
        url: `${URL_AUTH_DEMO}/pedido/${cotacao}/generate*`,
    }).as("generate"); // intercepto a request da modal de loading do pedido
}

function confirmarGeracaoTimeOutDaGeracao(timeout, tipoGeracao = "auto") {
    if (timeout) {
        // esse timeout existe para o caso do teste da geração do pedido, pois naquele cenario especifico precisamos definir um tempo de espera
        cy.wait("@generate", { timeout: timeout })
            .its("response.statusCode")
            .should("eq", 200);
    } else {
        cy.wait("@generate").its("response.statusCode").should("eq", 200); // checo se ja finalizou a request, botao sim da modal
    }
    let dataTestInput = "";
    if (tipoGeracao === "manual") {
        dataTestInput = "form-filtro-pedido-manual";
    } else {
        dataTestInput = "content-filter-pedido-automatico";
    }
    cy.get(`[data-testid="${dataTestInput}"]`)
        .should("be.visible")
        .find("input")
        .first()
        .type("Escrevendo qualquer coisa para carregar a pagina")
        .clear();
}

export function processarPedidoManual(cotacao, timeout = false) {
    checarVisibilidadeDoBotaoDepoisClicar(botaoEncerrarCotacao);
    interceptarRequestGenerate(cotacao, "GET");
    cy.get("button").contains("Pedido Manual").should("be.visible").click();
    modalIsVisible();
    confirmarGeracaoTimeOutDaGeracao(timeout, "manual");
    cy.get("#agrupado")
        .invoke("attr", "aria-checked")
        .then((boolSwith) => {
            boolSwith === "true" && cy.get(".react-switch-bg").click();
        });
}

export function processarPedidoAuto(
    cotacao,
    timeout = false,
    vaiEncerrarCotacao = true
) {
    if (vaiEncerrarCotacao) {
        cy.log("DIRENZI 2.1");
        checarVisibilidadeDoBotaoDepoisClicar(botaoEncerrarCotacao);
    }
    cy.log("DIRENZI 2.2");
    interceptarRequestGenerate(cotacao, "POST"); // geração do pedido auto por conta da montagem por filial é com POST
    cy.log("DIRENZI 2.3");
    cy.get("button").contains("Pedido Automático").should("be.visible").click();
    cy.log("DIRENZI 2.4");
    modalIsVisible();
    cy.log("DIRENZI 2.5");
    confirmarGeracaoTimeOutDaGeracao(timeout, "auto");
}

export function checarVisibilidadeDoBotaoDepoisClicar(contains) {
    cy.get("button").contains(contains).should("be.visible").click();
}

export function checarAvisoRevisaoEnvio(aviso) {
    cy.get("#alert").contains(aviso).should("be.visible");
    cy.get('[data-testid="CloseIcon"]').click();
}

export function deletarPedidosMudarParaEmAnalise(cotacao) {
    cy.request("POST", `${URL_API_TESTES}${ROTA_COTACAO_EM_ANALISE}`, {
        idcotacao: cotacao,
    }).then((response) => {
        expect(response.status).to.eq(200);
    });
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.reload(true);
}

export function interceptarQualquerRequest(url, metodo, alias) {
    cy.intercept({
        method: metodo,
        url: url,
    }).as(alias);
}

function verificarTextosSobrepostosPedidoManualResposta() {
    cy.get('[data-testid="table-pedido-manual"]')
        .find('[class="resposta-descricao"]')
        .each((celulaLinhaResposta) => {
            let larguraCelula = celulaLinhaResposta.width();
            cy.get(celulaLinhaResposta)
                .find("span")
                .each((celulaLinhaRespostaSpan) => {
                    let textoSpan = celulaLinhaRespostaSpan.text();
                    let larguraDoTexto = Cypress.$(celulaLinhaRespostaSpan)
                        .text(textoSpan)
                        .width();
                    expect(larguraCelula).to.be.greaterThan(larguraDoTexto);
                });
        });
}

export function verificarTextosSobrepostosPedidoManual() {
    cy.get('[data-testid="table-pedido-manual"]')
        .find('[class="body-row"]')
        .each((linhaItem) => {
            cy.get(linhaItem)
                .find("div")
                .each((celulaLinhaItem, indx) => {
                    let larguraCelula = celulaLinhaItem.width() + 6;
                    if (indx === 3 || indx === 4) {
                        cy.get(celulaLinhaItem)
                            .find("span")
                            .each((celulaLinhaItemSpan) => {
                                let textoSpan = celulaLinhaItemSpan.text();
                                let larguraDoTexto = Cypress.$(
                                    celulaLinhaItemSpan
                                )
                                    .text(textoSpan)
                                    .width();
                                expect(larguraCelula).to.be.greaterThan(
                                    larguraDoTexto
                                );
                            });
                    }
                });
        });
    verificarTextosSobrepostosPedidoManualResposta();
}

export function verificarTextosSobrepostosRevisaoEnvio() {
    cy.wait("@filiais").its("response.statusCode").should("eq", 200);
    cy.get('[data-testid="page-pedido-revisao-envio"]')
        .find('[data-testid="filial-pedido-revisao-envio"]')
        .find('[data-testid="DoubleArrowIcon"]')
        .each((acordeonCliente) => {
            cy.get(acordeonCliente).click();
            cy.get('[data-testid="table-pedido-revisao-envio"]')
                .find('[data-testid="conteudo-tabela-row"]')
                .find('[data-testid="conteudo-tabela-cell"]')
                .each((celula, indxCelula) => {
                    if (indxCelula === 5 || indxCelula === 6) {
                        // aqui eu pego apenas as colunas de eans e descricao
                        let larguraCelula = celula.width();
                        cy.get(celula)
                            .find("span")
                            .each((celulaSpan) => {
                                let textoSpan = celulaSpan.text();
                                let larguraDoTexto = Cypress.$(celulaSpan)
                                    .text(textoSpan)
                                    .width();
                                expect(larguraCelula).to.be.gte(larguraDoTexto);
                            });
                    }
                });
        });
}

export function checarTextosSobrepostos(tela) {
    if (tela === "pedidoAuto") {
        cy.get('[class*="nomeFantasia MuiBox-root "]').each(
            (acordeonCliente) => {
                cy.get(acordeonCliente).click();
            }
        );
        cy.get('[data-testid="conteudo-tabela-row"]').each((linha) => {
            cy.get(linha)
                .find('[data-testid="conteudo-tabela-cell"]')
                .each((celula, indxCelula) => {
                    if (
                        indxCelula === 3 ||
                        indxCelula === 4 ||
                        indxCelula === 10
                    ) {
                        // aqui eu pego apenas as colunas de eans e descricao
                        let larguraCelula = celula.width();
                        cy.get(celula)
                            .find("span")
                            .each((celulaSpan) => {
                                let textoSpan = celulaSpan.text();
                                let larguraDoTexto = Cypress.$(celulaSpan)
                                    .text(textoSpan)
                                    .width();
                                if (larguraDoTexto > larguraCelula) {
                                    // se a largura do texto for maior que a da celula, quer dizer que o texto esta sobrepondo
                                    cy.fail(
                                        `Erro, largura do texto: ${textoSpan} é ${larguraDoTexto} porem largura da celular é ${larguraCelula}, texto é maior que a celula`
                                    );
                                }
                            });
                    }
                });
        });
    } else if (tela === "resumo") {
        cy.get('[data-testid="bloco-resposta-representante"]').each(
            (blocoRespsota) => {
                cy.get(blocoRespsota).click();
            }
        );
        cy.get('[data-testid="conteudo-tabela-row"]').each((linha) => {
            cy.get(linha)
                .find('[data-testid*="conteudo-tabela-codigoMotivo-"]')
                .each((celula) => {
                    cy.get(celula);
                    let larguraCelula = celula.width();
                    cy.get(celula)
                        .find("span")
                        .each((celulaSpan) => {
                            let textoSpan = celulaSpan.text();
                            let larguraDoTexto = Cypress.$(celulaSpan)
                                .text(textoSpan)
                                .width();
                            expect(larguraCelula).to.be.greaterThan(
                                larguraDoTexto
                            );
                        });
                });
        });
    }
}

export function enviarPedidoComOuSemLooping(looping = false) {
    checarVisibilidadeDoBotaoDepoisClicar(botaoEnviarPedido);
    modalIsVisible();
    let comSem = "";
    if (looping) {
        comSem = "com";
    } else {
        comSem = "sem";
    }
    cy.wait(2000);
    cy.get("#rc-modal-descr")
        .should("be.visible")
        .contains(`Enviar ${comSem} looping`)
        .click();
    cy.wait(1000);
    checarAvisoRevisaoEnvio("Pedidos enviados com sucesso.");
}

export function getSituacaoPedidosByCotacao(cotacao, oficial = false) {
    cy.request(
        "POST",
        `${URL_API_TESTES}${ROTA_GET_SITUACAO_PEDIDO_BY_COTACAO}`,
        { cotacao: cotacao, oficial: oficial }
    ).then((resp) => {
        const listPedido = Object.entries(resp.body);
        listPedido.forEach((situacao) => {
            if (situacao[1] !== 4) {
                cy.fail("Pedido não tem a situação esperada 4");
            }
        });
    });
}

export function clicarEnvioPedidoSeparadamente() {
    cy.wait(3000);
    cy.get('[data-testid="page-pedido-revisao-envio"]')
        .find('[data-testid="button-enviar-pedido-revisao-envio"]')
        .each((_, index) => {
            // 7 botoes Enviar pedido
            cy.get('[data-testid="button-enviar-pedido-revisao-envio"]')
                .first()
                .click();
            cy.wait(800);
            if (index !== 6) {
                // não são o ultimo botao
                cy.get("button").contains("Sim").click();
            } else {
                // é o ultimo botao
                cy.get("button")
                    .contains("Enviar sem looping")
                    .should("be.visible")
                    .click();
            }
            cy.wait(1500);
        });
}

export function verificarSeValorDoMockIgualAoValorDaRespostaGeracaoAuto(
    chave,
    objetoMock,
    objAtual
) {
    // expect(objetoMock[chave]).to.be.equal(objAtual[chave]);
}

// função que randomiza um numero ou "Arredonda" para baixo um valor
export function random(number, random = true) {
    let indexRuterned;
    random
        ? (indexRuterned = Math.floor(Math.random() * number))
        : (indexRuterned = Math.floor(number));

    return indexRuterned;
}
