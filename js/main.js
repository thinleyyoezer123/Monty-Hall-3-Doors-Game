document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const doorBtns = document.querySelectorAll(".door-btn");
    const instructionEl = document.getElementById("instruction");
    const resultMsgEl = document.getElementById("result-msg");
    const resetBtn = document.getElementById("reset-btn");
    const clearStatsBtn = document.getElementById("clear-stats-btn");
  
    // State
    let prizeIndex = null;
    let playerInitialPick = null;
    let hostOpenedIndex = null;
    let gameStep = 1; // 1: Initial Pick, 2: Final Choice (Tap Door to Stay/Switch), 3: Game Over
  
    // Local Storage Database
    let stats = JSON.parse(localStorage.getItem("montyHallStats")) || {
      stayWins: 0,
      stayTotal: 0,
      switchWins: 0,
      switchTotal: 0
    };
  
    function updateStatsDisplay() {
      document.getElementById("stay-wins").textContent = stats.stayWins;
      document.getElementById("stay-total").textContent = stats.stayTotal;
      const stayRate = stats.stayTotal > 0 ? ((stats.stayWins / stats.stayTotal) * 100).toFixed(1) : 0;
      document.getElementById("stay-rate").textContent = `${stayRate}%`;
  
      document.getElementById("switch-wins").textContent = stats.switchWins;
      document.getElementById("switch-total").textContent = stats.switchTotal;
      const switchRate = stats.switchTotal > 0 ? ((stats.switchWins / stats.switchTotal) * 100).toFixed(1) : 0;
      document.getElementById("switch-rate").textContent = `${switchRate}%`;
  
      localStorage.setItem("montyHallStats", JSON.stringify(stats));
    }
  
    function initGame() {
      gameStep = 1;
      prizeIndex = Math.floor(Math.random() * 3);
      playerInitialPick = null;
      hostOpenedIndex = null;
  
      instructionEl.textContent = "Step 1: Tap any door to pick it!";
      resultMsgEl.textContent = "";
      resultMsgEl.className = "result-msg";
      resetBtn.classList.add("hidden");
  
      doorBtns.forEach((btn, index) => {
        btn.disabled = false;
        btn.className = "door-btn";
        document.getElementById(`reveal-${index}`).textContent = "🚪";
        
        const badge = document.getElementById(`badge-${index}`);
        badge.className = "door-badge hidden";
        badge.textContent = "";
      });
  
      updateStatsDisplay();
    }
  
    // Handle door taps across both game steps
    doorBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const clickedIndex = parseInt(btn.getAttribute("data-index"));
  
        // STEP 1: INITIAL SELECTION
        if (gameStep === 1) {
          playerInitialPick = clickedIndex;
          gameStep = 2;
  
          // Host opens an unchosen door with a goat 🐐
          const availableForHost = [0, 1, 2].filter(
            (i) => i !== playerInitialPick && i !== prizeIndex
          );
          hostOpenedIndex = availableForHost[Math.floor(Math.random() * availableForHost.length)];
  
          // Update Host Door (Disable & Reveal Goat)
          const hostDoor = document.getElementById(`door-${hostOpenedIndex}`);
          hostDoor.classList.add("host-opened");
          hostDoor.disabled = true;
          document.getElementById(`reveal-${hostOpenedIndex}`).textContent = "🐐";
  
          // Find the remaining unopened door
          const remainingDoorIndex = [0, 1, 2].find(
            (i) => i !== playerInitialPick && i !== hostOpenedIndex
          );
  
          // Highlight options for Step 2
          const initialDoor = document.getElementById(`door-${playerInitialPick}`);
          initialDoor.classList.add("option-stay");
          const badgeInitial = document.getElementById(`badge-${playerInitialPick}`);
          badgeInitial.textContent = "Tap to STAY";
          badgeInitial.classList.remove("hidden");
  
          const switchDoor = document.getElementById(`door-${remainingDoorIndex}`);
          switchDoor.classList.add("option-switch");
          const badgeSwitch = document.getElementById(`badge-${remainingDoorIndex}`);
          badgeSwitch.textContent = "Tap to SWITCH";
          badgeSwitch.classList.add("switch-badge");
          badgeSwitch.classList.remove("hidden");
  
          instructionEl.innerHTML = `The host opened Door ${hostOpenedIndex + 1} (Goat 🐐)!<br>Tap <strong>Door ${playerInitialPick + 1}</strong> to STAY, or <strong>Door ${remainingDoorIndex + 1}</strong> to SWITCH!`;
          return;
        }
  
        // STEP 2: TAP DOOR TO STAY OR SWITCH
        if (gameStep === 2) {
          if (clickedIndex === hostOpenedIndex) return; // Prevent tapping host door
  
          const didSwitch = clickedIndex !== playerInitialPick;
          gameStep = 3;
  
          // Record data to local database
          if (didSwitch) {
            stats.switchTotal++;
            if (clickedIndex === prizeIndex) stats.switchWins++;
          } else {
            stats.stayTotal++;
            if (clickedIndex === prizeIndex) stats.stayWins++;
          }
          updateStatsDisplay();
  
          // Reveal all doors
          doorBtns.forEach((d, index) => {
            d.disabled = true;
            d.className = "door-btn";
            const revealSpan = document.getElementById(`reveal-${index}`);
  
            if (index === prizeIndex) {
              revealSpan.textContent = "💰";
              d.classList.add("winner");
            } else {
              revealSpan.textContent = "🐐";
              d.classList.add("loser");
            }
          });
  
          // Result Messaging
          const isWin = clickedIndex === prizeIndex;
          instructionEl.textContent = "Game Over!";
          if (isWin) {
            resultMsgEl.textContent = `🎉 YOU WON $1,000,000! (${didSwitch ? "Switching" : "Staying"} worked!)`;
            resultMsgEl.classList.add("win-text");
          } else {
            resultMsgEl.textContent = `❌ Bad Luck! You got a goat! (${didSwitch ? "Switching" : "Staying"} failed)`;
            resultMsgEl.classList.add("lose-text");
          }
  
          resetBtn.classList.remove("hidden");
        }
      });
    });
  
    resetBtn.addEventListener("click", initGame);
  
    clearStatsBtn.addEventListener("click", () => {
      stats = { stayWins: 0, stayTotal: 0, switchWins: 0, switchTotal: 0 };
      localStorage.removeItem("montyHallStats");
      updateStatsDisplay();
    });
  
    initGame();
  });