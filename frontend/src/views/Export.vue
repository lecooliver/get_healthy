<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const exporting = ref(false)
const exportSuccess = ref('')
const exportError = ref('')

const exportData = async (format) => {
  exporting.value = true
  exportError.value = ''
  exportSuccess.value = ''

  try {
    const response = await fetch(`/api/export/${format}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })

    if (!response.ok) throw new Error('Não foi possível exportar os dados.')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `get_healthy_export.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    exportSuccess.value = `Arquivo ${format.toUpperCase()} baixado com sucesso!`
  } catch (error) {
    exportError.value = error.message
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">
      Exportar seus dados
    </h1>

    <div
      v-if="exportError"
      class="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
    >
      {{ exportError }}
    </div>

    <div
      v-if="exportSuccess"
      class="p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"
    >
      {{ exportSuccess }}
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold mb-2">
        Exportar todos os seus dados
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Baixe uma cópia completa dos seus dados de saúde, incluindo medidas, treinos e rotinas.
      </p>

      <div class="space-y-4">
        <button
          class="btn btn-primary w-full justify-center"
          :disabled="exporting"
          @click="exportData('json')"
        >
          📄 Baixar arquivo JSON
        </button>

        <button
          class="btn btn-secondary w-full justify-center"
          :disabled="exporting"
          @click="exportData('csv')"
        >
          📊 Baixar arquivo CSV (medidas)
        </button>
      </div>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold mb-2">
        Sobre seus dados
      </h2>
      <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <li>• <strong>Arquivo JSON:</strong> Cópia completa dos dados, incluindo medidas, rotinas, treinos e registros de exercícios. Ideal para transferir seus dados ou importá-los em outros aplicativos.</li>
        <li>• <strong>Arquivo CSV:</strong> Formato compatível com planilhas para consultar suas medidas corporais ao longo do tempo, por exemplo, no Excel ou no Planilhas Google.</li>
        <li>• Os arquivos são gerados na hora com seus dados atuais.</li>
      </ul>
    </div>

    <div class="card border border-orange-200 dark:border-orange-800">
      <h2 class="text-lg font-semibold mb-2 text-orange-600">
        ⚠️ Exclusão de dados
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Para excluir permanentemente todos os seus dados, acesse as configurações do perfil.
      </p>
      <RouterLink
        to="/profile"
        class="btn btn-secondary"
      >
        Ir para as configurações do perfil
      </RouterLink>
    </div>
  </div>
</template>
