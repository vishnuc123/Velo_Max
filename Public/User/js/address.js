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

  let existingAddresses = [];

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
      existingAddresses = response.data.addresses;
      const addressList = document.getElementById("addressList");
      addressList.innerHTML = "";

      existingAddresses.forEach((address) => {
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
          const address = existingAddresses.find((addr) => addr._id === addressId);

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

          // Show SweetAlert confirmation dialog with custom style
          Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            background: '#000000',
            color: '#ffffff',
            backdrop: `
              rgba(0,0,0,0.8)
              url("/images/nyan-cat.gif")
              left top
              no-repeat
            `,
            showClass: {
              popup: `animate__animated animate__fadeInDown animate__faster`
            },
            hideClass: {
              popup: `animate__animated animate__fadeOutUp animate__faster`
            },
            showCancelButton: true,
            confirmButtonColor: '#ffffff',
            cancelButtonColor: '#666666',
            confirmButtonText: 'Yes, delete it!',
            customClass: {
              title: 'text-white',
              content: 'text-gray-300',
              confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white',
              cancelButton: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600'
            }
          }).then(async (result) => {
            if (result.isConfirmed) {
              try {
                await axios.delete(`/delete-address/${addressId}`);
                Swal.fire({
                  icon: 'success',
                  title: 'Deleted!',
                  text: 'Your address has been deleted.',
                  background: '#000000',
                  color: '#ffffff',
                  timer: 2000,
                  showConfirmButton: false,
                  showClass: {
                    popup: `animate__animated animate__flipInX animate__faster`
                  },
                  hideClass: {
                    popup: `animate__animated animate__flipOutX animate__faster`
                  },
                  customClass: {
                    title: 'text-white',
                    content: 'text-gray-300',
                    confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'
                  }
                });
                updateAddressList(); // Refresh the address list
              } catch (error) {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Failed to delete the address.',
                  background: '#000000',
                  color: '#ffffff',
                  timer: 2000,
                  showConfirmButton: false,
                  showClass: {
                    popup: `animate__animated animate__flipInX animate__faster`
                  },
                  hideClass: {
                    popup: `animate__animated animate__flipOutX animate__faster`
                  },
                  customClass: {
                    title: 'text-white',
                    content: 'text-gray-300',
                    confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'
                  }
                });
                console.error("Error deleting address:", error);
              }
            }
          });
        });
      });
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }

  // Validate form fields using regex
  function validateForm() {
    let isValid = true;

    // Clear previous error messages
    document.querySelectorAll(".error-message").forEach(el => el.remove());

    const showError = (input, message) => {
      const error = document.createElement("span");
      error.className = "error-message text-red-500 text-sm";
      error.textContent = message;
      input.parentElement.appendChild(error);
      isValid = false;
    };

    // Label validation (e.g., non-empty, alphabets only)
    if (!/^[A-Za-z\s]{3,20}$/.test(addressLabelInput.value)) {
      showError(addressLabelInput, "Label should be 3-20 alphabetic characters.");
    }

    // Address validation (e.g., non-empty, minimum length)
    if (!/^.{5,100}$/.test(addressInput.value)) {
      showError(addressInput, "Address should be between 5-100 characters.");
    }

    // City validation (e.g., alphabets only)
    if (!/^[A-Za-z\s]{2,50}$/.test(cityInput.value)) {
      showError(cityInput, "City should be 2-50 alphabetic characters.");
    }

    // Pin code validation (e.g., 5-10 digits)
    if (!/^\d{5,10}$/.test(pinCodeInput.value)) {
      showError(pinCodeInput, "Pin code should be 5-10 digits.");
    }

    // Phone number validation (e.g., 10-15 digits)
    if (!/^\d{10,15}$/.test(phoneNumberInput.value)) {
      showError(phoneNumberInput, "Phone number should be 10-15 digits.");
    }

    return isValid;
  }

  // Check for duplicate address
  function isDuplicateAddress(addressData) {
    return existingAddresses.some((addr) => 
      addr.address === addressData.address &&
      addr.city === addressData.city &&
      addr.pinCode === addressData.pinCode &&
      addr.phoneNumber === addressData.phoneNumber &&
      addr._id !== addressIdInput.value // Ignore the current address if editing
    );
  }

  // Submit form to add or edit address with confirmation
  addressForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const addressData = {
      label: addressLabelInput.value,
      address: addressInput.value,
      city: cityInput.value,
      pinCode: pinCodeInput.value,
      phoneNumber: phoneNumberInput.value,
    };

    if (isDuplicateAddress(addressData)) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Address',
        text: 'This address already exists.',
        background: '#000000',
        color: '#ffffff',
        timer: 2000,
        showConfirmButton: false,
        showClass: {
          popup: `animate__animated animate__flipInX animate__faster`
        },
        hideClass: {
          popup: `animate__animated animate__flipOutX animate__faster`
        },
        customClass: {
          title: 'text-white',
          content: 'text-gray-300',
          confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'
        }
      });
      return;
    }

    const addressId = addressIdInput.value;

    // Show confirmation before submitting the form
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to save this address?",
      icon: 'question',
      background: '#000000',
      color: '#ffffff',
      backdrop: `
        rgba(0,0,0,0.8)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `,
      showClass: {
        popup: `animate__animated animate__fadeInDown animate__faster`
      },
      hideClass: {
        popup: `animate__animated animate__fadeOutUp animate__faster`
      },
      showCancelButton: true,
      confirmButtonColor: '#ffffff',
      cancelButtonColor: '#666666',
      confirmButtonText: 'Yes, save it!',
      customClass: {
        title: 'text-white',
        content: 'text-gray-300',
        confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white',
        cancelButton: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (addressId) {
            // Update existing address
            await axios.put(`/update-address/${addressId}`, addressData);
          } else {
            // Add new address
            await axios.post("/submit-address", addressData);
          }

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Address saved successfully!',
            background: '#000000',
            color: '#ffffff',
            timer: 2000,
            showConfirmButton: false,
            showClass: {
              popup: `animate__animated animate__flipInX animate__faster`
            },
            hideClass: {
              popup: `animate__animated animate__flipOutX animate__faster`
            },
            customClass: {
              title: 'text-white',
              content: 'text-gray-300',
              confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'
            }
          }).then(() => {
            modal.classList.add("hidden"); // Close the modal
            updateAddressList(); // Refresh the address list
          });
        } catch (error) {
          console.error("Error saving address:", error);
        }
      }
    });
  });

  // Load the address list initially
  updateAddressList();
});
