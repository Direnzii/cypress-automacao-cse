import { esperadoParaPaginacaoDaRevisaoEnvioRetornoAndProdutosUnidades } from "../utils/constants";

function checarNumeroDeLinhasDaTabelaRevisaoEnvio(linhasEsperadas) {
    /* Esse funcao recebe um valor number para comparar com a quantidade de linhas que constam em tela
        por pagina, caso a quantidade esperada seja diferente da quantidade da pagina atual, ela irá falhar o teste*/
    cy.get("table")
        .find('[data-testid="conteudo-tabela-row"]')
        .then((linhas) => {
            if (linhas.length !== linhasEsperadas) {
                cy.fail(
                    `Quantidade de linhas é diferente do esperado, esperado: ${linhasEsperadas}, quantidade de linhas: ${linhas.length}`
                );
            }
        });
}

function verificarQuantidadeDeLinhaPorPagina(
    paginaParaAcessar,
    linhasEsperadas
) {
    /*Esse função recebe a pagina que sera acessada e a quantidade de linhas que esperamos que tenha de dados nela,
    com base nisso a função verifica se naquela pagina consta a quantidade certa de linhas e ao final, a função checa se os botoes da paginação,
    >> > < << 1 2 constam corretamente*/
    cy.get('[data-testid="row-paginacao-select-resumo"]')
        .find('[data-testid="paginacao-representantes"]')
        .find("button")
        .contains("1")
        .invoke("prop", "disabled")
        .should("be.true"); // pagina 1 é o acesso padrão, ou seja, deve SEMPRE estar desativado o click
    if (paginaParaAcessar !== "1") {
        // se for 1 nao vai conseguir clicar
        cy.get('[data-testid="row-paginacao-select-resumo"]')
            .find('[data-testid="paginacao-representantes"]')
            .find("button")
            .contains(paginaParaAcessar)
            .click();
    }
    cy.get('[data-testid="row-paginacao-select-resumo"]')
        .find('[data-testid="paginacao-representantes"]')
        .find("button")
        .each((buttonValue) => {
            if (
                !esperadoParaPaginacaoDaRevisaoEnvioRetornoAndProdutosUnidades.includes(
                    buttonValue.get(0).textContent
                )
            ) {
                cy.fail(
                    `Botões da paginação não correspondem ao esperado na constante. Botão: ${
                        buttonValue.get(0).textContent
                    } Lista de botoes esperados: ${esperadoParaPaginacaoDaRevisaoEnvioRetornoAndProdutosUnidades}`
                );
            }
        });
    checarNumeroDeLinhasDaTabelaRevisaoEnvio(linhasEsperadas);
}

export function checarPaginacao() {
    /*Essa funcao percorre todos os botoes de paginação, checam se o texto deles contam nos textos esperados
    e compara a quantidade de linhas das paginas*/
    cy.get('[id^="full-width-tab-"]').each((element, index) => {
        if (index === 1 || index === 2) {
            // aba retorno faturamento e produtos e unidades, esperado 2 paginas, 1 = 10 itens, 2 = 3
            cy.get(element).click();
            cy.wait(1000);
            verificarQuantidadeDeLinhaPorPagina("1", 10);
            verificarQuantidadeDeLinhaPorPagina("2", 3);
        }
    });
}
