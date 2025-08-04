<!-- PublicPool.vue -->
<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const poolLunches = ref([]);
    const userHasLunch = ref(false);

    onMounted(() => {
      fetchPoolLunches();
      checkUserLunchStatus();
    });

    const goBack = () => {
      router.push('/dashboard');
    };

    const checkUserLunchStatus = async () => {
      if (localStorage.getItem('lunchNumber')) {
        userHasLunch.value = true;
        return true;
      }
      else return false;
    };

    const fetchPoolLunches = async () => {
      const response = await fetch('/api/lunches');
      if (!response.ok) throw new Error('Failed to fetch lunch pool');
      const data = await response.json();
      poolLunches.value = Object.entries(data).map(([name, quantity]) => ({
        name,
        quantity
      }));
    };

    const grabLunch = async (lunchId) => {
      try {
        const response = await fetch('/api/request_lunch', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lunch_id: lunchId
          }),
        });
        fetchPoolLunches();
        userHasLunch.value = true;
      } catch (error) {
        console.error('Error grabbing lunch:', error);
      }
    }

    const giftLunch = async () => {
      try {
        const response = await fetch('/api/give_lunch', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to gift lunch');
        await fetchPoolLunches();
        userHasLunch.value = false;
        fetchPoolLunches();
      } catch (error) {
        console.error('Error gifting lunch:', error);
      }
    };

    return { poolLunches, userHasLunch, grabLunch, giftLunch, goBack };
  },
};
</script>

<template>
  <main class="public-pool-main">
    <div class="public-pool-card">
      <button class="public-pool-back-btn" @click="goBack">
        ← Back to Dashboard
      </button>
      <h2 class="public-pool-title">Public Lunch Pool</h2>
      <ul class="public-pool-list">
        <li v-for="lunch in poolLunches" :key="lunch.name" class="public-pool-list-item">
          <span class="public-pool-lunch-name">{{ lunch.name }}</span>
          <span class="public-pool-lunch-qty">x{{ lunch.quantity }}</span>
          <button
            v-if="!userHasLunch"
            @click="grabLunch(lunch.name.split(' ')[1])"
            class="public-pool-btn public-pool-btn-green"
          >
            Grab
          </button>
        </li>
      </ul>
      <div class="public-pool-actions">
        <button
            v-if="userHasLunch"
            @click="giftLunch"
            class="public-pool-btn public-pool-btn-blue"
        >
          Gift My Lunch
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
@keyframes gradientMove {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.public-pool-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 12px 24px 12px;
}

.public-pool-card {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(239,68,68,0.08), 0 1.5px 8px rgba(0,0,0,0.04);
  padding: 40px 32px;
  max-width: 440px;
  width: 100%;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
  transition: box-shadow 0.2s;
}
.public-pool-card:hover {
  box-shadow: 0 8px 32px rgba(239,68,68,0.13), 0 2px 12px rgba(0,0,0,0.07);
}

.public-pool-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 18px;
  text-align: center;
  letter-spacing: -0.5px;
}

.public-pool-actions {
  text-align: center;
  margin-bottom: 18px;
}

.public-pool-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.public-pool-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #f9fafb 60%, #f3f4f6 100%);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(239,68,68,0.04);
  font-size: 1.1rem;
}

.public-pool-lunch-name {
  font-weight: 600;
  color: #ef4444;
}

.public-pool-lunch-qty {
  color: #6b7280;
  margin: 0 16px;
  font-size: 1rem;
}

.public-pool-btn {
  display: inline-block;
  margin: 0 0 0 8px;
  padding: 10px 22px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  border: none;
  cursor: pointer;
  transition: background 0.18s, transform 0.18s;
  outline: none;
}

.public-pool-btn-blue {
  background: linear-gradient(90deg, #3b82f6 70%, #2563eb 100%);
  color: #fff;
}
.public-pool-btn-blue:hover {
  background-position: 100% 20%;
  transform: translateY(-2px) scale(1.04);
}

.public-pool-btn-green {
  background: linear-gradient(90deg, #22c55e 70%, #16a34a 100%);
  color: #fff;
}
.public-pool-btn-green:hover {
  background-position: 100% 20%;
  transform: translateY(-2px) scale(1.04);
}

.public-pool-back-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 8px 0;
  transition: color 0.2s;
}

.public-pool-back-btn:hover {
  color: #ef4444;
}

@media (max-width: 640px) {
  .public-pool-card {
    padding: 18px 8px;
    border-radius: 16px;
  }
  .public-pool-title {
    font-size: 1.3rem;
  }
  .public-pool-list-item {
    font-size: 1rem;
    padding: 10px 8px;
  }
}
</style>
