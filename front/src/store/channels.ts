import axios from 'axios'
import useLogger from '~/composables/useLogger'
import { Module } from 'vuex'
import { RootState } from '~/store/index'

export interface State {
  subscriptions: string[]
  count: number
  showUploadModal: boolean
  latestPublication: null | Publication
  uploadModalConfig: {
    channel: null | Channel
  }
}

interface Channel {
  uuid: string
}

interface Publication {
  date: Date
  uploads: Upload[]
  channel: Channel
}

interface Upload {
  uuid: string
  import_status: 'pending' | 'skipped' | 'errored' | 'finished'
}

const logger = useLogger()

const store: Module<State, RootState> = {
  namespaced: true,
  state: {
    subscriptions: [],
    count: 0,
    showUploadModal: false,
    latestPublication: null,
    uploadModalConfig: {
      channel: null
    }
  },
  mutations: {
    subscriptions: (state, { uuid, value }) => {
      if (value) {
        if (!state.subscriptions.includes(uuid)) {
          state.subscriptions.push(uuid)
        }
      } else {
        const index = state.subscriptions.indexOf(uuid)
        if (index > -1) {
          state.subscriptions.splice(index, 1)
        }
      }

      state.count = state.subscriptions.length
    },
    reset (state) {
      state.subscriptions.length = 0
      state.count = 0
    },
    showUploadModal (state, value) {
      state.showUploadModal = value.show
      if (value.config) {
        state.uploadModalConfig = {
          ...value.config
        }
      }
    },
    publish (state, { uploads, channel }) {
      state.latestPublication = {
        date: new Date(),
        uploads,
        channel
      }
      state.showUploadModal = false
    }
  },
  getters: {
    isSubscribed: (state) => (uuid: string) => state.subscriptions.includes(uuid)
  },
  actions: {
    set ({ commit }, { uuid, value }) {
      commit('subscriptions', { uuid, value })
      if (value) {
        return axios.post(`channels/${uuid}/subscribe/`).then(() => {
          logger.info('Successfully subscribed to channel')
        }, () => {
          logger.info('Error while subscribing to channel')
          commit('subscriptions', { uuid, value: !value })
        })
      } else {
        return axios.post(`channels/${uuid}/unsubscribe/`).then(() => {
          logger.info('Successfully unsubscribed from channel')
        }, () => {
          logger.info('Error while unsubscribing from channel')
          commit('subscriptions', { uuid, value: !value })
        })
      }
    },
    toggle ({ getters, dispatch }, uuid) {
      dispatch('set', { uuid, value: !getters.isSubscribed(uuid) })
    },
    fetchSubscriptions ({ commit }) {
      const promise = axios.get('subscriptions/all/')
      return promise.then((response) => {
        response.data.results.forEach((result: { channel: unknown }) => {
          commit('subscriptions', { uuid: result.channel, value: true })
        })
      })
    }
  }
}

export default store