document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const addressForm = document.getElementById("addressForm");
  const addressIdInput = document.getElementById("addressId");
  const addressLabelInput = document.getElementById("label");
  const addressInput = document.getElementById("address");
  const cityInput = document.getElementById("city");
  const pinCodeInput = document.getElementById("pinCode");
  const phoneNumberInput = document.getElementById("phoneNumber");
  const modalTitle = document.getElementById("modalTitle");

  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");

  // Open modal for adding a new address
  openModalBtn.addEventListener("click", () => {
    addressForm.reset();
    addressIdInput.value = "";
    modalTitle.textContent = "Add New Address";
    modal.classList.remove("hidden");
  });

  // Close modal
  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Fetch and render address list
  async function updateAddressList() {
    try {
      const response = await axios.get("/get-address");
      const addresses = response.data.addresses;
      const addressList = document.getElementById("addressList");
      addressList.innerHTML = "";

      addresses.forEach((address) => {
        const addressCard = document.createElement("div");
        addressCard.className =
          "border bg-white rounded-lg p-4 hover:border-purple-500 transition-colors duration-200";

        addressCard.innerHTML = `
          <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-semibold">${address.label}</h3>
              <button class="text-gray-500 hover:text-gray-700 edit-btn" data-id="${address._id}">Edit</button>
              <button class="text-gray-500 hover:text-gray-700 delete-btn" data-id="${address._id}">Delete</button>
            </div>
            <p class="text-gray-600">
              ${address.address}<br>
              ${address.city}, ${address.pinCode}<br>
              Phone Number: ${address.phoneNumber}
            </p>
          </div>
        `;

        addressList.appendChild(addressCard);
      });

      // Add event listeners to edit buttons
      const editButtons = document.querySelectorAll(".edit-btn");
      editButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          const addressId = event.target.getAttribute("data-id");
          const address = addresses.find((addr) => addr._id === addressId);

          if (address) {
            // Pre-fill form
            addressIdInput.value = address._id || "";
            addressLabelInput.value = address.label || "";
            addressInput.value = address.address || "";
            cityInput.value = address.city || "";
            pinCodeInput.value = address.pinCode || "";
            phoneNumberInput.value = address.phoneNumber || "";

            modalTitle.textContent = "Edit Address";
            modal.classList.remove("hidden");
          }
        });
      });
      // Add event listeners to delete buttons
      const deleteButtons = document.querySelectorAll(".delete-btn");
      deleteButtons.forEach((button) => {
        button.addEventListener("click", async (event) => {
          const addressId = event.target.getAttribute("data-id");
          if (confirm("Are you sure you want to delete this address?")) {
            try {
              await axios.delete(`/delete-address/${addressId}`);
              window.location.reload()
              // updateAddressList(); // Refresh the address list
            } catch (error) {
              console.error("Error deleting address:", error);
            }
          }
        });
      });
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }

  // Submit form to add or edit address
  addressForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const addressData = {
      label: addressLabelInput.value,
      address: addressInput.value,
      city: cityInput.value,
      pinCode: pinCodeInput.value,
      phoneNumber: phoneNumberInput.value,
    };

    const addressId = addressIdInput.value;

    try {
      if (addressId) {
        // Update existing address
        await axios.put(`/update-address/${addressId}`, addressData);
      } else {
        // Add new address
        await axios.post("/submit-address", addressData);
      }

      modal.classList.add("hidden");
      updateAddressList();
    } catch (error) {
      console.error("Error saving address:", error);
    }
  });

  // Load the address list initially
  updateAddressList();
});
