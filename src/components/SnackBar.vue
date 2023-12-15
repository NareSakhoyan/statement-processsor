<template>
  <v-snackbar v-model="snackbar" timeout="10000">
    {{ info.text }}

    <template v-slot:actions>
      <v-btn
        :color="info.type === 'success' ? 'green' : 'red'"
        variant="text"
        @click="$emit('closeSnackBar')"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue'

const snackbar = ref(false)
const props = defineProps(['info'])

watch(
  props.info,
  (value) => {
    snackbar.value = value.show
  },
  { deep: true }
)
</script>
