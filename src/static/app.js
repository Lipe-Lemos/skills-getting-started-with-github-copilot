document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to render activities in the UI
  function renderActivities(activities) {
    // Clear current list and dropdown options
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    // Populate activities list
    Object.entries(activities).forEach(([name, details]) => {
      const activityCard = document.createElement("div");
      activityCard.className = "activity-card";

      const spotsLeft = details.max_participants - details.participants.length;

      // Create participants list HTML
      const participantsList = details.participants.length > 0
        ? `<ul class="participants-list">
            ${details.participants.map(participant => `
              <li>
                <span class="participant-email">${participant}</span>
                <button class="delete-btn" onclick="deleteParticipant('${name}', '${participant}')" title="Cancelar registro">🗑️</button>
              </li>
            `).join('')}
          </ul>`
        : '<p class="no-participants">Nenhum participante inscrito ainda</p>';

      activityCard.innerHTML = `
        <h4>${name}</h4>
        <p>${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        <div class="participants-section">
          <p class="participants-title"><strong>Participantes:</strong></p>
          ${participantsList}
        </div>
      `;

      activitiesList.appendChild(activityCard);

      // Add option to select dropdown
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();
      renderActivities(activities);
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        
        // Refresh activities list
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

// Function to delete a participant from an activity
async function deleteParticipant(activityName, email) {
  if (!confirm(`Tem certeza que deseja cancelar o registro de ${email} da atividade "${activityName}"?`)) {
    return;
  }

  try {
    const response = await fetch(
      `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();

    if (response.ok) {
      // Show success message
      const messageDiv = document.getElementById("message");
      messageDiv.textContent = result.message;
      messageDiv.className = "success";
      messageDiv.classList.remove("hidden");

      // Refresh activities list
      const activitiesResponse = await fetch("/activities");
      const activities = await activitiesResponse.json();

      // Clear current list and dropdown options
      const activitiesList = document.getElementById("activities-list");
      const activitySelect = document.getElementById("activity");
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Repopulate activities
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantsList = details.participants.length > 0
          ? `<ul class="participants-list">
              ${details.participants.map(participant => `
                <li>
                  <span class="participant-email">${participant}</span>
                  <button class="delete-btn" onclick="deleteParticipant('${name}', '${participant}')" title="Cancelar registro">🗑️</button>
                </li>
              `).join('')}
            </ul>`
          : '<p class="no-participants">Nenhum participante inscrito ainda</p>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p class="participants-title"><strong>Participantes:</strong></p>
            ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } else {
      const messageDiv = document.getElementById("message");
      messageDiv.textContent = result.detail || "Erro ao cancelar registro";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");

      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    }
  } catch (error) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = "Falha ao cancelar registro. Tente novamente.";
    messageDiv.className = "error";
    messageDiv.classList.remove("hidden");
    console.error("Error deleting participant:", error);

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }
}
