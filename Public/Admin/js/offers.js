document.addEventListener("DOMContentLoaded", () => {
  const openModalBtn = document.getElementById("openModalBtn");
  const offerForm = document.getElementById("offerForm");
  const cancelButton = document.getElementById("cancelButton");
  const offerType = document.getElementById("offer-type");
  const categorySelect = document.getElementById("category-select");
  const productSearch = document.getElementById("product-search");
  const productSearchInput = document.getElementById("product-search-input");
  const productSearchResults = document.getElementById(
    "product-search-results"
  );
  const discountTypeSelect = document.getElementById("discount-type");
  const discountValueInput = document.getElementById("discount-value");
  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");
  const errorMessages = {
    offerName: document.getElementById("offer-name-error"),
    offerType: document.getElementById("offer-type-error"),
    categorySelect: document.getElementById("category-error"),
    productSearchInput: document.getElementById("product-error"),
    discountType: document.getElementById("discount-type-error"),
    discountValueInput: document.getElementById("discount-value-error"),
    startDateInput: document.getElementById("start-date-error"),
    endDateInput: document.getElementById("end-date-error"),
  };

  let selectedProductId = null; // Variable to store the selected product ID

  openModalBtn.addEventListener("click", () => toggleModal(true));
  cancelButton.addEventListener("click", () => toggleModal(false));

  offerType.addEventListener("change", handleOfferTypeChange);
  productSearchInput.addEventListener("input", handleProductSearch);
  discountValueInput.addEventListener("input", validateDiscountValue);
  startDateInput.addEventListener("change", validateDates);
  endDateInput.addEventListener("change", validateDates);
  offerForm.addEventListener("submit", handleFormSubmit);

  loadCategories();

  function toggleModal(isOpen) {
    if (isOpen) {
      offerForm.classList.remove("hidden", "scale-95", "opacity-0");
      offerForm.classList.add("scale-100", "opacity-100");
    } else {
      offerForm.classList.add("scale-95", "opacity-0");
      setTimeout(() => offerForm.classList.add("hidden"), 300);
    }
  }

  function handleOfferTypeChange(e) {
    const isCategory = e.target.value === "category";
    const isProduct = e.target.value === "product";

    categorySelect.classList.toggle("hidden", !isCategory);
    productSearch.classList.toggle("hidden", !isProduct);

    clearError("offerType");
  }

  async function handleProductSearch(e) {
    const searchTerm = e.target.value.trim();
    if (searchTerm.length > 2) {
      try {
        const response = await axios.get(`/searchproducts?q=${searchTerm}`);
        displaySearchResults(response.data.searchResults);
      } catch (error) {
        console.error("Error fetching product search results:", error);
        productSearchResults.classList.add("hidden");
      }
    } else {
      productSearchResults.classList.add("hidden");
    }
    clearError("productSearchInput");
  }

  function displaySearchResults(results) {
    productSearchResults.innerHTML = "";

    Object.keys(results).forEach((collectionName) => {
      results[collectionName].forEach((product) => {
        const div = document.createElement("div");
        div.className = "p-2 hover:bg-gray-100 cursor-pointer";
        div.textContent = product.productName;
        div.addEventListener("click", () => selectProduct(product));
        productSearchResults.appendChild(div);
      });
    });

    productSearchResults.classList.remove("hidden");
  }

  function selectProduct(product) {
    productSearchInput.value = product.productName;
    selectedProductId = product._id; // Store the selected product ID
    productSearchResults.classList.add("hidden");
    clearError("productSearchInput");
  }

  async function loadCategories() {
    try {
      const response = await axios.get("/category-details");
      populateCategories(response.data.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  function populateCategories(categories) {
    const categoryElement = document.getElementById("category");
    categoryElement.innerHTML = '<option value="">Select Category</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.categoryTitle; // Use category name
      option.textContent = category.categoryTitle;
      categoryElement.appendChild(option);
    });
  }

  function validateDiscountValue() {
    const discountType = discountTypeSelect.value;
    let value = discountValueInput.value;
    let errorMessage = "";

    if (discountType === "fixed") {
      errorMessage = /^\d+(\.\d{1,2})?$/.test(value)
        ? ""
        : "Please enter a valid positive number.";
    } else if (discountType === "percentage") {
      errorMessage = /^100$|^\d{1,2}$/.test(value)
        ? ""
        : "Please enter a number between 0 and 100.";
    }

    setError("discountValueInput", errorMessage);
  }

  function validateDates() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startError =
      startDate < today ? "Start date must be today or in the future." : "";
    const endError =
      endDate <= startDate ? "End date must be after the start date." : "";

    setError("startDateInput", startError);
    setError("endDateInput", endError);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    let isValid = true;

    // Validate offer type
    if (!offerType.value) {
      setError("offerType", "Please select an offer type.");
      isValid = false;
    } else {
      clearError("offerType");
    }

    // Validate category selection if offer type is "category"
    if (
      offerType.value === "category" &&
      !document.getElementById("category").value
    ) {
      setError("categorySelect", "Please select a category.");
      isValid = false;
    } else {
      clearError("categorySelect");
    }

    // Validate product selection if offer type is "product"
    if (offerType.value === "product" && !selectedProductId) {
      setError("productSearchInput", "Please select a product.");
      isValid = false;
    } else {
      clearError("productSearchInput");
    }

    // Validate discount value
    if (!discountValueInput.value.trim()) {
      setError("discountValueInput", "Please enter a discount value.");
      isValid = false;
    }

    // Validate dates
    if (!startDateInput.value.trim()) {
      setError("startDateInput", "Please select a start date.");
      isValid = false;
    }

    if (!endDateInput.value.trim()) {
      setError("endDateInput", "Please select an end date.");
      isValid = false;
    }

    // Proceed if validation passes
    if (isValid) {
      try {
        // Show confirmation dialog before submitting
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to proceed with adding this offer?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, proceed!',
          cancelButtonText: 'No, cancel',
          reverseButtons: true
        });
    
        if (result.isConfirmed) {
          // Proceed with offer submission if confirmed
          const formData = new FormData();
    
          // Append common fields
          formData.append("offerName", document.getElementById("offer-name").value);
          formData.append("offerType", offerType.value);
          formData.append("discountType", discountTypeSelect.value);
          formData.append("discountValue", discountValueInput.value);
          formData.append("startDate", startDateInput.value);
          formData.append("endDate", endDateInput.value);
          formData.append("productName", productSearchInput.value);
    
          // Conditionally append category or product ID based on offer type
          if (offerType.value === "category") {
            const category = document.getElementById("category").value;
            formData.append("category", category); // Send category name
          } else if (offerType.value === "product") {
            formData.append("productId", selectedProductId); // Send product ID
          }
    
          
    
          const response = await axios.post("/addOffer", formData, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          
    
          if (response.status === 200) {

            
            Swal.fire({
              title: 'Success!',
              text: 'Offer has been submitted successfully.',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              window.location.reload()
            })
          }
        } else {
          console.log("Offer submission canceled.");
        }
      } catch (error) {
        console.error("Error in offer submission:", error);
    
        // SweetAlert error dialog
        Swal.fire({
          title: 'Error!',
          text: 'There was an error while processing your request. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
    
  }

  function setError(field, message) {
    if (errorMessages[field]) {
      errorMessages[field].innerHTML = message;
      errorMessages[field].classList.remove("hidden");
    }
  }

  function clearError(field) {
    errorMessages[field].textContent = "";
    errorMessages[field].classList.add("hidden");
  }

  const offerList = document.getElementById("offer-list");

  // Function to fetch offers from the backend
  async function fetchOffers() {
    try {
      const response = await axios.get("/getOfferDetails");
      
      if (response.status === 200) {
        populateOfferList(response.data.offers);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      offerList.innerHTML = `<tr><td colspan="7" class="text-center py-4">Failed to load offers.</td></tr>`;
    }
  }

  // Function to populate the offer list
  function populateOfferList(offers) {
    offerList.innerHTML = ""; // Clear previous rows

    if (offers.length === 0) {
      offerList.innerHTML = `<tr><td colspan="7" class="text-center py-4">No offers available.</td></tr>`;
      return;
    }

    offers.forEach((offer) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="py-4 px-6">${offer.offerName}</td>
        <td class="py-4 px-6 capitalize">${offer.offerType}</td>
        <td class="py-4 px-6">${offer.discountType === "percentage" ? `${offer.discountValue}%` : `₹${offer.discountValue}`}</td>
        <td class="py-4 px-6">${formatDate(offer.startDate)}</td>
        <td class="py-4 px-6">${formatDate(offer.endDate)}</td>
        <td class="py-4 px-6">${offer.status || "Active"}</td>
        <td class="py-4 px-6 capitalize">
          ${offer.offerType === "category" ? offer.category : offer.productName || "N/A"}
        </td>
        <td class="py-4 px-6">
          <button class="text-blue-600 hover:underline" onclick="editOffer('${offer._id}')">Edit</button>
          <button class="text-red-600 hover:underline ml-2" onclick="deleteOffer('${offer._id}')">Delete</button>
        </td>
      `;

      offerList.appendChild(row);
    });
  }

  // Helper function to format dates
  function formatDate(date) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  }

  window.editOffer = function (offerId) {
  };


window.deleteOffer = async function (offerId) {
  // SweetAlert2 confirmation dialog
  const confirmation = await Swal.fire({
    title: "Are you sure?",
    text: "This action will permanently delete the offer. Do you want to proceed?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, keep it",
    dangerMode: true,
  });

  // Proceed with deletion only if confirmed
  if (confirmation.isConfirmed) {
    try {
      const response = await axios.delete(`/deleteOffer/${offerId}`); // Adjust the endpoint as necessary
      if (response.status === 200) {
        Swal.fire({
          title: "Deleted!",
          text: "The offer has been deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchOffers(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to delete the offer. Please try again later.",
        icon: "error",
      });
    }
  } else {
    Swal.fire({
      title: "Cancelled",
      text: "The offer was not deleted.",
      icon: "info",
      timer: 2000,
      showConfirmButton: false,
    });
  }
};


  // Fetch and display offers on page load
  fetchOffers();
});
