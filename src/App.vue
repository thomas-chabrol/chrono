<template>
  <div class="container">
    <div v-if="!isTimerStarted" class="duration-selector">
      <h2>Choisissez la durée</h2>
      
      <div class="time-inputs">
        <div class="time-input-group">
          <div class="duration-controls">
            <button @click="minutes = Math.max(0, minutes - 1)" class="control-button">-</button>
            <div class="time-display">
              <span class="duration-display">{{ minutes }}</span>
              <span class="time-label">min</span>
            </div>
            <button @click="minutes = minutes + 1" class="control-button">+</button>
          </div>
        </div>

        <div class="time-input-group">
          <div class="duration-controls">
            <button @click="seconds = Math.max(0, seconds - 5)" class="control-button">-</button>
            <div class="time-display">
              <span class="duration-display">{{ seconds }}</span>
              <span class="time-label">sec</span>
            </div>
            <button @click="seconds = Math.min(59, seconds + 5)" class="control-button">+</button>
          </div>
        </div>
      </div>

      <div class="error-message" v-if="showError">
        Veuillez sélectionner une durée supérieure à 0
      </div>

      <button @click="initTimer" class="start-button">Démarrer</button>
    </div>

    <div v-else class="timer-container">
      <button 
        @click="startTimer" 
        class="timer-button"
      >
        {{ formatTime(timeLeft) }}
      </button>
      
      <button 
        @click="resetTimer" 
        class="reset-button"
      >
        Réinitialiser
      </button>
    </div>

    <div v-if="showPopup" class="popup">
      Terminé
    </div>

    <audio ref="notificationSound" preload="auto">
      <source src="/notification.wav" type="audio/mpeg">
    </audio>
    
    <audio ref="warningSound" preload="auto">
      <source src="/7sec_left.mp3" type="audio/mpeg">
    </audio>

    <audio ref="finalWarningSound" preload="auto">
      <source src="/3sec_left.mp3" type="audio/mpeg">
    </audio>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';

const minutes = ref(0);
const seconds = ref(30);
const timeLeft = ref(0);
const timer = ref(null);
const showPopup = ref(false);
const isTimerStarted = ref(false);
const showError = ref(false);
const notificationSound = ref(null);
const warningSound = ref(null);
const warningPlayed = ref(false);
const finalWarningSound = ref(null);
const finalWarningPlayed = ref(false);

const totalSeconds = computed(() => {
  return minutes.value * 60 + seconds.value;
});

const initTimer = () => {
  if (totalSeconds.value <= 0) {
    showError.value = true;
    return;
  }
  showError.value = false;
  timeLeft.value = totalSeconds.value;
  isTimerStarted.value = true;
  startTimer();
};

const playNotificationSound = () => {
  if (notificationSound.value) {
    notificationSound.value.currentTime = 0;
    notificationSound.value.play().catch(error => {
      console.log('Erreur lors de la lecture du son:', error);
    });
  }
};

const playWarningSound = () => {
  if (warningSound.value) {
    warningSound.value.currentTime = 0;
    warningSound.value.play().catch(error => {
      console.log('Erreur lors de la lecture du son d\'avertissement:', error);
    });
  }
};

const stopWarningSound = () => {
  if (warningSound.value) {
    warningSound.value.pause();
    warningSound.value.currentTime = 0;
  }
};

const playFinalWarningSound = () => {
  if (finalWarningSound.value) {
    finalWarningSound.value.playbackRate = 2.0; // Vitesse x2
    finalWarningSound.value.currentTime = 0;
    finalWarningSound.value.play().catch(error => {
      console.log('Erreur lors de la lecture du son final:', error);
    });
  }
};

const stopFinalWarningSound = () => {
  if (finalWarningSound.value) {
    finalWarningSound.value.pause();
    finalWarningSound.value.currentTime = 0;
  }
};

const stopAllSounds = () => {
  stopWarningSound();
  stopFinalWarningSound();
  if (notificationSound.value) {
    notificationSound.value.pause();
    notificationSound.value.currentTime = 0;
  }
};

const startTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
  }
  
  stopAllSounds();
  timeLeft.value = totalSeconds.value;
  showPopup.value = false;
  warningPlayed.value = false;
  finalWarningPlayed.value = false;
  
  timer.value = setInterval(() => {
    timeLeft.value--;
    
    if (timeLeft.value === 10 && totalSeconds.value > 10 && !warningPlayed.value) {
      playWarningSound();
      warningPlayed.value = true;
    }

    if (timeLeft.value === 3) {
      stopWarningSound();
      playFinalWarningSound();
      finalWarningPlayed.value = true;
    }
    
    if (timeLeft.value <= 0) {
      clearInterval(timer.value);
      stopFinalWarningSound();
      showPopup.value = true;
      playNotificationSound();
    }
  }, 1000);
};

const resetTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
  }
  stopAllSounds();
  isTimerStarted.value = false;
  showPopup.value = false;
  warningPlayed.value = false;
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
  padding: 1rem;
}

.duration-selector {
  text-align: center;
  width: 100%;
  max-width: 500px;
}

.duration-selector h2 {
  font-size: clamp(1.5rem, 5vw, 2rem);
  margin-bottom: 2rem;
}

.time-inputs {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 2rem 0;
}

@media (min-width: 480px) {
  .time-inputs {
    flex-direction: row;
    justify-content: center;
  }
}

.time-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 200px;
  margin: 0 auto;
}

.duration-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.time-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.time-label {
  font-size: clamp(0.8rem, 3vw, 1rem);
  color: #666;
  margin-top: 0.5rem;
}

.control-button {
  font-size: clamp(1.5rem, 5vw, 2rem);
  width: clamp(2.5rem, 8vw, 3rem);
  height: clamp(2.5rem, 8vw, 3rem);
  border-radius: 50%;
  border: none;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  padding: 0;
}

.control-button:hover {
  background-color: #45a049;
}

.duration-display {
  font-size: clamp(2rem, 7vw, 3rem);
  margin: 0 1rem;
}

.error-message {
  color: #ff4444;
  margin: 1rem 0;
}

.start-button {
  font-size: clamp(1.2rem, 4vw, 1.5rem);
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 200px;
  margin-top: 2rem;
  border: none;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.start-button:hover {
  background-color: #45a049;
}

.timer-button {
  font-size: clamp(5rem, 15vw, 10rem);
  padding: clamp(3rem, 8vw, 6rem) clamp(4rem, 10vw, 8rem);
  border-radius: 2rem;
  width: 90vw;
  max-width: 600px;
  aspect-ratio: 16/9;
  text-align: center;
  border: none;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem;
}

.timer-button:hover {
  background-color: #45a049;
  transform: scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
}

.timer-button:active {
  transform: scale(0.98);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  width: 100%;
  max-width: 800px;
  padding: 2rem;
}

.reset-button {
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  padding: 1rem 2rem;
  border-radius: 0.8rem;
  width: 100%;
  max-width: 300px;
  border: none;
  background-color: #666;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.reset-button:hover {
  background-color: #555;
  transform: scale(1.05);
}

.popup {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ff4444;
  color: white;
  padding: clamp(1rem, 4vw, 2rem) clamp(2rem, 6vw, 4rem);
  border-radius: 1rem;
  font-size: clamp(1.5rem, 5vw, 2rem);
  animation: fadeIn 0.3s;
  width: 90%;
  max-width: 300px;
  text-align: center;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 