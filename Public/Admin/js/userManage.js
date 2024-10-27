document.addEventListener("DOMContentLoaded", async function () {
  async function listUser() {
    try {
      const response = await axios.get("http://localhost:4000/UserData");
      const data = response.data;

      // Main container for listing
      const allListUser = document.createElement("div");
      allListUser.classList.add(
        "flex",
        "flex-row",
        "p-4",
        "w-full",
        "bg-gray-500",
        "space-x-5"  // Use space-x-5 to add horizontal space between columns
      );

      // Create columns for users
      const leftListUser = document.createElement("div");
      leftListUser.classList.add("flex", "flex-col", "w-1/3", "space-y-2");

      const centerListUser = document.createElement("div");
      centerListUser.classList.add("flex", "flex-col", "w-1/3", "space-y-2");

      const rightListUser = document.createElement("div");
      rightListUser.classList.add("flex", "flex-col", "w-1/3", "space-y-2");

      // Distributing users among the columns
      data.forEach((user, index) => {
        const userCard = document.createElement("div");
        userCard.classList.add(
          "flex",
          "items-center",
          "p-4",
          "border",
          "rounded",
          "shadow-md",
          "bg-white"
        );

        userCard.innerHTML = `
          <div class="flex-shrink-0 h-10 w-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">${user.firstname} ${user.lastname}</div>
            <div class="text-sm text-gray-500">${user.email}</div>
            <button data-user-id="${user._id}" class="flex items-center px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-lg transition-colors duration-300 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-opacity-50">
              <span class="buttonText tex-1xl">View Details</span>
              <svg class="buttonIcon w-5 h-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18M12 3l9 9-9 9" />
              </svg>
            </button>
          </div>
        `;

        // Distributing user cards among columns
        if (data.length <= 6) {
          // If there are 6 or fewer users, fill one column
          leftListUser.appendChild(userCard);
        } else if (data.length <= 12) {
          // If there are between 7 to 12 users, distribute among two columns
          if (index < 6) {
            leftListUser.appendChild(userCard);
          } else {
            centerListUser.appendChild(userCard);
          }
        } else {
          // If there are more than 12 users, distribute among all three columns
          if (index < 6) {
            leftListUser.appendChild(userCard);
          } else if (index < 12) {
            centerListUser.appendChild(userCard);
          } else {
            rightListUser.appendChild(userCard);
          }
        }
      });

      // Appending user lists to main container
      allListUser.appendChild(leftListUser);
      allListUser.appendChild(centerListUser);
      allListUser.appendChild(rightListUser);

      // Finally appending to the main user list container
      document.getElementById("user-list").appendChild(allListUser);
    } catch (error) {
      console.log("Axios error", error);
    }
  }

  listUser();
});


document.body.addEventListener('click', async function (event) {
  try {
    const buttonToggle = event.target.closest('.toggleButton'); // Ensure button is clicked
    
    if (buttonToggle) {
      const buttonText = buttonToggle.querySelector('.buttonText');
      const buttonIcon = buttonToggle.querySelector('.buttonIcon');
      const userId = buttonToggle.getAttribute('data-user-id');
      console.log(userId);
       // Get the user ID from the data attribute
      
    }

  } catch (error) {
    console.error('Error updating user status:', error);
  }
});