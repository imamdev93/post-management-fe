<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
        <Database class="w-8 h-8 text-primary-600" />
        Data Management
      </h1>
      <div class="flex gap-4">
        <button 
          @click="syncData" 
          :disabled="syncing"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': syncing }" />
          {{ syncing ? 'Syncing...' : 'Sync Data' }}
        </button>
        <button 
          @click="openCreateModal" 
          class="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg text-white rounded-lg transition-all flex items-center gap-2"
        >
          <Plus class="w-5 h-5" />
          Add New
        </button>
      </div>
    </div>

    <!-- Sync Info -->
    <div v-if="lastSync" class="bg-white rounded-xl shadow-sm p-4 mb-6 flex justify-between items-center bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-100">
      <div class="flex items-center gap-2 text-gray-700">
        <Clock class="w-4 h-4 text-primary-500" />
        <span>Last sync: {{ formatDateTime(lastSync.synced_at) }}</span>
      </div>
      <div class="flex items-center gap-2">
         <span 
          :class="[
            'px-3 py-1 rounded-full text-xs font-semibold uppercase flex items-center gap-1.5',
            lastSync.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          ]"
        >
          <CheckCircle v-if="lastSync.status === 'success'" class="w-3 h-3" />
          <XCircle v-else class="w-3 h-3" />
          {{ lastSync.status }}
        </span>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div class="relative">
            <input 
              type="text" 
              v-model="filters.search" 
              @input="debouncedSearch"
              placeholder="Search title or body..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
            <Search class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div class="relative">
            <select 
              v-model="filters.category" 
              @change="fetchPosts"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
            >
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <Folder class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <ChevronDown class="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div class="lg:col-span-2">
           <label class="block text-sm font-medium text-gray-700 mb-2">Select Period</label>
           <VueDatePicker 
            v-model="dateRange" 
            range 
            :enable-time-picker="false"
            :format="formatRange"
            auto-apply
            @update:model-value="handleDateChange"
            input-class-name="dp-custom-input"
            placeholder="Select period"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading data...</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th @click="sortBy('id')" class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group">
                <div class="flex items-center gap-1">
                  ID 
                  <span v-if="filters.sort_by === 'id'" class="text-primary-600">
                    <ChevronUp v-if="filters.sort_order === 'asc'" class="w-4 h-4" />
                    <ChevronDown v-else class="w-4 h-4" />
                  </span>
                  <div v-else class="w-4 h-4 opacity-0 group-hover:opacity-30"><ChevronUp class="w-4 h-4" /></div>
                </div>
              </th>
              <th @click="sortBy('title')" class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group">
                 <div class="flex items-center gap-1">
                  Title
                  <span v-if="filters.sort_by === 'title'" class="text-primary-600">
                    <ChevronUp v-if="filters.sort_order === 'asc'" class="w-4 h-4" />
                    <ChevronDown v-else class="w-4 h-4" />
                  </span>
                  <div v-else class="w-4 h-4 opacity-0 group-hover:opacity-30"><ChevronUp class="w-4 h-4" /></div>
                </div>
              </th>
              <th @click="sortBy('category')" class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group">
                 <div class="flex items-center gap-1">
                  Category
                  <span v-if="filters.sort_by === 'category'" class="text-primary-600">
                    <ChevronUp v-if="filters.sort_order === 'asc'" class="w-4 h-4" />
                    <ChevronDown v-else class="w-4 h-4" />
                  </span>
                  <div v-else class="w-4 h-4 opacity-0 group-hover:opacity-30"><ChevronUp class="w-4 h-4" /></div>
                </div>
              </th>
              <th @click="sortBy('release_date')" class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group">
                 <div class="flex items-center gap-1">
                  Release Date
                  <span v-if="filters.sort_by === 'release_date'" class="text-primary-600">
                    <ChevronUp v-if="filters.sort_order === 'asc'" class="w-4 h-4" />
                    <ChevronDown v-else class="w-4 h-4" />
                  </span>
                  <div v-else class="w-4 h-4 opacity-0 group-hover:opacity-30"><ChevronUp class="w-4 h-4" /></div>
                </div>
              </th>
              <th @click="sortBy('updated_at')" class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group">
                 <div class="flex items-center gap-1">
                  Last Updated
                  <span v-if="filters.sort_by === 'updated_at'" class="text-primary-600">
                    <ChevronUp v-if="filters.sort_order === 'asc'" class="w-4 h-4" />
                    <ChevronDown v-else class="w-4 h-4" />
                  </span>
                  <div v-else class="w-4 h-4 opacity-0 group-hover:opacity-30"><ChevronUp class="w-4 h-4" /></div>
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ post.id }}</td>
              <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ truncate(post.title, 50) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 inline-flex items-center gap-1.5 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200 rounded-full text-xs font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                  {{ post.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(post.release_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDateTime(post.updated_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex gap-3">
                  <button @click="openEditModal(post)" class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <Pencil class="w-5 h-5" />
                  </button>
                  <button @click="deletePost(post.id)" class="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="text-sm text-gray-700">
          Showing page <span class="font-medium">{{ pagination.current_page }}</span> of <span class="font-medium">{{ pagination.last_page }}</span>
        </div>
        <div class="flex gap-2">
          <button 
            @click="changePage(pagination.current_page - 1)" 
            :disabled="pagination.current_page === 1"
            class="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft class="w-4 h-4" />
            Previous
          </button>
          <button 
            @click="changePage(pagination.current_page + 1)" 
            :disabled="pagination.current_page === pagination.last_page"
            class="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] backdrop-blur-sm p-4" @click.self="closeModal">
      <div class="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
        <!-- Modal Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div class="p-2 bg-primary-50 rounded-lg">
              <Pencil v-if="editMode" class="w-6 h-6 text-primary-600" />
              <Plus v-else class="w-6 h-6 text-primary-600" />
            </div>
            {{ editMode ? 'Edit Post' : 'Create Post' }}
          </h2>
          <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <!-- Form -->
        <form @submit.prevent="savePost" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title <span class="text-red-500">*</span></label>
            <input 
              type="text" 
              v-model="form.title" 
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="Enter post title"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Body <span class="text-red-500">*</span></label>
            <textarea 
              v-model="form.body" 
              rows="5" 
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-vertical"
              placeholder="Enter post content..."
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category <span class="text-red-500">*</span></label>
              <div class="relative">
                <select 
                  v-model="form.category" 
                  required
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all appearance-none bg-white"
                >
                  <option value="">Select Category</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <ChevronDown class="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Release Date <span class="text-red-500">*</span></label>
              <input 
                type="date" 
                v-model="form.release_date" 
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">User ID <span class="text-red-500">*</span></label>
            <input 
              type="number" 
              v-model.number="form.user_id" 
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            >
          </div>

          <!-- Modal Actions -->
          <div class="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button 
              type="button" 
              @click="closeModal" 
              class="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg hover:shadow-primary-500/30 text-white font-medium rounded-lg transition-all transform active:scale-95"
            >
              {{ editMode ? 'Update Post' : 'Create Post' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from './services/api';
import { format } from 'date-fns';
import { useDialog } from './composables/useDialog';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { 
  Database, RefreshCw, Plus, Clock, CheckCircle, XCircle, Search, Folder, Calendar, 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Pencil, Trash2, X 
} from 'lucide-vue-next';

export default {
  name: 'PostManagement',
  components: {
    VueDatePicker,
    Database, RefreshCw, Plus, Clock, CheckCircle, XCircle, Search, Folder, Calendar,
    ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Pencil, Trash2, X
  },
  setup() {
    const { showAlert, showConfirm } = useDialog();
    return { showAlert, showConfirm };
  },
  data() {
    return {
      loading: false,
      syncing: false,
      posts: [],
      categories: [],
      lastSync: null,
      pagination: {},
      dateRange: null,
      filters: {
        search: '',
        category: '',
        date_from: '',
        date_to: '',
        sort_by: 'updated_at',
        sort_order: 'desc',
        page: 1
      },
      showModal: false,
      editMode: false,
      form: {
        title: '',
        body: '',
        category: '',
        release_date: '',
        user_id: 1
      },
      editingId: null,
      searchTimeout: null
    };
  },
  mounted() {
    this.fetchPosts();
    this.fetchCategories();
    this.fetchLastSync();
  },
  methods: {
    handleDateChange(dates) {
      if (dates && dates[0] && dates[1]) {
        this.filters.date_from = format(dates[0], 'yyyy-MM-dd');
        this.filters.date_to = format(dates[1], 'yyyy-MM-dd');
      } else {
        this.filters.date_from = '';
        this.filters.date_to = '';
      }
      this.fetchPosts();
    },

    formatRange(date) {
      const start = format(date[0], 'MMM dd, yyyy');
      const end = format(date[1], 'MMM dd, yyyy');
      return `${start} - ${end}`;
    },

    async fetchPosts() {
      this.loading = true;
      try {
        const response = await api.getPosts(this.filters);
        this.posts = response.data.data;
        this.pagination = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total
        };
      } catch (error) {
        console.error('Error fetching posts:', error);
        this.showAlert('Failed to load posts', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async fetchCategories() {
      try {
        const response = await api.getCategories();
        this.categories = response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },

    async fetchLastSync() {
      try {
        const response = await api.getLastSync();
        this.lastSync = response.data;
      } catch (error) {
        console.error('Error fetching last sync:', error);
      }
    },

    async syncData() {
      const confirmed = await this.showConfirm('Sync data from API? This may take a moment.', {
        title: 'Confirm Sync',
        type: 'info',
        confirmText: 'Sync Now',
        cancelText: 'Cancel'
      });
      
      if (!confirmed) return;
      
      this.syncing = true;
      try {
        const response = await api.syncData();
        this.showAlert(response.data.message, 'success');
        await this.fetchPosts();
        await this.fetchLastSync();
      } catch (error) {
        console.error('Error syncing data:', error);
        this.showAlert('Failed to sync data', 'error');
      } finally {
        this.syncing = false;
      }
    },

    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.filters.page = 1;
        this.fetchPosts();
      }, 500);
    },

    sortBy(column) {
      if (this.filters.sort_by === column) {
        this.filters.sort_order = this.filters.sort_order === 'asc' ? 'desc' : 'asc';
      } else {
        this.filters.sort_by = column;
        this.filters.sort_order = 'asc';
      }
      this.fetchPosts();
    },

    changePage(page) {
      this.filters.page = page;
      this.fetchPosts();
    },

    openCreateModal() {
      this.editMode = false;
      this.form = {
        title: '',
        body: '',
        category: '',
        release_date: format(new Date(), 'yyyy-MM-dd'),
        user_id: 1
      };
      this.showModal = true;
    },

    openEditModal(post) {
      this.editMode = true;
      this.editingId = post.id;
      this.form = {
        title: post.title,
        body: post.body,
        category: post.category,
        release_date: post.release_date,
        user_id: post.user_id
      };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.editMode = false;
      this.editingId = null;
    },

    async savePost() {
      try {
        if (this.editMode) {
          await api.updatePost(this.editingId, this.form);
          this.showAlert('Post updated successfully', 'success');
        } else {
          await api.createPost(this.form);
          this.showAlert('Post created successfully', 'success');
        }
        this.closeModal();
        this.fetchPosts();
      } catch (error) {
        console.error('Error saving post:', error);
        this.showAlert('Failed to save post', 'error');
      }
    },

    async deletePost(id) {
      const confirmed = await this.showConfirm('Are you sure you want to delete this post?', {
        title: 'Confirm Delete',
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      });
      
      if (!confirmed) return;
      
      try {
        await api.deletePost(id);
        this.showAlert('Post deleted successfully', 'success');
        this.fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        this.showAlert('Failed to delete post', 'error');
      }
    },

    formatDate(date) {
      return format(new Date(date), 'MMM dd, yyyy');
    },

    formatDateTime(datetime) {
      return format(new Date(datetime), 'MMM dd, yyyy HH:mm');
    },

    truncate(text, length) {
      return text.length > length ? text.substring(0, length) + '...' : text;
    }
  }
};
</script>

<style scoped>
/* Override styles globally in Dashboard.vue or style.css, but this is scoped for Post specific/fallback */
:deep(.dp-custom-input) {
  box-shadow: none;
  border-radius: 0.5rem;
  height: 42px;
  font-family: inherit;
  border-color: #d1d5db;
}
:deep(.dp-custom-input:hover) {
  border-color: #d1d5db;
}
:deep(.dp-custom-input:focus) {
  border-color: #6366f1; /* primary-500 */
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}
</style>