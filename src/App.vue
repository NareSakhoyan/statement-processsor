<template>
  <v-container>
    <v-card class="px-4">
      <v-card-title class="text-h2 text-md-h5 text-lg-h4 px-0"
        >Here you can validate your transaction files</v-card-title
      >
      <v-file-input
        label="File input type:xml/csv"
        v-model="files"
        multiple
      ></v-file-input>
      <TransactionsTable v-if="jsonResult?.length" :data="jsonResult" />
    </v-card>
    <Snackbar :info="snackbar" @closeSnackBar="() => (snackbar.show = false)" />
  </v-container>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import xml2js from 'xml2js'
import Papa from 'papaparse'
import TransactionsTable from './components/TransactionsTable.vue'
import Snackbar from './components/SnackBar.vue'

const files = ref([])
const jsonResult = ref([])
const snackbar = reactive({
  show: false,
  text: '',
  type: '',
})

const setSnackbarMessage = (text, type) => {
  snackbar.show = true
  snackbar.text = text
  snackbar.type = type
}

watch(files, () => {
  jsonResult.value = []
  files.value.map((file) => readFileContent(file))
})

/**
 * Reads the content of a file.
 * @param {File} file - The file to read.
 */
const readFileContent = (file) => {
  const reader = new FileReader()

  reader.onload = () => {
    const content = reader.result
    parseFileContent(file.name, content)
  }

  reader.readAsText(file)
}

/**
 * Parses file content based on its format (XML or CSV), or shows an error if the format is not supported.
 * @param {string} fileName - The name of the file.
 * @param {string} content - The content of the file.
 */
const parseFileContent = (fileName, content) => {
  if (fileName.endsWith('.xml')) {
    parseXmlToJson(content)
  } else if (fileName.endsWith('.csv')) {
    parseCsvToJson(content)
  } else {
    setSnackbarMessage('Unsupported file type', 'error')
  }
}

/**
 * Parses an XML file and formats the data into a flattened structure.
 * @param {string} xmlContent - The content of the XML file.
 */
const parseXmlToJson = (xmlContent) => {
  const parser = new xml2js.Parser({ explicitArray: false })

  parser.parseString(xmlContent, (error, result) => {
    if (error) {
      setSnackbarMessage(error.message, 'error')
    } else {
      const formattedData = result.records.record.map((record) => {
        const { reference } = record.$
        delete record.$
        return { ...record, reference }
      })
      setSnackbarMessage('Successfully added the file', 'success')
      jsonResult.value.push(validateData(formattedData))
    }
  })
}

/**
 * Parses a CSV file and formats the data, converting record object property names to camelCase.
 * @param {string} csvContent - The content of the CSV file.
 */
const parseCsvToJson = (csvContent) => {
  Papa.parse(csvContent, {
    header: true,
    dynamicTyping: true,
    complete: (result) => {
      const formattedData = result.data.map((record) => {
        const {
          Reference: reference,
          'Account Number': accountNumber,
          Description: description,
          'Start Balance': startBalance,
          Mutation: mutation,
          'End Balance': endBalance,
        } = record
        return {
          reference,
          accountNumber,
          description,
          startBalance,
          mutation,
          endBalance,
        }
      })
      setSnackbarMessage('Successfully added the file', 'success')
      jsonResult.value.push(validateData(formattedData))
    },
    error: (error) => {
      setSnackbarMessage(error.message, 'error')
    },
  })
}

/**
 * Validates the references to be unique and ensures correct endBalance calculation.
 * Returns the data with all objects and an `invalid` property containing fields that failed validation.
 *
 * @param {Array} data - An array of objects to be validated.
 * @returns {Object} - The validated data with an `invalid` property.
 */
const validateData = (data) => {
  const references = []
  data.map((record) => {
    let { reference, startBalance, mutation, endBalance } = record
    const invalid = []
    // Check for duplicated references by saving all the ones we have mapped over in an array that isn't
    // present in the initial array. Otherwise, add the reference to the invalid field array.
    if (references.includes(reference)) invalid.push('reference')
    else references.push(reference)

    // This could've easily been sovled with eval, but it has a security risk
    if (endBalance * 1 != (startBalance * 1 + mutation * 1).toFixed(2))
      invalid.push('balance')

    if (invalid.length) record.invalid = invalid
    
    return record
  })
  return data
}
</script>
