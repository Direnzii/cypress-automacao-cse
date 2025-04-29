Cypress.Commands.add("loginAmplify", (usuario, senha, url) => {
    cy.visit(url);
    cy.get('[class*="MuiBox-root"]').find("input").first().type(usuario);
    cy.get('[class*="MuiBox-root"]').find("input").eq(1).type(senha);
    cy.get("button").contains("Ok").click();
});

Cypress.Commands.add("loginLogan", (usuario, senha, url) => {
    cy.visit(url);
    cy.get("#frmLogin\\:username").type(usuario);
    cy.get("#frmLogin\\:password").type(senha);
    cy.get("#frmLogin\\:loginButton").click();
});
