if (Cypress.env("remote_api")) {
  describe('The login', () => {

    it('is working with UI', () => {
      cy.intercept('/front/custom.css', {
        statusCode: 200,
      })
      cy.intercept('/api/v1/**', {
        statusCode: 200,
        body: {}
      })
      cy.visit('/library')
      cy.wait(5000)
      //cy.get('.item.collapse-button-wrapper').click()
      //cy.contains('Switch Instance').click()
    })
  })
}
