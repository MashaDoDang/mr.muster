import '../support/commands';

const email = 'jane_doe3211@gmail.com';
const password = 'janedoepassword';

describe('post interactions', () => {
    // it('go to post from landing page', () => {
    //   cy.visit('/');
    //   cy.get('[data-cy=post-link-MaDKUWld4iTcRCovIUbt]').click();
    // });

    it ('like and unlike the post, create and delete comment, go to comment author\'s page', () => {
      cy.visit('/view-post/MaDKUWld4iTcRCovIUbt');
      cy.login(email, password);
      cy.get('[data-cy=like-button]').click();
      cy.wait(3000);
      cy.get('[data-cy=like-button]').click();
      cy.get('[data-cy="comment-author-0"]').click();
      // cy.logout();
    });

    it('create and delete comment, go to post author\'s page', () => {
      // cy.login(email, password);
      cy.visit('/view-post/MaDKUWld4iTcRCovIUbt');
      cy.get('[data-cy="comment-input"]').type('This is a test comment');
      cy.get('[data-cy="send-button"]').click();
      cy.wait(3000);
      cy.get('[data-cy="delete-comment-0"]').click();
      cy.get('[data-cy="post-author-link"]').click();
      // cy.logout();
    });


});