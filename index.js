let currentDifficulty = "easy";
let consecutiveMatches = 0;
let isPeekActive = false;

function triggerPeekPowerUp() {
  if (isPeekActive) return;
  isPeekActive = true;
  
  $(".card").addClass("flip");
  
  setTimeout(() => {
    $(".card:not(.matched)").removeClass("flip");
    isPeekActive = false;
  }, 2000); 
}
async function setup() {
  // Clear the grid so don't pile cards up on every reset
  $("#game_grid").empty();

  // 1. Get difficulty from dropdown
  const diff = currentDifficulty;
  let totalPairs, timeLeft;
  if (diff === "easy") { totalPairs = 3; timeLeft = 30; }
  else if (diff === "medium") { totalPairs = 6; timeLeft = 60; }
  else { totalPairs = 9; timeLeft = 90; }

  // How the Pokémon API was used to retrieve the images for the cards________________________________________________

  // 2. Fetch the list of Pokémon
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100");
  const data = await response.json();

  // 3. Shuffle and pick random Pokémon
  let selected = data.results.sort(() => 0.5 - Math.random()).slice(0, totalPairs);
  let deck = [...selected, ...selected].sort(() => 0.5 - Math.random());

  // 4. Build the cards
  for (let i = 0; i < deck.length; i++) {
    const detail = await fetch(deck[i].url).then(res => res.json());
    const imgUrl = detail.sprites.other["official-artwork"].front_default;

    $("#game_grid").append(`
      <div class="card" id="card-${i}">
        <img class="front_face" src="${imgUrl}" alt="${deck[i].name}">
        <img class="back_face" src="back.webp" alt="back">
      </div>
    `);
  }

  // How the Pokémon API was used to retrieve the images for the cards________________________________________________

  // 5. Initialize game variables
  let firstCard = undefined;
  let secondCard = undefined;
  let isFlipping = false;
  let matchedPairs = 0;
  let clicks = 0;
  let timer;
  consecutiveMatches = 0; // Reset streak on new game

  // How the status section is calculated and displayed_____________________________________________________
  // Variable Initialization
  $("#clicks").text(clicks);
  $("#matched").text(matchedPairs);
  $("#left").text(totalPairs);
  $("#time").text(timeLeft);
  // Variable Initialization
  // How the status section is calculated and displayed_____________________________________________________
  $(".card").removeClass("flip").off("click");
  $("#stats_header h2").html(`Clicks: <span id="clicks">0</span> | Matched: <span id="matched">0</span> | Left: <span id="left">${totalPairs}</span> | Total Pairs: ${totalPairs} | Time Left: <span id="time">${timeLeft}</span>s`);

// How the status section is calculated and displayed_____________________________________________________
// Update function
  function updateHeader() {
    $("#clicks").text(clicks);
    $("#matched").text(matchedPairs);
    $("#left").text(totalPairs - matchedPairs);
  }
// Update function
// How the status section is calculated and displayed_____________________________________________________

  if (window.timer) clearInterval(window.timer);

  // Light up the button at the start of the game so they can use it
  $("#powerup_btn").prop("disabled", false);

  window.timer = setInterval(function () {
    timeLeft--;
    $("#time").text(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(window.timer); // Stop the clock
      isFlipping = true; // Lock the board so the user can't click anymore
      alert("Game Over! You ran out of time.");
    }
  }, 1000);

  // click event logic for card flipping__________________________________________________________________________________________________________________
  $("#game_grid").off("click").on("click", ".card", function () {
    if (isFlipping || isPeekActive) return;

    // If already matched or already flipped, ignore
    if ($(this).hasClass("flip")) return;

    // How the status section is calculated and displayed_____________________________________________________
    // Called when an event occurs
    clicks++;
    updateHeader();
    // Called when an event occurs
    // How the status section is calculated and displayed_____________________________________________________

    $(this).toggleClass("flip");

    if (!firstCard) {
      firstCard = $(this).find(".front_face")[0];
    } else {
      secondCard = $(this).find(".front_face")[0];
      isFlipping = true;

      if (firstCard.src === secondCard.src) {
        // MATCH LOGIC
        matchedPairs++;
        $(firstCard).parent().addClass("matched");
        $(secondCard).parent().addClass("matched");
        updateHeader();
        firstCard = undefined;
        secondCard = undefined;
        isFlipping = false;

        consecutiveMatches++;
        if (consecutiveMatches === 2) {
          $("#powerup_btn").prop("disabled", false);
          consecutiveMatches = 0; // Reset streak after trigger
        }

        if (matchedPairs === totalPairs) {
          clearInterval(window.timer);
          alert("Congratulations, you won!");
          isFlipping = true;
        }
      } else {
        // NO MATCH LOGIC
        consecutiveMatches = 0; // Break the streak if they don't match
        setTimeout(() => {
          $(firstCard).parent().removeClass("flip");
          $(secondCard).parent().removeClass("flip");
          firstCard = undefined;
          secondCard = undefined;
          isFlipping = false;
        }, 1000);
      }
    }
  });
  // click event logic for card flipping__________________________________________________________________________________________________________________
};

// click event logic for buttons_________________________________________________________________
$(document).ready(function () {
  $("#start_btn").on("click", setup);
  $("#reset_btn").on("click", setup);

  $("#theme_btn").on("click", function () {
    $("body").toggleClass("dark-mode");
  });

  $(".diff-btn").on("click", function () {
    // Remove "active" (styling) from all, then add to current
    $(".diff-btn").removeClass("btn-success").addClass("btn-primary");
    $(this).removeClass("btn-primary").addClass("btn-success");
    
    // Update the variable that setup() looks at
    currentDifficulty = $(this).data("diff");
  });
  $("#powerup_btn").on("click", function () {
    // Prevent spam clicking or clicking when timer isn't running
    if (!window.timer || isPeekActive) return; 

    triggerPeekPowerUp();
    
    // Grey the button out again until they earn it back!
    $(this).prop("disabled", true); 
  });
});
// click event logic for buttons_________________________________________________________________
