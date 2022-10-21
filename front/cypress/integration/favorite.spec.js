describe('Favorites', () => {

  it('can be done from album list view', () => {
    cy.login()

    cy.visit('/')

    cy.wait(1000)
    cy.get('.item.collapse-button-wrapper').click()
    cy.contains('Albums').click()
    cy.wait(2000)
    cy.get('.component-album-card').within(() => {
      cy.get('a').first().click()
    })
    cy.get('.track-row.row').first().trigger('hover').within(() => {
      cy.get('.favorite-icon').then(($favButton) => {
        $favButton.click()
        // In case everything worked the favorite button should be pink
        cy.wrap($favButton).should('have.class', 'pink')

      })
      cy.get('.favorite-icon.pink').then(($unfavButton) => {
        $unfavButton.click()
        // In case everything worked the favorite button shouldn't be pinkg
        // anymore
        cy.wrap($unfavButton).should('not.have.class', 'pink')
      })
    })
  })
})
