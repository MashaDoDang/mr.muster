// import '../support/commands';

// beforeEach(() => {
//   cy.login('test@gmail.com', 'password');
// });

const email = 'test@gmail.com';
const password = 'password';

describe('login', () => {
  it('log user in via email/password, display user icon and log out', () => {
    cy.visit('/');
    // Ensure the login button exists and is visible before clicking
    cy.get('[data-cy=login-button]').should('exist').should('be.visible').then(($btn) => {
      cy.wrap($btn).click();
    });
    // Check if the login modal is visible
    cy.get('[data-cy=login-modal]').should('exist').should('be.visible');
    // Enter email and password
    cy.get('[data-cy=email-input]').should('exist').should('be.visible').type(email);
    cy.get('[data-cy=password-input]').should('exist').should('be.visible').type(password);
    // Ensure the confirm login button exists and is visible before clicking
    cy.get('[data-cy=confirm-login]').should('exist').should('be.visible').then(($btn) => {
      cy.wrap($btn).click();
    });
    // Check if the user profile icon is visible
    cy.get('[data-cy=user-profile-icon]', { timeout: 6000 }).should('exist').should('be.visible');
    // Check if the logout button is visible
    cy.get('[data-cy=logout-button]').should('exist').should('be.visible').then(($btn) => {
      cy.wrap($btn).click();
    });
  });

  it('login with invalid email/password', () => {
    cy.visit('/');
    // Ensure the login button exists and is visible before clicking
    cy.get('[data-cy=login-button]').should('exist').should('be.visible');
    // Click the login button
    cy.get('[data-cy=login-button]').click();
    // Enter incorrect email and password
    cy.get('[data-cy=email-input]').should('exist').should('be.visible').type('wrong_email@example.com');
    cy.get('[data-cy=password-input]').should('exist').should('be.visible').type('wrongpassword');
    // Ensure the confirm login button exists and is visible before clicking
    cy.get('[data-cy=confirm-login]').should('exist').should('be.visible');
    // Wait briefly to ensure stability
    cy.wait(1000);
    // Click the confirm login button
    cy.get('[data-cy=confirm-login]').click();
    // Stub the window.alert method
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });
    cy.get('@alert').should('have.been.calledOnce');
    });

    it('reset password', () => {
      cy.visit('/');
      // Ensure the login button exists and is visible before clicking
      cy.get('[data-cy=login-button]').should('exist').should('be.visible');
      // Click the login button
      cy.get('[data-cy=login-button]').click();
      // Enter email
      cy.get('[data-cy=email-input]').should('exist').should('be.visible').type(email);
      // Ensure the forgot password button exists and is visible before clicking
      cy.get('[data-cy=forgot-button]').should('exist').should('be.visible').click();
      cy.get('[data-cy=send-reset-button]').should('exist').should('be.visible').click();
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alert');
      });
      cy.get('@alert').should('have.been.calledOnce').and('have.been.calledWith', 'Reset password email sent. Please check your inbox.');
    });

    it('register from login modal, go back if cancel', () => {
      cy.visit('/');
      cy.get('[data-cy=login-button]').should('exist').should('be.visible').click();
      cy.get('[data-cy=create-new-button]').should('exist').should('be.visible').click();
      cy.contains('Register').should('exist');
      cy.get('[data-cy=cancel-button]').should('exist').should('be.visible').click();
      cy.contains('Login').should('exist');
    });
})