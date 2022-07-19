import axios from 'axios'

export default {
  namespaced: true,
  state: {
    playlists: [],
    showModal: false,
    modalTrack: null
  },
  mutations: {
    playlists (state, value) {
      state.playlists = value
    },
    chooseTrack (state, value) {
      state.showModal = true
      state.modalTrack = value
    },
    showModal (state, value) {
      state.showModal = value
    },
    reset (state) {
      state.playlists = []
      state.modalTrack = null
      state.showModal = false
    }
  },
  actions: {
    async fetchOwn ({ commit, rootState }) {
      const userId = rootState.auth.profile.id
      if (!userId) {
        return
      }
      let playlists = []
      let url = 'playlists/'
      while (url != null) {
        const response = await axios.get(url, { params: { scope: 'me' } })
        playlists = [...playlists, ...response.data.results]
        url = response.data.next
      }
      commit('playlists', playlists)
    }
  }
}