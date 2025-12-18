<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
      <LayoutDashboard class="w-8 h-8 text-primary-600" />
      Dashboard Analytics
    </h1>

    <!-- Filters Card -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <CalendarRange class="w-5 h-5 text-gray-500" />
        Date Range Filter
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
           <VueDatePicker 
            v-model="dateRange" 
            range 
            :enable-time-picker="false"
            :format="formatRange"
            auto-apply
            @update:model-value="handleDateChange"
            input-class-name="dp-custom-input"
          />
        </div>
        <div>
          <button 
            @click="setLastMonth" 
            class="w-full md:w-auto px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <History class="w-4 h-4" />
            Last 30 Days
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading dashboard data...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Records -->
        <div class="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div class="p-3 rounded-full bg-blue-50">
            <Database class="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <div class="text-xl font-bold text-gray-800">{{ dashboardData.total }}</div>
            <div class="text-gray-600 text-sm font-medium">Total Records</div>
          </div>
        </div>

        <!-- Top Category -->
        <div v-if="dashboardData.top_category" class="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
          <div class="p-3 rounded-full bg-yellow-50">
            <Trophy class="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <div class="text-xl font-bold text-gray-800">{{ dashboardData.top_category.category }}</div>
            <div class="text-gray-600 text-sm font-medium">Top Category ({{ dashboardData.top_category.count }})</div>
          </div>
        </div>

        <!-- Latest Record -->
        <div v-if="dashboardData.latest_record" class="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div class="p-3 rounded-full bg-green-50">
            <Clock class="w-8 h-8 text-green-500" />
          </div>
          <div>
            <div class="text-xl font-bold text-gray-800">{{ formatDate(dashboardData.latest_record.release_date) }}</div>
            <div class="text-gray-600 text-sm font-medium">Latest Record</div>
          </div>
        </div>

        <!-- Total Categories -->
        <div class="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <div class="p-3 rounded-full bg-purple-50">
            <FolderOpen class="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <div class="text-xl font-bold text-gray-800">{{ categoryCount }}</div>
            <div class="text-gray-600 text-sm font-medium">Total Categories</div>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Pie Chart -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
            <PieChart class="w-5 h-5 text-gray-500" />
            Category Distribution
          </h3>
          <Pie :data="pieChartData" :options="chartOptions" />
        </div>

        <!-- Bar Chart -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
            <TrendingUp class="w-5 h-5 text-gray-500" />
            Daily Records
          </h3>
          <Bar :data="barChartData" :options="barChartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Pie, Bar } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import api from './services/api';
import { format, subMonths } from 'date-fns';
import { useDialog } from './composables/useDialog';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { 
  LayoutDashboard, 
  CalendarRange, 
  History, 
  Database, 
  Trophy, 
  Clock, 
  FolderOpen, 
  PieChart, 
  TrendingUp 
} from 'lucide-vue-next';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default {
  name: 'Dashboard',
  components: { 
    Pie, 
    Bar,
    VueDatePicker,
    LayoutDashboard, 
    CalendarRange, 
    History, 
    Database, 
    Trophy, 
    Clock, 
    FolderOpen, 
    PieChart, 
    TrendingUp
  },
  setup() {
    const { showAlert } = useDialog();
    return { showAlert };
  },
  data() {
    const endDate = new Date();
    const startDate = subMonths(endDate, 1);
    
    return {
      loading: false,
      dateRange: [startDate, endDate],
      dateFrom: format(startDate, 'yyyy-MM-dd'),
      dateTo: format(endDate, 'yyyy-MM-dd'),
      dashboardData: {
        total: 0,
        category_distribution: [],
        daily_data: [],
        top_category: null,
        latest_record: null
      }
    };
  },
  computed: {
    categoryCount() {
      return this.dashboardData.category_distribution.length;
    },
    pieChartData() {
      return {
        labels: this.dashboardData.category_distribution.map(c => c.category),
        datasets: [{
          data: this.dashboardData.category_distribution.map(c => c.count),
          backgroundColor: [
            '#667eea',
            '#764ba2',
            '#f093fb',
            '#4facfe',
            '#43e97b'
          ]
        }]
      };
    },
    barChartData() {
      return {
        labels: this.dashboardData.daily_data.map(d => this.formatDate(d.date)),
        datasets: [{
          label: 'Records',
          data: this.dashboardData.daily_data.map(d => d.count),
          backgroundColor: '#667eea'
        }]
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      };
    },
    barChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      };
    }
  },
  mounted() {
    this.fetchDashboard();
  },
  methods: {
    formatRange(date) {
      const start = format(date[0], 'MMM dd, yyyy');
      const end = format(date[1], 'MMM dd, yyyy');
      return `${start} - ${end}`;
    },
    
    handleDateChange(dates) {
      if (dates && dates[0] && dates[1]) {
        this.dateFrom = format(dates[0], 'yyyy-MM-dd');
        this.dateTo = format(dates[1], 'yyyy-MM-dd');
        this.fetchDashboard();
      }
    },

    async fetchDashboard() {
      this.loading = true;
      try {
        const response = await api.getDashboard({
          date_from: this.dateFrom,
          date_to: this.dateTo
        });
        this.dashboardData = response.data;
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        this.showAlert('Failed to load dashboard data', 'error');
      } finally {
        this.loading = false;
      }
    },
    setLastMonth() {
      const endDate = new Date();
      const startDate = subMonths(endDate, 1);
      this.dateRange = [startDate, endDate];
      this.handleDateChange(this.dateRange);
    },
    formatDate(date) {
      return format(new Date(date), 'MMM dd, yyyy');
    }
  }
};
</script>

<style>
/* Override VueDatePicker styles to match Tailwind theme */
.dp__theme_light {
  --dp-primary-color: #667eea;
  --dp-primary-text-color: #ffffff;
  --dp-secondary-color: #c0c4cc;
  --dp-secondary-text-color: #606266;
  --dp-background-color: #ffffff;
  --dp-text-color: #374151;
  --dp-hover-color: #f3f4f6;
  --dp-hover-text-color: #374151;
  --dp-hover-icon-color: #959595;
  --dp-primary-disabled-color: #6b7a99;
  --dp-primary-text-disabled-color: #f6f6f6;
  --dp-secondary-disabled-color: #c0c4cc;
  --dp-border-color: #d1d5db;
  --dp-menu-border-color: #d1d5db;
  --dp-border-color-hover: #667eea;
  --dp-disabled-color: #f6f6f6;
  --dp-scroll-bar-background: #f3f3f3;
  --dp-scroll-bar-color: #959595;
  --dp-success-color: #76d275;
  --dp-success-color-disabled: #a3d9b1;
  --dp-icon-color: #9ca3af;
  --dp-danger-color: #ff6f60;
  --dp-marker-color: #ff6f60;
  --dp-tooltip-color: #fafafa;
  --dp-disabled-color-text: #8e8e8e;
  --dp-highlight-color: rgb(25 118 210 / 10%);
  --dp-range-between-dates-background-color: var(--dp-hover-color, #f3f4f6);
  --dp-range-between-dates-text-color: var(--dp-hover-text-color, #374151);
  --dp-width: 100%; /* Important to make it responsive */
}

.dp-custom-input {
  box-shadow: none;
  border-radius: 0.5rem; /* rounded-lg */
  height: 42px; /* standard input height */
  font-family: inherit;
}

.dp__input {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: 0.95rem;
}
</style>