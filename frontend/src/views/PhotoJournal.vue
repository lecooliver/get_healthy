<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ConfirmModal from '@/components/ConfirmModal.vue'

const authStore = useAuthStore()

const photos = ref([])
const categories = ref([])
const loading = ref(true)
const showUploadModal = ref(false)
const showEditModal = ref(false)
const showTimelapseModal = ref(false)
const uploading = ref(false)
const timelapsePlaying = ref(false)
const timelapseIndex = ref(0)
const timelapseInterval = ref(null)
const showDeleteConfirm = ref(false)
const deletingPhotoId = ref(null)

const newPhoto = ref({
  category: '',
  notes: '',
  takenAt: new Date().toISOString().split('T')[0],
  customCategory: ''
})

const editingPhoto = ref({
  id: null,
  category: '',
  notes: '',
  takenAt: ''
})

const selectedCategory = ref('all')
const selectedPhoto = ref(null)
const selectedFile = ref(null)

onMounted(async () => {
  await Promise.all([loadPhotos(), loadCategories()])
})

onUnmounted(() => {
  stopTimelapse()
})

const loadPhotos = async () => {
  try {
    const url = selectedCategory.value === 'all' 
      ? '/api/photos' 
      : `/api/photos/category/${selectedCategory.value}`
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      photos.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load photos:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await fetch('/api/photos/categories', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      categories.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

const submitUpload = () => {
  if (selectedFile.value) {
    uploadPhoto(selectedFile.value)
  }
}

const uploadPhoto = async (file) => {
  const formData = new FormData()
  formData.append('photo', file)
  formData.append('category', newPhoto.value.customCategory || newPhoto.value.category)
  formData.append('notes', newPhoto.value.notes)
  formData.append('takenAt', newPhoto.value.takenAt)
  
  uploading.value = true
  try {
    const response = await fetch('/api/photos', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: formData
    })
    
    if (response.ok) {
      showUploadModal.value = false
      resetUploadForm()
      await loadPhotos()
      await loadCategories()
    }
  } catch (error) {
    console.error('Failed to upload photo:', error)
  } finally {
    uploading.value = false
  }
}

const resetUploadForm = () => {
  newPhoto.value = {
    category: '',
    notes: '',
    takenAt: new Date().toISOString().split('T')[0],
    customCategory: ''
  }
  selectedFile.value = null
}

const openEditModal = (photo) => {
  editingPhoto.value = {
    id: photo.id,
    category: photo.category || '',
    notes: photo.notes || '',
    takenAt: photo.takenAt ? new Date(photo.takenAt).toISOString().split('T')[0] : ''
  }
  showEditModal.value = true
}

const updatePhoto = async () => {
  try {
    const response = await fetch(`/api/photos/${editingPhoto.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(editingPhoto.value)
    })
    
    if (response.ok) {
      showEditModal.value = false
      await loadPhotos()
      await loadCategories()
    }
  } catch (error) {
    console.error('Failed to update photo:', error)
  }
}

const confirmDeletePhoto = (id) => {
  deletingPhotoId.value = id
  showDeleteConfirm.value = true
}

const deletePhoto = async () => {
  const id = deletingPhotoId.value
  if (!id) return
  
  try {
    const response = await fetch(`/api/photos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    if (response.ok) {
      await loadPhotos()
      await loadCategories()
      if (selectedPhoto.value?.id === id) {
        selectedPhoto.value = null
      }
    }
  } catch (error) {
    console.error('Failed to delete photo:', error)
  } finally {
    showDeleteConfirm.value = false
    deletingPhotoId.value = null
  }
}

const openTimelapse = (category) => {
  const categoryPhotos = photos.value.filter(p => p.category === category)
  if (categoryPhotos.length < 2) {
    alert('You need at least 2 photos in a category to create a timelapse.')
    return
  }
  timelapseIndex.value = 0
  showTimelapseModal.value = true
  setTimeout(() => startTimelapse(categoryPhotos), 100)
}

const startTimelapse = (photoList) => {
  timelapsePlaying.value = true
  timelapseInterval.value = setInterval(() => {
    timelapseIndex.value = (timelapseIndex.value + 1) % photoList.length
  }, 800)
}

const stopTimelapse = () => {
  timelapsePlaying.value = false
  if (timelapseInterval.value) {
    clearInterval(timelapseInterval.value)
    timelapseInterval.value = null
  }
}

const toggleTimelapse = (photoList) => {
  if (timelapsePlaying.value) {
    stopTimelapse()
  } else {
    startTimelapse(photoList)
  }
}

const closeTimelapseModal = () => {
  stopTimelapse()
  showTimelapseModal.value = false
}

const getPhotoUrl = (filename) => {
  return `/uploads/photos/${filename}`
}

const photosByCategory = computed(() => {
  const grouped = {}
  photos.value.forEach(photo => {
    const cat = photo.category || 'Uncategorized'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(photo)
  })
  return grouped
})

const timelapsePhotoList = computed(() => {
  if (selectedCategory.value !== 'all' && photosByCategory.value[selectedCategory.value]) {
    return photosByCategory.value[selectedCategory.value]
  }
  return photos.value
})

const currentTimelapsePhoto = computed(() => {
  const list = timelapsePhotoList.value
  if (list.length === 0) return null
  return list[timelapseIndex.value % list.length]
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h1 class="text-2xl font-bold">
        Photo Journal
      </h1>
      <div class="flex gap-2">
        <select
          v-model="selectedCategory"
          class="input"
          @change="loadPhotos"
        >
          <option value="all">
            All Photos
          </option>
          <option
            v-for="cat in categories"
            :key="cat"
            :value="cat"
          >
            {{ cat }}
          </option>
        </select>
        <button
          class="btn btn-primary"
          @click="showUploadModal = true"
        >
          + Upload Photo
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>

    <div
      v-else-if="photos.length === 0"
      class="card text-center py-12"
    >
      <div class="text-5xl mb-4">
        📷
      </div>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        No photos yet
      </p>
      <p class="text-sm text-gray-500 mb-4">
        Upload your first photo to start tracking your progress
      </p>
      <button
        class="btn btn-primary"
        @click="showUploadModal = true"
      >
        Upload Your First Photo
      </button>
    </div>

    <div
      v-else
      class="space-y-8"
    >
      <div
        v-for="(categoryPhotos, category) in photosByCategory"
        :key="category"
        class="card"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <span>📁</span>
            {{ category }}
            <span class="text-sm font-normal text-gray-500">({{ categoryPhotos.length }} photos)</span>
          </h2>
          <button 
            v-if="categoryPhotos.length >= 2"
            class="btn btn-secondary text-sm" 
            @click="openTimelapse(category)"
          >
            ▶ Timelapse
          </button>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <div
            v-for="photo in categoryPhotos"
            :key="photo.id"
            class="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer"
            @click="selectedPhoto = photo"
          >
            <img
              :src="getPhotoUrl(photo.filename)"
              :alt="photo.notes || 'Progress photo'"
              class="w-full h-full object-cover"
            >
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                class="p-2 bg-white rounded-full hover:bg-gray-100"
                @click.stop="openEditModal(photo)"
              >
                ✏️
              </button>
              <button
                class="p-2 bg-white rounded-full hover:bg-gray-100"
                @click.stop="confirmDeletePhoto(photo.id)"
              >
                🗑️
              </button>
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p class="text-white text-xs">
                {{ photo.takenAt ? new Date(photo.takenAt).toLocaleDateString() : 'No date' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="categories.length >= 2"
        class="card bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
      >
        <h2 class="text-lg font-semibold mb-2">
          🎬 Create a Timelapse
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select a category to watch your progress as a timelapse animation
        </p>
        <select
          v-model="selectedCategory"
          class="input max-w-xs"
          @change="loadPhotos"
        >
          <option
            v-for="cat in categories"
            :key="cat"
            :value="cat"
          >
            {{ cat }}
          </option>
        </select>
        <button 
          v-if="photosByCategory[selectedCategory]?.length >= 2"
          class="btn btn-primary mt-4" 
          @click="openTimelapse(selectedCategory)"
        >
          ▶ Play Timelapse
        </button>
      </div>
    </div>

    <div
      v-if="selectedPhoto"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      @click.self="selectedPhoto = null"
    >
      <div class="max-w-4xl max-h-[90vh]">
        <button
          class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
          @click="selectedPhoto = null"
        >
          ✕
        </button>
        <img
          :src="getPhotoUrl(selectedPhoto.filename)"
          :alt="selectedPhoto.notes || 'Progress photo'"
          class="max-w-full max-h-[85vh] rounded-lg"
        >
        <div class="mt-4 text-white text-center">
          <p
            v-if="selectedPhoto.category"
            class="text-lg"
          >
            {{ selectedPhoto.category }}
          </p>
          <p
            v-if="selectedPhoto.notes"
            class="text-sm text-gray-300"
          >
            {{ selectedPhoto.notes }}
          </p>
          <p class="text-sm text-gray-400 mt-1">
            {{ selectedPhoto.takenAt ? new Date(selectedPhoto.takenAt).toLocaleDateString() : 'No date' }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="showUploadModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showUploadModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-semibold mb-4">
          Upload Photo
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Photo</label>
            <input
              type="file"
              accept="image/*"
              class="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              @change="handleFileSelect"
            >
            <p
              v-if="selectedFile"
              class="text-sm text-green-600 mt-1"
            >
              Selected: {{ selectedFile.name }}
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Category</label>
            <div class="flex gap-2">
              <select
                v-model="newPhoto.category"
                class="input flex-1"
              >
                <option value="">
                  Select existing
                </option>
                <option
                  v-for="cat in categories"
                  :key="cat"
                  :value="cat"
                >
                  {{ cat }}
                </option>
              </select>
            </div>
            <input
              v-model="newPhoto.customCategory"
              type="text"
              class="input w-full mt-2"
              placeholder="Or enter new category"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Date Taken</label>
            <input
              v-model="newPhoto.takenAt"
              type="date"
              class="input w-full"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Notes</label>
            <textarea
              v-model="newPhoto.notes"
              class="input w-full"
              rows="2"
              placeholder="Optional notes..."
            />
          </div>
        </div>
        
        <div class="flex gap-2 mt-6">
          <button 
            class="btn btn-primary flex-1" 
            :disabled="!selectedFile || uploading"
            @click="submitUpload"
          >
            {{ uploading ? 'Uploading...' : 'Upload' }}
          </button>
          <button
            class="btn btn-secondary flex-1"
            @click="showUploadModal = false"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showEditModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-semibold mb-4">
          Edit Photo
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Category</label>
            <input
              v-model="editingPhoto.category"
              type="text"
              class="input w-full"
              placeholder="Category"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Date Taken</label>
            <input
              v-model="editingPhoto.takenAt"
              type="date"
              class="input w-full"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Notes</label>
            <textarea
              v-model="editingPhoto.notes"
              class="input w-full"
              rows="2"
            />
          </div>
        </div>
        
        <div class="flex gap-2 mt-6">
          <button
            class="btn btn-primary flex-1"
            @click="updatePhoto"
          >
            Save Changes
          </button>
          <button
            class="btn btn-secondary flex-1"
            @click="showEditModal = false"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showTimelapseModal"
      class="fixed inset-0 bg-black flex items-center justify-center z-50"
      @click.self="closeTimelapseModal"
    >
      <button
        class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
        @click="closeTimelapseModal"
      >
        ✕
      </button>
      
      <div class="absolute bottom-4 left-0 right-0 text-center text-white z-10">
        <p class="text-lg font-semibold">
          {{ currentTimelapsePhoto?.category }}
        </p>
        <p class="text-sm">
          {{ timelapseIndex + 1 }} / {{ timelapsePhotoList.length }}
          • {{ currentTimelapsePhoto?.takenAt ? new Date(currentTimelapsePhoto.takenAt).toLocaleDateString() : '' }}
        </p>
        <button
          class="btn mt-2"
          @click="toggleTimelapse(timelapsePhotoList)"
        >
          {{ timelapsePlaying ? '⏸ Pause' : '▶ Play' }}
        </button>
      </div>
      
      <div
        v-if="currentTimelapsePhoto"
        class="relative"
      >
        <img
          :key="timelapseIndex"
          :src="getPhotoUrl(currentTimelapsePhoto.filename)"
          :alt="'Timelapse frame ' + (timelapseIndex + 1)"
          class="max-h-[80vh] max-w-[90vw] object-contain"
        >
      </div>
      
      <div class="absolute bottom-20 left-1/2 -translate-x-1/2 w-64">
        <input
          v-model.number="timelapseIndex"
          type="range"
          :min="0"
          :max="timelapsePhotoList.length - 1"
          class="w-full"
        >
      </div>
    </div>

    <ConfirmModal
      :show="showDeleteConfirm"
      title="Delete Photo"
      message="Are you sure you want to delete this photo? This action cannot be undone."
      confirm-text="Delete"
      confirm-class="btn-danger"
      @update:show="showDeleteConfirm = $event"
      @confirm="deletePhoto"
    />
  </div>
</template>
