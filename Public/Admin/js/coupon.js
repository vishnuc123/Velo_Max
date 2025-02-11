document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const createCouponButton = document.getElementById("createCouponButton");
  const cancelButton = document.getElementById("cancelButton");
  const openModalBtn = document.getElementById("openModalBtn");
  const discountType = document.getElementById("discount-type");
  const discountAmount = document.getElementById("discount-amount");
  const couponForm = document.getElementById("couponForm");

  // Open/Close Modal
  openModalBtn.addEventListener("click", () => {
    couponForm.style.display = couponForm.style.display === "none" ? "block" : "none";
  });

  // Adjust discount-amount validation based on discount-type
  discountType.addEventListener("change", () => {
    const minPrice = +document.getElementById("min-price").value.trim();

    if (discountType.value === "percentage") {
      discountAmount.setAttribute("max", "100");
      discountAmount.setAttribute("placeholder", "Enter percentage (1-100)");
    } else if (discountType.value === "fixed") {
      discountAmount.setAttribute("max", `${minPrice || 9999}`);
      discountAmount.setAttribute("placeholder", `Enter fixed amount (<= ${minPrice || 'price'})`);
    }
  });

  // Form submission
  createCouponButton.addEventListener("click", async function (e) {
    e.preventDefault(); // Prevent default form submission behavior

    const fields = [
      { id: "coupon-name", message: "Please enter a coupon name." },
      { id: "coupon-code", message: "Please enter a coupon code." },
      { id: "usage-limit", message: "Please enter a valid usage limit." },
      { id: "usage-limit-per-user", message: "Please enter a valid usage limit per user." }, // New field
      { id: "discount-type", message: "Please select a discount type." },
      { id: "discount-amount", message: "Please enter a valid discount amount." },
      { id: "min-price", message: "Please enter a valid minimum price." },
      { id: "max-price", message: "Maximum price must be greater than minimum price." },
      { id: "start-date", message: "Please enter a start date." },
      { id: "end-date", message: "End date must be after start date." },
    ];

    let isValid = true;

    // Clear previous error messages
    fields.forEach((field) => {
      const errorElement = document.getElementById(`${field.id}-error`);
      if (errorElement) errorElement.classList.add("hidden");
    });

    // Validate each field
    fields.forEach((field) => {
      const element = document.getElementById(field.id);
      const value = element.value.trim();
      const errorElement = document.getElementById(`${field.id}-error`);

      // Field-specific validations
      if (!value) {
        isValid = false;
        if (errorElement) errorElement.textContent = field.message;
        if (errorElement) errorElement.classList.remove("hidden");
      } else if (field.id === "discount-amount") {
        const maxValue = discountType.value === "percentage" ? 100 : +document.getElementById("min-price").value.trim();
        if (+value <= 0 || +value > maxValue) {
          isValid = false;
          if (errorElement) errorElement.textContent = `Discount amount must be between 1 and ${maxValue}.`;
          if (errorElement) errorElement.classList.remove("hidden");
        }
      } else if (field.id === "usage-limit-per-user" && +value <= 0) {
        isValid = false;
        if (errorElement) errorElement.textContent = "Usage limit per user must be a positive number.";
        if (errorElement) errorElement.classList.remove("hidden");
      } else if (field.id === "max-price" && +value <= +document.getElementById("min-price").value.trim()) {
        isValid = false;
        if (errorElement) errorElement.textContent = field.message;
        if (errorElement) errorElement.classList.remove("hidden");
      } else if (field.id === "end-date" && new Date(value) <= new Date(document.getElementById("start-date").value.trim())) {
        isValid = false;
        if (errorElement) errorElement.textContent = field.message;
        if (errorElement) errorElement.classList.remove("hidden");
      }
    });

    if (isValid) {
      const couponData = {
        name: document.getElementById("coupon-name").value.trim(),
        code: document.getElementById("coupon-code").value.trim(),
        usageLimit: +document.getElementById("usage-limit").value.trim(),
        usageLimitPerUser: +document.getElementById("usage-limit-per-user").value.trim(), // New field data
        discountType: discountType.value,
        discountAmount: +discountAmount.value.trim(),
        minPrice: +document.getElementById("min-price").value.trim(),
        maxPrice: +document.getElementById("max-price").value.trim(),
        startDate: document.getElementById("start-date").value,
        endDate: document.getElementById("end-date").value,
      };

      try {
        // Make the API call to submit the form data
        Swal.fire({
          title: "Are you sure?",
          text: "Do you want to add this coupon?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, add it!",
          cancelButtonText: "No, cancel",
          background: "#000000",
          color: "#ffffff",
          customClass: {
            confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white",
            cancelButton: "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400",
          }
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const response = await axios.post("/addCoupon", couponData);
              Swal.fire({
                title: "Coupon Added",
                text: "Coupon added successfully!",
                icon: "success",
                background: "#000000",
                color: "#ffffff",
                confirmButtonText: "OK",
                customClass: {
                  confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
                }
              }).then(() => {
                couponForm.reset();
                window.location.reload();
                couponForm.style.display = "none";
              });
            } catch (error) {
              Swal.fire({
                title: "Error",
                text: "Failed to add the coupon. Please try again.",
                icon: "error",
                background: "#000000",
                color: "#ffffff",
                confirmButtonText: "OK",
                customClass: {
                  confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
                }
              });
            }
          }
        });
        
      } catch (error) {
        console.error("Error creating coupon:", error);
        alert("Failed to create coupon. Please try again.");
      }
    }
  });

  // Cancel button to reset the form
  cancelButton.addEventListener("click", () => {
    couponForm.style.display = "none";
    couponForm.reset();
    window.location.reload();
  });

  // Fetch coupons when the page loads
  fetchCoupons();
});

// Admin coupon listing
async function fetchCoupons() {
  try {
    const response = await axios.get("/getCouponList"); // Fetch coupons from the backend
    const coupons = response.data.coupons; // Assuming the backend returns an array of coupons

    const couponList = document.getElementById("coupon-list");
    couponList.innerHTML = ""; // Clear any previous content

    coupons.forEach((coupon) => {
      const row = document.createElement("tr");
      row.classList.add(
        "transform",
        "hover:scale-[1.01]",
        "transition-transform",
        "duration-200",
        "hover:bg-gray-50"
      );

      row.innerHTML = `
        <td class="py-4  px-6">${coupon.code}</td>
        <td class="py-4 px-6">${coupon.discountType}</td>
        <td class="py-4 px-8">${coupon.discountValue}%</td>
        <td class="py-4 px-6">${new Date(coupon.startDate).toLocaleDateString()}</td>
        <td class="py-4 px-6">${new Date(coupon.endDate).toLocaleDateString()}</td>
        <td class="py-4 px-6">
          <span class="px-3 py-1 text-xs font-medium ${coupon.isActive ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"} rounded-full">
            ${coupon.isActive ? "Active" : "Inactive"}
          </span>
        </td>
        <td class="py-4 px-6">
         
          <button class="bg-gray-400 text-red-600 hover:text-red-800 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded-full px-4 py-2 ml-2 hover:scale-105 active:scale-95">
            ${coupon.isActive ? "Block" : "Unblock"}
          </button>
        </td>
      `;

      couponList.appendChild(row); // Append the row to the table
    });

    // Add event listeners to "Delete" buttons
    const deleteButtons = document.querySelectorAll(".delete-coupon");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        const couponId = event.target.getAttribute("data-id");
        try {
          await axios.delete(`/deleteCoupon/${couponId}`);
          // alert("Coupon deleted successfully!");
          Swal.fire({
            title: 'coupon deleted',
            text: 'coupon deleted successfully',
            icon: 'success',
            background: '#000000',
            color: '#ffffff',
            confirmButtonText: 'OK',
            customClass: {
              confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'
            }
          });
          fetchCoupons(); // Refresh the list after deletion
        } catch (error) {
          console.error("Error deleting coupon:", error);
          alert("Failed to delete coupon. Please try again.");
        }
      });
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
  }
}
