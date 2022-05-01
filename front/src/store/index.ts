import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import favorites from './favorites'
import channels from './channels'
import libraries from './libraries'
import auth from './auth'
import instance from './instance'
import moderation from './moderation'
import queue from './queue'
import radios from './radios'
import player from './player'
import playlists from './playlists'
import ui from './ui'

export default createStore({
  modules: {
    ui,
    auth,
    channels,
    libraries,
    favorites,
    instance,
    moderation,
    queue,
    radios,
    playlists,
    player
  },
  plugins: [
    createPersistedState({
      key: 'auth',
      paths: ['auth'],
      filter: (mutation) => {
        return mutation.type.startsWith('auth/')
      }
    }),
    createPersistedState({
      key: 'instance',
      paths: ['instance.events', 'instance.instanceUrl', 'instance.knownInstances']
    }),
    createPersistedState({
      key: 'ui',
      paths: ['ui.currentLanguage', 'ui.selectedLanguage', 'ui.momentLocale', 'ui.routePreferences']
    }),
    createPersistedState({
      key: 'radios',
      paths: ['radios'],
      filter: (mutation) => {
        return mutation.type.startsWith('radios/')
      }
    }),
    createPersistedState({
      key: 'player',
      paths: [
        'player.looping',
        'player.volume',
        'player.duration'],
      filter: (mutation) => {
        return mutation.type.startsWith('player/') && mutation.type !== 'player/currentTime'
      }
    }),
    createPersistedState({
      key: 'queue',
      filter: (mutation) => {
        return mutation.type.startsWith('queue/')
      },
      reducer: (state) => {
        return {
          queue: {
            currentIndex: state.queue.currentIndex,
            tracks: state.queue.tracks.map((track: any) => {
              // we keep only valuable fields to make the cache lighter and avoid
              // cyclic value serialization errors
              const artist = {
                id: track.artist.id,
                mbid: track.artist.mbid,
                name: track.artist.name
              }
              const data = {
                id: track.id,
                title: track.title,
                mbid: track.mbid,
                uploads: track.uploads,
                listen_url: track.listen_url,
                artist: artist,
                album: {}
              }
              if (track.album) {
                data.album = {
                  id: track.album.id,
                  title: track.album.title,
                  mbid: track.album.mbid,
                  cover: track.album.cover,
                  artist: artist
                }
              }
              return data
            })
          }
        }
      }
    })
  ]
})
