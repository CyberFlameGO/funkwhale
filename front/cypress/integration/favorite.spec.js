Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('Favorites', () => {

  it('can be done from album list view', () => {
    cy.login()

    cy.wait(1000)
    cy.get('.item.collapse-button-wrapper').click()
    cy.contains('Albums').click()
    cy.wait(2000)
    cy.get('.component-album-card').within(() => {
      cy.get('a').first().click()
    })
    cy.get('.track-row.row').first().within(() => {
      cy.get('a').click()
    })
    cy.wait(5000)
    cy.get('div.ui.inverted.segment.fixed-controls').should('be.visible')
    cy.get('i.ui.big.pause.icon').should('exist')
  })

//  it('is working without UI', () => {
//    cy.login(username, password)
//    cy.visit('/library')
//    cy.get('.ui.avatar.circular.label').should('exist')
//    cy.getCookie('sessionid').should('exist')
//  })
})
