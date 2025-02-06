document.addEventListener("DOMContentLoaded", async function () {
  const usersPerPage = 18; // 6 users per column * 3 columns
  let currentPage = 1;
  let allUsers = [];

  async function listUser() {
    try {
      const response = await axios.get("/UserData");
      
      allUsers = response.data;
      renderUsers();
      renderPagination();
    } catch (error) {
      console.log("error while getting userlist in frontend", error);
    }
  }

  function renderUsers() {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = allUsers.slice(startIndex, endIndex);

    const userListContainer = document.getElementById("user-list");
    userListContainer.innerHTML = ""; // Clear previous content

    // Main container for listing
    const allListUser = document.createElement("div");
    allListUser.classList.add(
      "flex",
      "flex-row",
      "p-4",
      "w-full",
      "bg-gray-500",
      "space-x-5"
    );

    // Create columns for users
    const columns = [
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
    ];
    columns.forEach((column) => {
      column.classList.add("flex", "flex-col", "w-1/3", "space-y-2");
    });

    // Distributing users among the columns
    usersToShow.forEach((user, index) => {
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
          <span class="status-text text-sm ${user.isBlock ? "bg-red-500 animate-pulse" : "bg-green-500 animate-bounce"} text-white px-2 py-1 rounded">${user.isBlock ? "Blocked" : "Active"}</span>
          <button data-user-id="${user._id}" class="toggleButton flex items-center px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-lg transition-colors duration-300 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-opacity-50 mt-2">
            <span class="buttonText text-xl">${user.isBlock ? "Unblock" : "Block"}</span>
            <svg class="buttonIcon w-5 h-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18M12 3l9 9-9 9" />
            </svg>
          </button>
        </div>
      `;

      columns[index % 3].appendChild(userCard);
    });

    // Append columns to main container
    columns.forEach((column) => allListUser.appendChild(column));

    // Append the main container to the user list container
    userListContainer.appendChild(allListUser);
  }

  function renderPagination() {
    const paginationContainer = document.getElementById("pagination-controls");
    paginationContainer.innerHTML = ""; // Clear previous pagination

    const pageCount = Math.ceil(allUsers.length / usersPerPage);

    for (let i = 1; i <= pageCount; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      pageButton.classList.add(
        "px-4",
        "py-2",
        "text-sm",
        "font-medium",
        "text-white",
        "transition-colors",
        "duration-150",
        "rounded-lg",
        "focus:outline-none",
        "focus:shadow-outline"
      );

      if (i === currentPage) {
        pageButton.classList.add("bg-red-500", "hover:bg-green-600");
      } else {
        pageButton.classList.add("bg-gray-300", "hover:bg-gray-400");
      }

      pageButton.addEventListener("click", () => {
        currentPage = i;
        renderUsers();
        renderPagination();
      });

      paginationContainer.appendChild(pageButton);
    }
  }

  listUser();

  document.addEventListener("click", async function (event) {
    try {
      const buttonToggle = event.target.closest(".toggleButton");

      if (buttonToggle) {
        const userId = buttonToggle.getAttribute("data-user-id");
        const statusText = buttonToggle.previousElementSibling;
        const buttonText = buttonToggle.querySelector(".buttonText");

        buttonText.textContent = "Loading...";

        setTimeout(async () => {
          if (statusText.textContent === "Active") {
            const response = await axios.patch(
              `/userBlock/${userId}`
            );
            const data = response.data.isBlocked;

            if (data === true) {
              statusText.textContent = "Blocked";
              buttonText.textContent = "Unblock";
              statusText.classList.remove("bg-green-500", "animate-bounce");
              statusText.classList.add("bg-red-500", "animate-pulse");
            } else {
              statusText.textContent = "Active";
              buttonText.textContent = "Block";
            }
          } else {
            const response = await axios.patch(
              `/userUnblock/${userId}`
            );
            statusText.textContent = "Active";
            buttonText.textContent = "Block";

            statusText.classList.remove("bg-red-500", "animate-pulse");
            statusText.classList.add("bg-green-500", "animate-bounce");
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error processing user action:", error);
    }
  });
});
