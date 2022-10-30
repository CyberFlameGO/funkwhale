import type { Module } from 'vuex'
import type { RootState } from '~/store/index'

import axios from 'axios'
import time from '~/utils/time'
import useLogger from '~/composables/useLogger'

export interface State {
  maxConsecutiveErrors: number
  errorCount: number
  playing: boolean
  isLoadingAudio: boolean
  volume: number
  tempVolume: number
  duration: number
  currentTime: number
  errored: boolean
  bufferProgress: number
  looping: 0 | 1 | 2 // 0 -> no, 1 -> on  track, 2 -> on queue
}

const logger = useLogger()

const store: Module<State, RootState> = {
  namespaced: true,
  state: {
    maxConsecutiveErrors: 5,
    errorCount: 0,
    playing: false,
    isLoadingAudio: false,
    volume: 1,
    tempVolume: 0.5,
    duration: 0,
    currentTime: 0,
    errored: false,
    bufferProgress: 0,
    looping: 0
  },
  mutations: {
    reset (state) {
      state.errorCount = 0
      state.playing = false
    },
    volume (state, value) {
      value = parseFloat(value)
      value = Math.min(value, 1)
      value = Math.max(value, 0)
      state.volume = value
    },
    tempVolume (state, value) {
      value = parseFloat(value)
      value = Math.min(value, 1)
      value = Math.max(value, 0)
      state.tempVolume = value
    },
    incrementVolume (state, value) {
      value = parseFloat(state.volume + value)
      value = Math.min(value, 1)
      value = Math.max(value, 0)
      state.volume = value
    },
    incrementErrorCount (state) {
      state.errorCount += 1
    },
    resetErrorCount (state) {
      state.errorCount = 0
    },
    duration (state, value) {
      state.duration = value
    },
    errored (state, value) {
      state.errored = value
    },
    currentTime (state, value) {
      state.currentTime = value
    },
    looping (state, value) {
      state.looping = value
    },
    playing (state, value) {
      state.playing = value
    },
    bufferProgress (state, value) {
      state.bufferProgress = value
    },
    toggleLooping (state) {
      if (state.looping > 1) {
        state.looping = 0
      } else {
        state.looping += 1
      }
    },
    isLoadingAudio (state, value) {
      state.isLoadingAudio = value
    }
  },
  getters: {
    durationFormatted: state => {
      return time.parse(Math.round(state.duration))
    },
    currentTimeFormatted: state => {
      return time.parse(Math.round(state.currentTime))
    },
    progress: state => {
      return Math.min(state.currentTime / state.duration * 100, 100)
    }
  },
  actions: {
    incrementVolume ({ commit, state }, value) {
      commit('volume', state.volume + value)
    },
    stop ({ commit }) {
      commit('errored', false)
      commit('resetErrorCount')
    },
    togglePlayback ({ commit, state, dispatch }) {
      commit('playing', !state.playing)
      if (state.errored && state.errorCount < state.maxConsecutiveErrors) {
        setTimeout(() => {
          if (state.playing) {
            dispatch('queue/next', null, { root: true })
          }
        }, 3000)
      }
    },
    async resumePlayback ({ commit, state, dispatch }) {
      commit('playing', true)
      if (state.errored && state.errorCount < state.maxConsecutiveErrors) {
        // TODO (wvffle): Cancel whenever we skip track
        await new Promise(resolve => setTimeout(resolve, 3000))
        if (state.playing) {
          return dispatch('queue/next', null, { root: true })
        }
      }
    },
    pausePlayback ({ commit }) {
      commit('playing', false)
    },
    trackListened ({ rootState }, track) {
      if (!rootState.auth.authenticated) {
        return
      }

      return axios.post('history/listenings/', { track: track.id }).catch((error) => {
        logger.error('Could not record track in history', error)
      })
    },
    trackEnded ({ commit, dispatch, rootState }) {
      const queueState = rootState.queue
      if (queueState.currentIndex === queueState.tracks.length - 1) {
        // we've reached last track of queue, trigger a reload
        // from radio if any
        dispatch('radios/populateQueue', null, { root: true })
      }
      dispatch('queue/next', null, { root: true })
      if (queueState.ended) {
        // Reset playback
        commit('playing', false)
        dispatch('updateProgress', 0)
      }
    },
    trackErrored ({ commit, dispatch, state }) {
      commit('errored', true)
      commit('incrementErrorCount')
      if (state.errorCount < state.maxConsecutiveErrors) {
        setTimeout(() => {
          if (state.playing) {
            dispatch('queue/next', null, { root: true })
          }
        }, 3000)
      }
    },
    updateProgress ({ commit }, time: number) {
      commit('currentTime', time)
    },
    mute ({ commit, state }) {
      commit('tempVolume', state.volume)
      commit('volume', 0)
    },
    unmute ({ commit, state }) {
      commit('volume', state.tempVolume)
    }
  }
}

export default store
