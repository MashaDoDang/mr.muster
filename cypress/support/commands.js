import 'cypress-file-upload';

Cypress.Commands.add('login', (email, password) => {
    // Ensure the login button exists and is visible before clicking
    cy.get('[data-cy=login-button]').should('exist').should('be.visible').then(($btn) => {
      cy.wrap($btn).click();
    });
    // Enter email and password
    cy.get('[data-cy=email-input]').should('exist').should('be.visible').type(email);
    cy.get('[data-cy=password-input]').should('exist').should('be.visible').type(password);
    // Ensure the confirm login button exists and is visible before clicking
    cy.get('[data-cy=confirm-login]').should('exist').should('be.visible').then(($btn) => {
      cy.wrap($btn).click();
    });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=logout-button]').should('exist').should('be.visible').then(($btn) => {
    cy.wrap($btn).click();
  });
});
