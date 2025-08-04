<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const students = ref([]);
const selectedStudent = ref(null); // Changed to store student object instead of string
const searchQuery = ref('');
const isLoading = ref(false);
const message = ref('');
const messageType = ref(''); // 'success' or 'error'
const userHasLunch = ref(false);

// Computed property for filtered students
const filteredStudents = computed(() => {
  if (!searchQuery.value) return students.value;
  return students.value.filter(student =>
    student.full_name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('is_authenticated');
  if (!isAuthenticated) {
    router.push('/');
    return;
  }

  // Check if user has lunch to gift
  await checkUserLunchStatus();

  // Load students list
  await loadStudents();
});

async function checkUserLunchStatus() {
  try {
    const response = await fetch('/api/user-info', {
      credentials: 'include'
    });

    if (response.ok) {
      const userData = await response.json();
      userHasLunch.value = userData.lunch?.hasLunch || false;

      if (!userHasLunch.value) {
        message.value = "You don't have lunch to gift.";
        messageType.value = 'error';
      }
    }
  } catch (error) {
    console.error('Error checking lunch status:', error);
  }
}

async function loadStudents() {
  try {
    isLoading.value = true;
    const response = await fetch('/api/students', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      students.value = data.students || [];
    } else {
      message.value = 'Failed to load students list.';
      messageType.value = 'error';
    }
  } catch (error) {
    console.error('Error loading students:', error);
    message.value = 'Error loading students list.';
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
}

async function giftLunch() {
  if (!selectedStudent.value) {
    message.value = 'Please select a student to gift your lunch to.';
    messageType.value = 'error';
    return;
  }

  if (!userHasLunch.value) {
    message.value = "You don't have lunch to gift.";
    messageType.value = 'error';
    return;
  }

  try {
    isLoading.value = true;
    const response = await fetch('/api/give_lunch_direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        student_id: selectedStudent.value.id, // Send student ID instead of name
      })
    });

    if (response.ok) {
      const data = await response.json();
      message.value = `Successfully gifted your lunch to ${selectedStudent.value.full_name}!`;
      messageType.value = 'success';
      userHasLunch.value = false;
      selectedStudent.value = null;

      // Update localStorage to reflect that user no longer has lunch
      localStorage.removeItem('lunchNumber');
    } else {
      const errorData = await response.json();
      message.value = errorData.error || 'Failed to gift lunch.';
      messageType.value = 'error';
    }
  } catch (error) {
    console.error('Error gifting lunch:', error);
    message.value = 'Error occurred while gifting lunch.';
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
}

function goBack() {
  router.push('/dashboard');
}

function clearMessage() {
  message.value = '';
  messageType.value = '';
}
</script>

<template>
  <main class="gift-lunch-main">
    <div class="gift-lunch-card">
      <button class="gift-lunch-back-btn" @click="goBack">
        ← Back to Dashboard
      </button>

      <h2 class="gift-lunch-title">Gift Your Lunch</h2>
      <p class="gift-lunch-subtitle">Select a student to gift your lunch to</p>

      <!-- Message display -->
      <div v-if="message" class="gift-lunch-message" :class="messageType" @click="clearMessage">
        {{ message }}
        <span class="message-close">×</span>
      </div>

      <!-- Search bar -->
      <div class="gift-lunch-search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for a student..."
          class="gift-lunch-search-input"
          :disabled="!userHasLunch"
        />
      </div>

      <!-- Students list -->
      <div v-if="userHasLunch" class="gift-lunch-students">
        <div v-if="isLoading" class="gift-lunch-loading">
          Loading students...
        </div>

        <div v-else-if="filteredStudents.length === 0" class="gift-lunch-no-results">
          <p v-if="searchQuery">No students found matching "{{ searchQuery }}"</p>
          <p v-else>No students available</p>
        </div>

        <div v-else class="gift-lunch-student-list">
          <div
            v-for="student in filteredStudents"
            :key="student.id"
            class="gift-lunch-student-item"
            :class="{ selected: selectedStudent && selectedStudent.id === student.id }"
            @click="selectedStudent = student"
          >
            <span class="student-name">{{ student.full_name }}</span>
            <span v-if="selectedStudent && selectedStudent.id === student.id" class="selected-indicator">✓</span>
          </div>
        </div>
      </div>

      <!-- Gift button -->
      <div class="gift-lunch-actions">
        <button
          v-if="userHasLunch"
          @click="giftLunch"
          :disabled="!selectedStudent || isLoading"
          class="gift-lunch-btn gift-lunch-btn-primary"
        >
          {{ isLoading ? 'Gifting...' : 'Gift Lunch' }}
        </button>

        <div v-else class="gift-lunch-no-lunch">
          <p>You don't have lunch to gift today.</p>
          <button @click="goBack" class="gift-lunch-btn gift-lunch-btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.gift-lunch-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 12px 24px 12px;
}

.gift-lunch-card {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(239,68,68,0.08), 0 1.5px 8px rgba(0,0,0,0.04);
  padding: 40px 32px;
  max-width: 500px;
  width: 100%;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
  transition: box-shadow 0.2s;
}

.gift-lunch-card:hover {
  box-shadow: 0 8px 32px rgba(239,68,68,0.13), 0 2px 12px rgba(0,0,0,0.07);
}

.gift-lunch-back-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 8px 0;
  transition: color 0.2s;
}

.gift-lunch-back-btn:hover {
  color: #ef4444;
}

.gift-lunch-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 8px;
  text-align: center;
  letter-spacing: -0.5px;
}

.gift-lunch-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 24px;
}

.gift-lunch-message {
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  cursor: pointer;
  position: relative;
  font-weight: 500;
}

.gift-lunch-message.success {
  background: linear-gradient(90deg, #dcfce7 60%, #bbf7d0 100%);
  color: #15803d;
}

.gift-lunch-message.error {
  background: linear-gradient(90deg, #fee2e2 60%, #fecaca 100%);
  color: #b91c1c;
}

.message-close {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  opacity: 0.7;
}

.gift-lunch-search {
  margin-bottom: 24px;
}

.gift-lunch-search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.gift-lunch-search-input:focus {
  outline: none;
  border-color: #ef4444;
}

.gift-lunch-search-input:disabled {
  background: #f3f4f6;
  color: #9ca3af;
}

.gift-lunch-students {
  margin-bottom: 24px;
}

.gift-lunch-loading, .gift-lunch-no-results {
  text-align: center;
  color: #6b7280;
  padding: 20px;
  font-style: italic;
}

.gift-lunch-student-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.gift-lunch-student-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gift-lunch-student-item:last-child {
  border-bottom: none;
}

.gift-lunch-student-item:hover {
  background: #f9fafb;
}

.gift-lunch-student-item.selected {
  background: linear-gradient(90deg, #dbeafe 60%, #bfdbfe 100%);
  color: #1d4ed8;
}

.student-name {
  font-weight: 500;
}

.selected-indicator {
  color: #10b981;
  font-weight: bold;
  font-size: 1.1rem;
}

.gift-lunch-actions {
  text-align: center;
}

.gift-lunch-btn {
  display: inline-block;
  padding: 13px 28px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  border: none;
  cursor: pointer;
  transition: all 0.18s;
  outline: none;
  min-width: 140px;
}

.gift-lunch-btn-primary {
  background: linear-gradient(90deg, #ef4444 70%, #b91c1c 100%);
  background-size: 300% 100%;
  background-position: 50% 100%;
  transition: background-position 0.4s, transform 0.18s;
  color: #fff;
}

.gift-lunch-btn-primary:hover:not(:disabled) {
  background-position: 100% 20%;
  transform: translateY(-2px) scale(1.04);
}

.gift-lunch-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.gift-lunch-btn-secondary {
  background: linear-gradient(90deg, #6b7280 70%, #4b5563 100%);
  background-size: 300% 100%;
  background-position: 50% 100%;
  transition: background-position 0.4s, transform 0.18s;
  color: #fff;
}

.gift-lunch-btn-secondary:hover {
  background-position: 100% 20%;
  transform: translateY(-2px) scale(1.04);
}

.gift-lunch-no-lunch {
  text-align: center;
  color: #6b7280;
}

.gift-lunch-no-lunch p {
  margin-bottom: 20px;
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 640px) {
  .gift-lunch-card {
    padding: 24px 20px;
    border-radius: 16px;
  }

  .gift-lunch-title {
    font-size: 1.8rem;
  }

  .gift-lunch-subtitle {
    font-size: 1rem;
  }

  .gift-lunch-student-list {
    max-height: 250px;
  }

  .gift-lunch-btn {
    width: 100%;
  }
}
</style>
