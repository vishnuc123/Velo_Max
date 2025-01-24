


// Initialize an empty array to hold addresses
let addresses = [];

// Select elements
const addAddressButton = document.getElementById("add-address-btn");
const addAddressForm = document.getElementById("add-address-form");
const saveAddressButton = document.getElementById("save-address-btn");
const existingAddressesContainer =
  document.getElementById("existing-addresses");

// Function to render the existing addresses
function renderAddresses() {
  existingAddressesContainer.innerHTML = ""; // Clear current addresses
  if (addresses.length === 0) {
    existingAddressesContainer.innerHTML =
      "<p class='text-gray-600'>No existing addresses found.</p>";
  } else {
    addresses.forEach((address, idx) => {
      const addressCard = document.createElement("div");
      addressCard.className =
        "border bg-white rounded-lg p-4 hover:border-black-500 transition-colors duration-200";
      addressCard.id = `addressCard-${idx}`;

      // Set red border for the first address initially
      if (idx === 0) {
        addressCard.style.borderColor = "red";
      }

      addressCard.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold">${address.label}</h3>
                        <p class="text-gray-600">
                            ${address.address}<br>
                            <p class="text-gray-600">${address.city}</p>
                            <p class="text-gray-600">${address.pincode}<br></p>
                            <p class="text-gray-600">Phone: ${address.phoneNumber}<br></p>
                        </p>
                    </div>
                    <button class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 select-btn" data-id="${idx}">
                        Select
                    </button>
                </div>
            `;

      existingAddressesContainer.appendChild(addressCard);
    });

    // Add event listeners to "Select" buttons
    const selectButtons = document.querySelectorAll(".select-btn");
    selectButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const addressId = e.target.dataset.id; // Get the address ID

        // Reset all address borders
        document
          .querySelectorAll("#existing-addresses > div")
          .forEach((card) => {
            card.style.borderColor = "transparent";
          });

        // Highlight the selected address
        const selectedCard = document.getElementById(`addressCard-${addressId}`);
        selectedCard.style.borderColor = "red";

        console.log("Selected address ID:", addressId);
        // Perform further actions (e.g., save the selected address)
      });
    });
  }
}

//   // Toggle visibility of the Add Address form
//   console.log(document.getElementById("add-address-btn")); // Should log the button element
//   console.log(document.getElementById("add-address-form")); // Should log the form element

// Handle address form submission
saveAddressButton.addEventListener("click", async (event) => {
  event.preventDefault(); // Prevent default form submission if inside a form

  const label = document.getElementById("label").value;
  const city = document.getElementById("city").value;
  const address = document.getElementById("address").value;
  const pinCode = document.getElementById("pinCode").value;
  const phoneNumber = document.getElementById("phoneNumber").value;

  // Regex for validation
  const labelRegex = /^[a-zA-Z0-9\s]{3,100}$/;
  const cityRegex = /^[a-zA-Z\s]{3,50}$/;
  const addressRegex = /^[a-zA-Z0-9\s,.-]{5,200}$/;
  const pincodeRegex = /^[0-9]{6}$/;
  const phoneNumberRegex = /^[0-9]{10}$/;

  // Validate form fields using regex
  if (!label || !labelRegex.test(label)) {
    showAlert("Error!", "Please enter a valid label (3 to 100 characters, letters, and numbers only).");
    return;
  }

  if (!city || !cityRegex.test(city)) {
    showAlert("Error!", "Please enter a valid city (3 to 50 characters, letters and spaces only).");
    return;
  }

  if (!address || !addressRegex.test(address)) {
    showAlert("Error!", "Please enter a valid address (5 to 200 characters, letters, numbers, spaces, commas, periods, and dashes).");
    return;
  }

  if (!pinCode || !pincodeRegex.test(pinCode)) {
    showAlert("Error!", "Please enter a valid pincode (6 digits only).");
    return;
  }

  if (!phoneNumber || !phoneNumberRegex.test(phoneNumber)) {
    showAlert("Error!", "Please enter a valid phone number (10 digits only).");
    return;
  }

  // Show confirmation alert before proceeding
  const result = await Swal.fire({
    title: "Confirm",
    text: "Do you want to save this address?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, save it!",
    cancelButtonText: "Cancel",
    background: "#000000",
    color: "#ffffff",
    confirmButtonColor: "#ffffff",
    cancelButtonColor: "#ff0000",
    customClass: {
      title: "text-white",
      content: "text-white",
      confirmButton:
        "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white",
      cancelButton:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-white",
    },
  });

  if (result.isConfirmed) {
    try {
      // Prepare the form data
      const formData = {
        label,
        city,
        address,
        pinCode,
        phoneNumber,
      };

      // Submit the form data using Axios
      const response = await axios.post('/submit-address', formData);

      // Check if the response is successful
      if (response.status === 200 && response.data.message === 'Address added successfully.') {
        // Clear the form inputs
        document.getElementById("label").value = "";
        document.getElementById("address").value = "";
        document.getElementById("city").value = "";
        document.getElementById("pinCode").value = "";
        document.getElementById("phoneNumber").value = "";

        // Hide the Add Address form
        addAddressForm.classList.add("hidden");

        // Display success message with SweetAlert
        await Swal.fire({
          title: "Success!",
          text: response.data.message,
          icon: "success",
          confirmButtonText: "OK",
          background: "#000000",
          color: "#ffffff",
          confirmButtonColor: "#ffffff",
          customClass: {
            title: "text-white",
            content: "text-white",
            confirmButton:
              "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white",
          },
        }).then(() => {
          // Reload the page after the user clicks "OK"
          window.location.reload();
        });
        console.log("Address submission confirmed by the user.");
      } else {
        throw new Error("Unexpected response status or message.");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "An error occurred while saving the address. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        background: "#000000",
        color: "#ffffff",
        confirmButtonColor: "#ffffff",
        customClass: {
          title: "text-white",
          content: "text-white",
          confirmButton:
            "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white",
        },
      });
    }
  }
});





async function getAddress() {
  try {
    const response = await axios.get("/get-address"); // Fetch addresses from backend
    const addresses = response.data.addresses; // Extract addresses from the response
    const addressContainer = document.getElementById("existing-addresses"); // Get the container for addresses

    addresses.forEach((address, index) => {
      // Create a card for each address
      const addressCard = document.createElement("div");
      addressCard.className =
        "border bg-white rounded-lg p-4 hover:border-black-500 transition-colors duration-200";
      addressCard.id = `addressCard-${address._id}`;

      // Set red border for the first address initially
      if (index === 0) {
        addressCard.style.borderColor = "red";
      }

      addressCard.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold">${address.label}</h3>
                        <p class="text-gray-600">
                            ${address.address}<br>
                            <p class="text-gray-600">${address.city}</p>
                            <p class="text-gray-600">${address.pinCode}<br></p>
                            <p class="text-gray-600">Phone: ${address.phoneNumber}<br></p>
                            

                           
                        </p>
                    </div>
                    <button class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 select-btn" data-id="${address._id}">
                        Select
                    </button>
                </div>
            `;

      addressContainer.appendChild(addressCard);
    });

    // Add event listeners to "Select" buttons
    const selectButtons = document.querySelectorAll(".select-btn");
    selectButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const addressId = e.target.dataset.id; // Get the address ID

        // Reset all address borders
        document
          .querySelectorAll("#existing-addresses > div")
          .forEach((card) => {
            card.style.borderColor = "transparent";
          });

        // Highlight the selected address
        const selectedCard = document.getElementById(
          `addressCard-${addressId}`
        );
        selectedCard.style.borderColor = "red";

        console.log("Selected address ID:", addressId);
        // Perform further actions (e.g., save the selected address)
      });
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
  }
}

// Load existing addresses on page load
getAddress();

// Fetch and render cart items
async function fetchCart() {
  try {
    const response = await axios.get("/cartItems");
    const cartDetails = response.data;

    const cartItems = cartDetails.cartItems; // Array of cart items
    const cartList = document.getElementById("cart-list");
    cartList.innerHTML = ""; // Clear previous items

    // Check if cart is empty
    if (cartItems.length === 0) {
      cartList.innerHTML = `<p class="text-gray-600">Your cart is empty.</p>
      <button onclick="window.location.href='/dashboard/products'" class="btn btn-primary mt-4">
        Browse Products &#8594;
      </button>`;
      document.getElementById("subtotal").textContent = "₹0.00";
      document.getElementById("total-discount").textContent = "Total Discount: ₹0.00";
      document.getElementById("total-price").textContent = "₹0.00";
      updateTotal(0); // Update total with shipping for empty cart
      return;
    }

    let subtotal = 0;
    let totalDiscount = cartDetails.totalPrice - cartDetails.totalDiscountedPrice;

    // Render each cart item
    cartItems.forEach((item) => {
      const actualPrice = item.price; // Original price of the product
      const productOffer = item.offers?.productOffer || null; // Ensure productOffer is defined
      const categoryOffer = item.offers?.categoryOffer || null; // Ensure categoryOffer is defined

      // Determine the best discount price (product or category offer)
      const discountPrice = productOffer
        ? productOffer.discountType === "percentage"
          ? actualPrice * (1 - productOffer.discountValue / 100)
          : actualPrice - productOffer.discountValue
        : actualPrice;

      const categoryDiscountPrice = categoryOffer
        ? categoryOffer.discountType === "percentage"
          ? actualPrice * (1 - categoryOffer.discountValue / 100)
          : actualPrice - categoryOffer.discountValue
        : discountPrice;

      const finalPrice = Math.min(discountPrice, categoryDiscountPrice);
      const itemPrice = finalPrice * item.quantity;
      subtotal += itemPrice;

      // Create offer messages
      let offerMessage = "";

      if (productOffer) {
        offerMessage += `
          <p class="text-sm text-green-600 font-medium mt-2">
            Product Offer: ${productOffer.offerName} 
            (${productOffer.discountType === "percentage"
              ? productOffer.discountValue + "% Off"
              : "₹" + productOffer.discountValue + " Off"})
          </p>`;
      }

      if (categoryOffer) {
        offerMessage += `
          <p class="text-sm text-blue-600 font-medium mt-2">
            Category Offer: ${categoryOffer.offerName} 
            (${categoryOffer.discountType === "percentage"
              ? categoryOffer.discountValue + "% Off"
              : "₹" + categoryOffer.discountValue + " Off"})
          </p>`;
      }

      const itemElement = document.createElement("div");
      itemElement.className = "flex items-center space-x-4 border-b pb-4";
      itemElement.innerHTML = `
        <div class="flex gap-6 pb-6 border-b" data-product-id="${item.productId}" data-category-id="${item.categoryId}">
            <div class="w-32 h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                <img src="${item.productDetails.coverImage || "/placeholder.svg"}" 
                     alt="Product" 
                     class="w-full h-full object-cover">
            </div>
            <div class="flex-1">
                <h3 class="text-lg font-medium">${item.productDetails.productName}</h3>
                ${offerMessage}
                <div class="flex items-start justify-between mt-4">
                    <div class="flex-1">
                        <p class="text-sm text-gray-700">
                            Selected Quantity: <span>${item.quantity}</span>
                        </p>
                        <p class="text-lg font-medium itemTotalPrice">₹${itemPrice.toFixed(2)}</p>
                        <p class="text-sm text-gray-500 line-through">
                            Original Price: ₹${actualPrice }
                        </p>
                    </div>
                </div>
                <button class="mt-4 text-gray-500 hover:text-gray-700" onclick="removeCartItem('${item.productId}')">
                    Remove
                </button>
            </div>
        </div>
      `;

      cartList.appendChild(itemElement);
    });

    // Update totals
    document.getElementById("subtotal").textContent = `₹${cartDetails.totalPrice.toFixed(2)}`;
    document.getElementById("total-discount").textContent = `Total Discount: ₹${totalDiscount.toFixed(2)}`;
    document.getElementById("total").textContent = `₹${cartDetails.totalDiscountedPrice.toFixed(2)}`;
    updateTotal(cartDetails.totalDiscountedPrice); // Update total with shipping
  } catch (error) {
    console.error("Failed to fetch cart items:", error);
  }
}



// Update cart display
async function updateCartDisplay(
  item,
  index,
  cartItems,
  cartTotalElement,
  subtotalElement,
  shippingElement
) {
  try {
    const quantityElement = document.querySelector(
      `.quantityInput[data-index="${index}"]`
    );
    const itemPriceElement = document.querySelector(
      `.itemTotalPrice[data-index="${index}"]`
    );

    // Recalculate the item price with quantity
    const itemPrice = item.price * item.quantity;

    // Update the quantity and item price in the DOM
    if (quantityElement && itemPriceElement) {
      quantityElement.textContent = item.quantity;
      itemPriceElement.textContent = `₹${itemPrice.toFixed(2)}`;
    }

    // Recalculate the new subtotal for all cart items
    let subtotal = 0;
    cartItems.forEach((cartItem) => {
      subtotal += cartItem.price * cartItem.quantity;
    });

    // Calculate the shipping cost based on subtotal
    const shippingCost = calculateShipping(subtotal);

    // Update subtotal, shipping, and total in the DOM
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    shippingElement.textContent = shippingCost === 0 ? "Free" : `₹${shippingCost}`;

    // Update the total including the shipping cost
    cartTotalElement.textContent = `₹${(subtotal + shippingCost).toFixed(2)}`;

    // Sync updated quantity and item price with the server
    await axios.post("/updateCartItem", {
      productId: item.productId,
      quantity: item.quantity,
      price: itemPrice, // Sending updated price for the item
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
  }
}

// Update total including shipping
function updateTotal(subtotal) {
  const shippingOptions = document.querySelector(
    'input[name="shipping"]:checked'
  );
  const shippingCost =
    shippingOptions && shippingOptions.value === "Express" ? 80 : 0;

  document.getElementById("shipping").textContent =
    shippingCost === 0 ? "Free" : `₹${shippingCost}`;
  document.getElementById("total").textContent =
    `₹${(subtotal + shippingCost).toFixed(2)}`;
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  const walletButton = document.getElementById('wallet');
  const currentBalance = document.getElementById('currentBalance');

  walletButton.addEventListener('click', async () => {
      const response = await axios.get('/getWalletDetails');
      const walletDetails = response.data;

      // Update the current balance with the text and value
      currentBalance.innerHTML = `Current Balance: ₹${walletDetails.walletDetails.balance.toFixed(2)}`;
  })
  
  fetchCart();

  document.querySelectorAll('input[name="shipping"]').forEach((option) => {
    option.addEventListener("change", () => {
      const total =
        parseFloat(
          document.getElementById("total").textContent.replace("₹", "")
        ) || 0;
      updateTotal(total);
    });
  });
});

function calculateShipping(subtotal) {
  if (subtotal >= 500) {
    return 0; // Free shipping for orders over ₹500
  }
  return 80; // ₹80 for orders below ₹500
}
async function updateCartDisplay(
  item,
  index,
  cartItems,
  cartTotalElement,
  subtotalElement,
  shippingElement
) {
  try {
    const quantityElement = document.querySelector(
      `.quantityInput[data-index="${index}"]`
    );
    const itemPriceElement = document.querySelector(
      `.itemTotalPrice[data-index="${index}"]`
    );

    const itemPrice = item.price * item.quantity;

    // Update the quantity and item price in the DOM
    if (quantityElement && itemPriceElement) {
      quantityElement.textContent = item.quantity;
      itemPriceElement.textContent = `₹${itemPrice.toFixed(2)}`;
    }

    // Calculate new subtotal
    let subtotal = 0;
    cartItems.forEach((cartItem) => {
      subtotal += cartItem.price * cartItem.quantity;
    });

    // Update subtotal, total, and shipping in the DOM
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    const shippingCost = calculateShipping(subtotal);
    shippingElement.textContent =
      shippingCost === 0 ? "Free" : `₹${shippingCost}`;
    cartTotalElement.textContent = `₹${(subtotal + shippingCost).toFixed(2)}`;

    // Sync updated quantity with the server
    await axios.post("/updateCartItem", {
      productId: item.productId,
      quantity: item.quantity,
      price: itemPrice,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
  }
}

// Handle address form toggle
document.getElementById("add-address-btn").addEventListener("click", () => {
  const addAddressForm = document.getElementById("add-address-form");
  if (addAddressForm) {
    addAddressForm.classList.toggle("hidden");
  }
});

// Event listener for payment button
// Event listener for payment button
document.getElementById("payNowButton").addEventListener("click", async () => {
  try {
    // Check if the cart is empty by inspecting the cart list HTML
    const cartList = document.getElementById("cart-list");
    const cartEmptyMessage = cartList.innerHTML.trim() === '<p class="text-gray-600">Your cart is empty.</p><button onclick="window.location.href=\'/dashboard/products\'" class="btn btn-primary mt-4">Browse Products &#8594;</button>';

    if (cartEmptyMessage) {
      // Show an alert when the cart is empty with the custom design
      Swal.fire({
        title: "Oops! Your Cart is Empty",
        text: "Please add items to your cart before checking out.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        position: 'top',
        customClass: {
          popup: 'max-w-md w-full p-4 bg-white shadow-lg rounded-lg fixed top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 transition-all ease-in-out duration-500',
          image: 'rounded-md order-first',
          title: 'text-lg font-semibold text-gray-800 text-left',
          htmlContainer: 'flex-grow',
          text: 'text-sm text-gray-600 text-left',
        },
        html: ` 
          <button onclick="window.location.href='/dashboard/products'" class="btn btn-primary mt-4">Discover Products You Might Like &#8594;</button>
        `,
        backdrop: `rgba(0,0,0,0.4) left top no-repeat`,
        willOpen: () => {
          document.querySelector('.swal2-popup').style.opacity = '0';
        },
        didOpen: () => {
          document.querySelector('.swal2-popup').style.transition = 'opacity 0.5s ease-in-out';
          document.querySelector('.swal2-popup').style.opacity = '1';
        },
      });
      return; // Stop execution if cart is empty
    }

    // Get the coupon code from the input field
    const couponCode = document.getElementById("coupon").value;

    // Extract coupon discount amount from the text
    const couponDiscountElement = document.getElementById("couponDiscount");
    const discountText = couponDiscountElement.textContent.trim();
    const discountAmountMatch = discountText.match(/\(₹([\d,]+\.\d{2})\)/);
    let couponDiscount = 0;
    if (discountAmountMatch && discountAmountMatch[1]) {
      couponDiscount = parseFloat(discountAmountMatch[1].replace(",", ""));
    }

    // Get the email input value
    const email = document.getElementById("email").value;
    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please provide an email for order updates.',
        timer: 3000,
        showConfirmButton: false,
        background: "#000000",
        color: "#ffffff",
        backdrop: `rgba(0,0,0,0.8) url("/images/nyan-cat.gif") left top no-repeat`,
        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp animate__faster',
        },
        customClass: {
          title: "text-white",
          content: "text-gray-300",
        },
      });
      return;
    }

    // Check if an address is selected
    const selectedAddressCard = document.querySelector(
      '#existing-addresses > div[style*="border-color: red"]'
    );
    if (!selectedAddressCard) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select an address.',
        timer: 3000,
        showConfirmButton: false,
        background: "#000000",
        color: "#ffffff",
        // backdrop: `rgba(0,0,0,0.8) url("/images/nyan-cat.gif") left top no-repeat`,
        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp animate__faster',
        },
        customClass: {
          title: "text-white",
          content: "text-gray-300",
        },
      });
      return;
    }

    // Extract address details
    const addressDetails = {
      label: selectedAddressCard.querySelector("h3").textContent.trim(),
      address: selectedAddressCard.querySelector("p.text-gray-600:nth-of-type(1)").textContent.trim(),
      city: selectedAddressCard.querySelector("p.text-gray-600:nth-of-type(2)").textContent.trim(),
      pinCode: selectedAddressCard.querySelector("p.text-gray-600:nth-of-type(3)").textContent.trim(),
      phoneNumber: selectedAddressCard.querySelector("p.text-gray-600:nth-of-type(4)").textContent.replace("Phone: ", "").trim(),
    };

    // Get shipping charge
    const shippingChargeText = document.getElementById("shipping").textContent.trim();
    const shippingCharge = shippingChargeText === "Free" ? 0 : parseFloat(shippingChargeText.replace("₹", ""));

    // Fetch cart data
    const cartResponse = await axios.get("/cartdata");
    const cartdata = cartResponse.data;
    if (!cartdata || !Array.isArray(cartdata.cartData) || cartdata.cartData.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Your cart is empty or the cart data is invalid.',
        timer: 3000,
        showConfirmButton: false,
        background: "#000000",
        color: "#ffffff",
        backdrop: `rgba(0,0,0,0.8) url("/images/nyan-cat.gif") left top no-repeat`,
        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp animate__faster',
        },
        customClass: {
          title: "text-white",
          content: "text-gray-300",
        },
      });
      return;
    }

    // Get payment method
    const paymentMethodElement = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethodElement) {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Please select a payment method.',
        timer: 3000,
        showConfirmButton: false,
        background: "#000000",
        color: "#ffffff",
        backdrop: `rgba(0,0,0,0.8) url("/images/nyan-cat.gif") left top no-repeat`,
        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp animate__faster',
        },
        customClass: {
          title: "text-white",
          content: "text-gray-300",
        },
      });
      return;
    }
    const paymentMethod = paymentMethodElement.value;

    // Get shipping method
    const shippingMethodElement = document.querySelector('input[name="shipping"]:checked');
    if (!shippingMethodElement) {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Please select a shipping method.',
        timer: 3000,
        showConfirmButton: false,
        background: "#000000",
        color: "#ffffff",
        backdrop: `rgba(0,0,0,0.8) url("/images/nyan-cat.gif") left top no-repeat`,
        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp animate__faster',
        },
        customClass: {
          title: "text-white",
          content: "text-gray-300",
        },
      });
      return;
    }
    const shippingMethod = shippingMethodElement.value;

    // Prepare the payload
    const payload = {
      couponCode,
      couponDiscount,
      email,
      addressDetails,
      shippingCharge,
      shippingMethod,
      paymentMethod,
      cartdata,
    };

    const payNowButton = document.getElementById("payNowButton");
    payNowButton.disabled = true;
    payNowButton.textContent = "Processing...";

    // Handle payment methods
    if (paymentMethod === "paypal") {
      const paypalResponse = await axios.post("/cart-process-paypal-payment", payload);
      const { approvalUrl } = paypalResponse.data;
      if (paypalResponse.status === 200 && approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'PayPal payment setup failed. Please try again.',
          timer: 3000,
          showConfirmButton: false,
          background: "#000000",
          color: "#ffffff",
          backdrop: `rgba(0,0,0,0.8) url("/images/nyan-cat.gif") left top no-repeat`,
          showClass: {
            popup: 'animate__animated animate__fadeInDown animate__faster',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp animate__faster',
          },
          customClass: {
            title: "text-white",
            content: "text-gray-300",
          },
        });
      }
    }
    
    else if (paymentMethod === 'wallet') {
      // Handle Wallet Payment
      const walletResponse = await axios.get('/getWalletDetails');
      const { balance } = walletResponse.data.walletDetails;
      const totalPrice = cartdata.cartData[0].totalPrice;
      if (balance < totalPrice) {
        Swal.fire({
          title: 'Insufficient Balance',
          text: 'Your Wallet Has Not Enough Balance To Buy This Product. Please Add Money To Continue Payment.',
          icon: 'warning',
          background: '#000000',
          color: '#ffffff',
          showCancelButton: true,
          confirmButtonText: 'Go to Wallet',
          cancelButtonText: 'Cancel',
          customClass: {
              confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white',
              cancelButton: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600'
          },
          preConfirm: () => {
              // Redirect to the wallet page
              window.location.href = '/wallet'; // Adjust this URL based on your application routing
          }
      });
      
      } else {
          // Proceed with wallet payment
          const response = await axios.post('/process-cart-wallet-payment', payload);

          if (response.status === 200) {
              Swal.fire({
                  icon: 'success',
                  title: 'Payment Successful',
                  text: 'Your payment with the wallet has been processed.',
                  confirmButtonText: 'OK'
              }).then(() => {
                  window.location.href = `/orderSuccess/${response.data.order._id}`;
              });
          } else {
              Swal.fire({
                  icon: 'error',
                  title: 'Payment Failed',
                  text: 'Please try again.',
                  timer: 3000,
                  showConfirmButton: false
              });
          }
      }
  }



    else {
      const response = await axios.post("/cart-process-payment", payload);
      if (response.status === 200) {
        const orderDetails = response.data.order;
        Swal.fire({
          icon: "success",
          title: "Order placed Successfully!",
          text: "Do you want to proceed to the order success page?",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          background: "#000000",
          color: "#ffffff",
          backdrop: `rgba(0,0,0,0.8) url("/images/nyan-cat.gif") left top no-repeat`,
          showClass: {
            popup: 'animate__animated animate__fadeInDown animate__faster',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp animate__faster',
          },
          customClass: {
            title: "text-white",
            content: "text-gray-300",
            confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white",
            cancelButton: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = `/orderSuccess/${orderDetails._id}`;
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Payment Failed. Please try again later.',
          timer: 3000,
          showConfirmButton: false,
          background: "#000000",
          color: "#ffffff",
          backdrop: `rgba(0,0,0,0.8) url("/images/nyan-cat.gif") left top no-repeat`,
          showClass: {
            popup: 'animate__animated animate__fadeInDown animate__faster',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp animate__faster',
          },
          customClass: {
            title: "text-white",
            content: "text-gray-300",
          },
        });
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    Swal.fire({
      icon: 'error',
      title: 'Oops!',
      text: 'Something went wrong. Please try again later.',
      timer: 3000,
      showConfirmButton: false,
      background: "#000000",
      color: "#ffffff",
      backdrop: `rgba(0,0,0,0.8) url("/images/nyan-cat.gif") left top no-repeat`,
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster',
      },
      customClass: {
        title: "text-white",
        content: "text-gray-300",
      },
    });
  } finally {
    const payNowButton = document.getElementById("payNowButton");
    payNowButton.disabled = false;
    payNowButton.textContent = "Pay Now";
  }
});
