import axios from 'axios'
import logger from '~/logging'

export default {
  namespaced: true,
  state: {
    tracks: [],
    count: 0
  },
  mutations: {
    track: (state, { id, value }) => {
      if (value) {
        if (state.tracks.indexOf(id) === -1) {
          state.tracks.push(id)
        }
      } else {
        const i = state.tracks.indexOf(id)
        if (i > -1) {
          state.tracks.splice(i, 1)
        }
      }
      state.count = state.tracks.length
    },
    reset (state) {
      state.tracks = []
      state.count = 0
    }
  },
  getters: {
    isFavorite: (state) => (id) => {
      return state.tracks.indexOf(id) > -1
    }
  },
  actions: {
    set ({ commit, state }, { id, value }) {
      commit('track', { id, value })
      if (value) {
        return axios.post('favorites/tracks/', { track: id }).then((response) => {
          logger.default.info('Successfully added track to favorites')
        }, (response) => {
          logger.default.info('Error while adding track to favorites')
          commit('track', { id, value: !value })
        })
      } else {
        return axios.post('favorites/tracks/remove/', { track: id }).then((response) => {
          logger.default.info('Successfully removed track from favorites')
        }, (response) => {
          logger.default.info('Error while removing track from favorites')
          commit('track', { id, value: !value })
        })
      }
    },
    toggle ({ getters, dispatch }, id) {
      dispatch('set', { id, value: !getters.isFavorite(id) })
    },
    fetch ({ dispatch, state, commit, rootState }, url) {
      // will fetch favorites by batches from API to have them locally
      const params = {
        user: rootState.auth.profile.id,
        page_size: 50,
        ordering: '-creation_date'
      }
      const promise = axios.get('favorites/tracks/all/', { params: params })
      return promise.then((response) => {
        logger.default.info('Fetched a batch of ' + response.data.results.length + ' favorites')
        response.data.results.forEach(result => {
          commit('track', { id: result.track, value: true })
        })
      })
    }
  }
}
