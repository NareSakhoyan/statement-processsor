<template>
  <v-container>
    <p class="text-grey-darken-1">
      The invalid data will be highlighted with
      <span class="bg-red-lighten-1">this</span> color
    </p>
    <v-table v-for="(transactions, i) in data" :key="i">
      <thead>
        <tr>
          <th
            class="text-left font-weight-bold"
            v-for="title in titles"
            :key="title"
          >
            {{ title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in transactions" :key="record.reference">
          <td
            :class="
              record.invalid?.includes('reference') ? 'bg-red-lighten-1' : ''
            "
          >
            {{ record.reference }}
          </td>
          <td>{{ record.accountNumber }}</td>
          <td>{{ record.description }}</td>
          <td>{{ record.startBalance }}</td>
          <td
            :class="
              record.mutation[0] === '+'
                ? 'text-green-lighten-1'
                : 'text-red-lighten-1'
            "
          >
            {{ record.mutation }}
          </td>
          <td
            :class="
              record.invalid?.includes('balance') ? 'bg-red-lighten-1' : ''
            "
          >
            {{ record.endBalance }}
          </td>
        </tr>
      </tbody>
      <br />
    </v-table>
  </v-container>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps(['data'])

const titles = [
  'Reference',
  'Account Number',
  'Description',
  'Start Balance',
  'Mutation',
  'End Balance',
]
</script>
