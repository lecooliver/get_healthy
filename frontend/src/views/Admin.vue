<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import HelpIcon from '@/components/HelpIcon.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const authStore = useAuthStore()

const activeTab = ref('overview')
const tabs = [
  { id: 'overview', label: 'Visão geral', icon: '📊' },
  { id: 'users', label: 'Usuários', icon: '👥' },
  { id: 'oidc', label: 'OIDC', icon: '🔐' },
  { id: 'smtp', label: 'E-mail', icon: '📧' }
]

const users = ref([])
const stats = ref(null)
const loading = ref(true)
const editingUser = ref(null)
const saving = ref(false)
const message = ref({ type: '', text: '' })
const showDeleteConfirm = ref(false)
const deletingUserId = ref(null)

const oidcSettings = ref({
  google: { enabled: false, clientId: '', clientSecret: '' },
  github: { enabled: false, clientId: '', clientSecret: '' },
  keycloak: { enabled: false, issuer: '', clientId: '', clientSecret: '' },
  authentik: { enabled: false, issuer: '', clientId: '', clientSecret: '' },
  authelia: { enabled: false, issuer: '', clientId: '', clientSecret: '' },
  generic: { enabled: false, issuer: '', clientId: '', clientSecret: '' }
})

const smtpSettings = ref({
  host: '',
  port: 587,
  secure: false,
  user: '',
  pass: '',
  from: '',
  fromName: 'Get Healthy'
})

onMounted(async () => {
  await Promise.all([loadUsers(), loadStats(), loadSettings()])
  loading.value = false
})

const loadUsers = async () => {
  try {
    const response = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      users.value = await response.json()
    }
  } catch (error) {
    console.error('Não foi possível carregar os usuários:', error)
  }
}

const loadStats = async () => {
  try {
    const response = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      stats.value = await response.json()
    }
  } catch (error) {
    console.error('Não foi possível carregar as estatísticas:', error)
  }
}

const loadSettings = async () => {
  try {
    const response = await fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      const data = await response.json()
      if (data.oidc) oidcSettings.value = { ...oidcSettings.value, ...data.oidc }
      if (data.smtp) smtpSettings.value = { ...smtpSettings.value, ...data.smtp }
    } else {
      message.value = { type: 'error', text: 'Não foi possível carregar as configurações.' }
    }
  } catch (error) {
    console.error('Não foi possível carregar as configurações:', error)
    message.value = { type: 'error', text: 'Não foi possível carregar as configurações.' }
  }
}

const saveOidcSettings = async () => {
  saving.value = true
  message.value = { type: '', text: '' }
  try {
    const response = await fetch('/api/admin/settings/oidc', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(oidcSettings.value)
    })
    if (response.ok) {
      message.value = { type: 'success', text: 'Configurações OIDC salvas. Reinicie o servidor para aplicar as alterações.' }
    }
  } catch (error) {
    message.value = { type: 'error', text: 'Não foi possível salvar as configurações OIDC.' }
  } finally {
    saving.value = false
  }
}

const saveSmtpSettings = async () => {
  saving.value = true
  message.value = { type: '', text: '' }
  try {
    const response = await fetch('/api/admin/settings/smtp', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(smtpSettings.value)
    })
    if (response.ok) {
      await loadSettings()
      message.value = { type: 'success', text: 'Configurações de e-mail salvas.' }
    } else {
      const err = await response.json().catch(() => ({}))
      message.value = { type: 'error', text: `Não foi possível salvar: ${err.error || response.statusText}` }
    }
  } catch (error) {
    message.value = { type: 'error', text: 'Não foi possível salvar as configurações de e-mail.' }
  } finally {
    saving.value = false
  }
}

const testSmtp = async () => {
  saving.value = true
  message.value = { type: '', text: '' }
  try {
    const response = await fetch('/api/admin/settings/smtp/test', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    const data = await response.json()
    if (response.ok) {
      message.value = { type: 'success', text: 'E-mail de teste enviado com sucesso!' }
    } else {
      message.value = { type: 'error', text: data.error || 'Não foi possível enviar o e-mail de teste.' }
    }
  } catch (error) {
    message.value = { type: 'error', text: 'Não foi possível enviar o e-mail de teste.' }
  } finally {
    saving.value = false
  }
}

const updateUserRole = async (userId, newRole) => {
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ role: newRole })
    })
    
    if (response.ok) {
      await loadUsers()
      editingUser.value = null
    }
  } catch (error) {
    console.error('Não foi possível atualizar o usuário:', error)
  }
}

const confirmDeleteUser = (userId) => {
  deletingUserId.value = userId
  showDeleteConfirm.value = true
}

const deleteUser = async () => {
  const userId = deletingUserId.value
  if (!userId) return
  
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    if (response.ok) {
      await loadUsers()
      await loadStats()
    }
  } catch (error) {
    console.error('Não foi possível excluir o usuário:', error)
  } finally {
    showDeleteConfirm.value = false
    deletingUserId.value = null
  }
}

const getOidcProviderInfo = (provider) => {
  const info = {
    google: { name: 'Google', url: 'https://console.cloud.google.com/apis/credentials' },
    github: { name: 'GitHub', url: 'https://github.com/settings/developers' },
    keycloak: { name: 'Keycloak', url: 'https://www.keycloak.org' },
    authentik: { name: 'Authentik', url: 'https://goauthentik.io' },
    authelia: { name: 'Authelia', url: 'https://www.authelia.com' },
    generic: { name: 'OIDC genérico', url: 'https://any-oidc-provider.com' }
  }
  return info[provider] || { name: provider, url: '' }
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">
      Configurações de administração
    </h1>

    <div
      v-if="message.text"
      :class="[
        'p-4 rounded-lg',
        message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      ]"
      role="alert"
    >
      {{ message.text }}
    </div>

    <div class="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-colors',
          activeTab === tab.id
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        ]"
        @click="activeTab = tab.id"
      >
        <span aria-hidden="true">{{ tab.icon }}</span> {{ tab.label }}
      </button>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>

    <template v-else>
      <div
        v-if="activeTab === 'overview'"
        class="space-y-6"
      >
        <h2 class="text-lg font-semibold">
          Visão geral do sistema
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card">
            <div class="text-2xl mb-1">
              👥
            </div>
            <div class="text-2xl font-bold">
              {{ stats?.totalUsers || 0 }}
            </div>
            <div class="text-sm text-gray-500">
              Total de usuários
            </div>
          </div>
          <div class="card">
            <div class="text-2xl mb-1">
              🧑‍💼
            </div>
            <div class="text-2xl font-bold">
              {{ stats?.adminUsers || 0 }}
            </div>
            <div class="text-sm text-gray-500">
              Administradores
            </div>
          </div>
          <div class="card">
            <div class="text-2xl mb-1">
              🏋️
            </div>
            <div class="text-2xl font-bold">
              {{ stats?.totalWorkouts || 0 }}
            </div>
            <div class="text-sm text-gray-500">
              Treinos concluídos
            </div>
          </div>
          <div class="card">
            <div class="text-2xl mb-1">
              📏
            </div>
            <div class="text-2xl font-bold">
              {{ stats?.totalMeasurements || 0 }}
            </div>
            <div class="text-sm text-gray-500">
              Medidas
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="activeTab === 'users'"
        class="space-y-6"
      >
        <h2 class="text-lg font-semibold">
          Gerenciamento de usuários
        </h2>
        <div class="card">
          <div class="overflow-x-auto">
            <table
              class="w-full text-sm"
              role="table"
            >
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th
                    scope="col"
                    class="text-left py-3 px-2"
                  >
                    Usuário
                  </th>
                  <th
                    scope="col"
                    class="text-left py-3 px-2"
                  >
                    E-mail
                  </th>
                  <th
                    scope="col"
                    class="text-left py-3 px-2"
                  >
                    Função
                  </th>
                  <th
                    scope="col"
                    class="text-left py-3 px-2"
                  >
                    Cadastro
                  </th>
                  <th
                    scope="col"
                    class="text-right py-3 px-2"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in users"
                  :key="user.id"
                  class="border-b border-gray-100 dark:border-gray-700/50"
                >
                  <td class="py-3 px-2">
                    {{ user.displayName }}
                  </td>
                  <td class="py-3 px-2">
                    {{ user.email }}
                  </td>
                  <td class="py-3 px-2">
                    <span
                      class="px-2 py-1 text-xs rounded capitalize"
                      :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                    >
                      {{ user.role === 'admin' ? 'Administrador' : 'Usuário' }}
                    </span>
                  </td>
                  <td class="py-3 px-2">
                    {{ new Date(user.createdAt).toLocaleDateString('pt-BR') }}
                  </td>
                  <td class="py-3 px-2 text-right">
                    <div class="flex gap-2 justify-end">
                      <select
                        v-if="editingUser === user.id"
                        v-model="user.role"
                        class="input text-sm py-1 w-24"
                        :aria-label="`Alterar função de ${user.displayName}`"
                        @change="updateUserRole(user.id, user.role)"
                      >
                        <option value="user">
                          Usuário
                        </option>
                        <option value="admin">
                          Administrador
                        </option>
                      </select>
                      <button
                        v-if="editingUser !== user.id && user.id !== authStore.user?.id"
                        class="text-blue-600 hover:underline text-sm focus:ring-2 focus:ring-blue-500 rounded"
                        @click="editingUser = user.id"
                      >
                        Editar
                      </button>
                      <button
                        v-if="editingUser === user.id"
                        class="text-gray-500 hover:underline text-sm"
                        @click="editingUser = null"
                      >
                        Cancelar
                      </button>
                      <button
                        v-if="user.id !== authStore.user?.id"
                        class="text-red-600 hover:underline text-sm"
                        @click="confirmDeleteUser(user.id)"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        v-if="activeTab === 'oidc'"
        class="space-y-6"
      >
        <h2 class="text-lg font-semibold">
          Configuração de OIDC / OAuth2
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Configure provedores OAuth2 e OIDC para autenticação única. As alterações exigem a reinicialização do servidor.
        </p>

        <div class="space-y-6">
          <div
            v-for="provider in ['google', 'github', 'keycloak', 'authentik', 'authelia', 'generic']"
            :key="provider"
            class="card"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold capitalize flex items-center gap-2">
                <input
                  v-model="oidcSettings[provider].enabled"
                  type="checkbox"
                  class="w-4 h-4"
                  :aria-label="`Habilitar ${getOidcProviderInfo(provider).name}`"
                >
                {{ getOidcProviderInfo(provider).name }}
              </h3>
              <a
                v-if="getOidcProviderInfo(provider).url"
                :href="getOidcProviderInfo(provider).url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-blue-600 hover:underline"
              >
                Guia de configuração →
              </a>
            </div>

            <div
              v-if="oidcSettings[provider].enabled"
              class="space-y-3"
            >
              <div v-if="['keycloak', 'authentik', 'authelia', 'generic'].includes(provider)">
                <label
                  :for="`${provider}-issuer`"
                  class="block text-sm font-medium mb-1"
                >
                  URL do emissor <HelpIcon text="URL base do provedor OIDC (ex.: https://seu-keycloak.com/realms/seu-dominio)" />
                </label>
                <input
                  :id="`${provider}-issuer`"
                  v-model="oidcSettings[provider].issuer"
                  type="url"
                  class="input"
                  :placeholder="`https://seu-${provider}.com`"
                >
              </div>

              <div>
                <label
                  :for="`${provider}-client-id`"
                  class="block text-sm font-medium mb-1"
                >ID do cliente</label>
                <input
                  :id="`${provider}-client-id`"
                  v-model="oidcSettings[provider].clientId"
                  type="text"
                  class="input"
                  placeholder="ID do cliente fornecido pelo provedor"
                >
              </div>

              <div>
                <label
                  :for="`${provider}-client-secret`"
                  class="block text-sm font-medium mb-1"
                >Segredo do cliente</label>
                <input
                  :id="`${provider}-client-secret`"
                  v-model="oidcSettings[provider].clientSecret"
                  type="password"
                  class="input"
                  placeholder="Segredo do cliente fornecido pelo provedor"
                  autocomplete="off"
                >
              </div>
            </div>
          </div>
        </div>

        <button
          class="btn btn-primary"
          :disabled="saving"
          @click="saveOidcSettings"
        >
          {{ saving ? 'Salvando...' : 'Salvar configurações OIDC' }}
        </button>
      </div>

      <div
        v-if="activeTab === 'smtp'"
        class="space-y-6"
      >
        <h2 class="text-lg font-semibold">
          Configuração de e-mail / SMTP
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Configure o SMTP para enviar e-mails (redefinição de senha, notificações etc.).
        </p>

        <div class="card space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                for="smtp-host"
                class="block text-sm font-medium mb-1"
              >
                Servidor SMTP <HelpIcon text="Nome do servidor de e-mail (ex.: smtp.gmail.com, smtp.sendgrid.net)" />
              </label>
              <input
                id="smtp-host"
                v-model="smtpSettings.host"
                type="text"
                class="input"
                placeholder="smtp.example.com"
              >
            </div>

            <div>
              <label
                for="smtp-port"
                class="block text-sm font-medium mb-1"
              >
                Porta <HelpIcon text="Portas comuns: 587 (TLS), 465 (SSL), 25 (sem criptografia)" />
              </label>
              <input
                id="smtp-port"
                v-model="smtpSettings.port"
                type="number"
                class="input"
                placeholder="587"
              >
            </div>
          </div>

          <div>
            <label
              for="smtp-user"
              class="block text-sm font-medium mb-1"
            >Usuário</label>
            <input
              id="smtp-user"
              v-model="smtpSettings.user"
              type="text"
              class="input"
              placeholder="voce@exemplo.com"
              autocomplete="username"
            >
          </div>

          <div>
            <label
              for="smtp-pass"
              class="block text-sm font-medium mb-1"
            >Senha</label>
            <input
              id="smtp-pass"
              v-model="smtpSettings.pass"
              type="password"
              class="input"
              placeholder="Senha ou chave de API"
              autocomplete="current-password"
            >
          </div>

          <div class="flex items-center gap-2">
            <input
              id="smtp-secure"
              v-model="smtpSettings.secure"
              type="checkbox"
              class="w-4 h-4"
            >
            <label
              for="smtp-secure"
              class="text-sm"
            >
              Usar SSL/TLS <HelpIcon text="Ative para a porta 465. Na porta 587, deixe desmarcado (STARTTLS)." />
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                for="smtp-from"
                class="block text-sm font-medium mb-1"
              >E-mail do remetente</label>
              <input
                id="smtp-from"
                v-model="smtpSettings.from"
                type="email"
                class="input"
                placeholder="noreply@example.com"
              >
            </div>

            <div>
              <label
                for="smtp-from-name"
                class="block text-sm font-medium mb-1"
              >Nome do remetente</label>
              <input
                id="smtp-from-name"
                v-model="smtpSettings.fromName"
                type="text"
                class="input"
                placeholder="Get Healthy"
              >
            </div>
          </div>

          <div class="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              class="btn btn-primary"
              :disabled="saving"
              @click="saveSmtpSettings"
            >
              {{ saving ? 'Salvando...' : 'Salvar configurações de e-mail' }}
            </button>
            <button
              class="btn btn-secondary"
              :disabled="saving || !smtpSettings.host"
              @click="testSmtp"
            >
              Enviar e-mail de teste
            </button>
          </div>
        </div>

        <div class="card bg-gray-50 dark:bg-gray-800/50">
          <h3 class="font-medium mb-2">
            Provedores SMTP comuns
          </h3>
          <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li><strong>Gmail:</strong> smtp.gmail.com | Porta 587 | Requer senha de app</li>
            <li><strong>Outlook:</strong> smtp-mail.outlook.com | Porta 587 | TLS</li>
            <li><strong>SendGrid:</strong> smtp.sendgrid.net | Porta 587 | Chave de API</li>
            <li><strong>Mailgun:</strong> smtp.mailgun.org | Porta 587 | TLS</li>
            <li><strong>AWS SES:</strong> email-smtp.us-east-1.amazonaws.com | Porta 587 | Credenciais SMTP</li>
          </ul>
        </div>
      </div>
    </template>

    <ConfirmModal
      :show="showDeleteConfirm"
      title="Excluir usuário"
      message="Tem certeza de que deseja excluir este usuário? Esta ação não pode ser desfeita."
      confirm-text="Excluir"
      confirm-class="btn-danger"
      @update:show="showDeleteConfirm = $event"
      @confirm="deleteUser"
    />
  </div>
</template>
