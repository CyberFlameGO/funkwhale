<template>
  <section>
    <library-form :library="object" @updated="$emit('updated')" @deleted="$router.push({name: 'profile.overview', params: {username: $store.state.auth.username}})" />
    <div class="ui hidden divider"></div>
    <h2 class="ui header">
      <translate translate-context="*/*/*">Library contents</translate>
    </h2>
    <library-files-table :filters="{library: object.uuid}"></library-files-table>

    <div class="ui hidden divider"></div>
    <h2 class="ui header">
      <translate translate-context="Content/Federation/*/Noun">Followers</translate>
    </h2>
    <div v-if="isLoadingFollows" :class="['ui', {'active': isLoadingFollows}, 'inverted', 'dimmer']">
      <div class="ui text loader"><translate translate-context="Content/Library/Paragraph">Loading followersâ€¦</translate></div>
    </div>
    <table v-else-if="follows && follows.count > 0" class="ui table">
      <thead>
        <tr>
          <th><translate translate-context="Content/Library/Table.Label">User</translate></th>
          <th><translate translate-context="Content/Library/Table.Label">Date</translate></th>
          <th><translate translate-context="*/*/*">Status</translate></th>
          <th><translate translate-context="Content/Library/Table.Label">Action</translate></th>
        </tr>
      </thead>
      <tr v-for="follow in follows.results" :key="follow.fid">
        <td><actor-link :actor="follow.actor" /></td>
        <td><human-date :date="follow.creation_date" /></td>
        <td>
          <span :class="['ui', 'yellow', 'basic', 'label']" v-if="follow.approved === null">
            <translate translate-context="Content/Library/Table/Short">Pending approval</translate>
          </span>
          <span :class="['ui', 'green', 'basic', 'label']" v-else-if="follow.approved === true">
            <translate translate-context="Content/Library/Table/Short">Accepted</translate>
          </span>
          <span :class="['ui', 'red', 'basic', 'label']" v-else-if="follow.approved === false">
            <translate translate-context="Content/Library/*/Short">Rejected</translate>
          </span>
        </td>
        <td>
          <div @click="updateApproved(follow, true)" :class="['ui', 'mini', 'icon', 'labeled', 'green', 'button']" v-if="follow.approved === null || follow.approved === false">
            <i class="ui check icon"></i> <translate translate-context="Content/Library/Button.Label">Accept</translate>
          </div>
          <div @click="updateApproved(follow, false)" :class="['ui', 'mini', 'icon', 'labeled', 'red', 'button']" v-if="follow.approved === null || follow.approved === true">
            <i class="ui x icon"></i> <translate translate-context="Content/Library/Button.Label">Reject</translate>
          </div>
        </td>
      </tr>

    </table>
    <p v-else><translate translate-context="Content/Library/Paragraph">Nobody is following this library</translate></p>
  </section>
</template>

<script>
import LibraryFilesTable from "@/views/content/libraries/FilesTable"
import LibraryForm from "@/views/content/libraries/Form"
import axios from "axios"

export default {
  props: ['object'],
  components: {
    LibraryForm,
    LibraryFilesTable
  },
  data () {
    return {
      isLoadingFollows: false,
      follows: null
    }
  },
  created() {
    this.fetchFollows()
  },
  methods: {
    fetchFollows() {
      let self = this
      self.isLoadingLibrary = true
      axios.get(`libraries/${this.object.uuid}/follows/`).then(response => {
        self.follows = response.data
        self.isLoadingFollows = false
      })
    },
    updateApproved(follow, value) {
      let self = this
      let action
      if (value) {
        action = "accept"
      } else {
        action = "reject"
      }
      axios
        .post(`federation/follows/library/${follow.uuid}/${action}/`)
        .then(response => {
          follow.isLoading = false
          follow.approved = value
        })
    }
  }
}
</script>
