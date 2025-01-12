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
      const addressDiv = document.createElement("div");
      addressDiv.classList.add(
        "p-4",
        "border",
        "border-gray-300",
        "rounded",
        "space-y-2"
      );
      addressDiv.innerHTML = `
                  <h3 class="font-medium">Address ${idx + 1}</h3>
                  <p><strong>Name:</strong> ${address.label}</p>
                  <p><strong>city:</strong> ${address.city || "Not provided"}</p>
                  <p><strong>Address:</strong> ${address.address}</p>
                  <p><strong>Postal Code:</strong> ${address.pincode}</p>
                  <p><strong>phoneNumber:</strong> ${address.phoneNumber}</p>
              `;
      existingAddressesContainer.appendChild(addressDiv);
    });
  }
}

//   // Toggle visibility of the Add Address form
//   console.log(document.getElementById("add-address-btn")); // Should log the button element
//   console.log(document.getElementById("add-address-form")); // Should log the form element

// Handle address form submission
saveAddressButton.addEventListener("click", () => {
  const label = document.getElementById("label").value;
  const city = document.getElementById("city").value;
  const address = document.getElementById("address").value;
  const pincode = document.getElementById("pincode").value;
  const phoneNumber = document.getElementById("phoneNumber").value;

  // Validate form fields (you can add more validation)
  if (!label || !city || !address || !pincode || !phoneNumber) {
    alert("Please fill in all required fields!");
    return;
  }

  // Save the new address
  const newAddress = {
    label,
    city,
    address,
    pincode,
    phoneNumber,
  };

  addresses.push(newAddress); // Add the new address to the array

  // Clear the form inputs
  document.getElementById("label").value = "";
  document.getElementById("address").value = "";
  document.getElementById("city").value = "";
  document.getElementById("pincode").value = "";
  document.getElementById("phoneNumber").value = "";

  // Hide the Add Address form
  addAddressForm.classList.add("hidden");
  // alert("Address added successfully!");
  Swal.fire({
    title: 'Success!',
    text: 'Address added successfully!',
    icon: 'success',
    confirmButtonText: 'OK',
    background: '#000000',  // Set background to black
    color: '#ffffff',  // Set text color to white
    confirmButtonColor: '#ffffff',  // Button color
    customClass: {
      title: 'text-white',  // Title color
      content: 'text-white',  // Content color
      confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'  // Button style
    }
  });
  // Re-render the addresses
  renderAddresses();
});

// Initial render when the page loads
renderAddresses();

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
async function getCartItems() {
  try {
    const response = await axios.get("/cartItems");
    const cartDetails = response.data;

    const cartItems = cartDetails.cartItems; // Array of cart items
    const cartList = document.getElementById("cart-list");
    cartList.innerHTML = ""; // Clear previous items
    let subtotal = 0;

    // Render each cart item
    cartItems.forEach((item, index) => {
      const itemPrice = item.price * item.quantity;
      subtotal += itemPrice;
      const itemElement = document.createElement("div");
      itemElement.className = "flex items-center space-x-4 border-b pb-4";
      itemElement.innerHTML = `
      <div class="flex gap-6 pb-6 border-b" data-product-id="${item.productId}" data-category-id="${item.categoryId}">
          <div class="w-32 h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
              <img src="${item.product.coverImage || "/placeholder.svg"}" 
                   alt="Product" 
                   class="w-full h-full object-cover">
          </div>
          <div class="flex-1">
              <h3 class="text-lg font-medium">${item.product.productName}</h3>
              <div class="flex items-start justify-between mt-4">
                  <div class="flex-1">
                      <p class="text-sm text-gray-700">
                          Selected Quantity: <span class="quantityDisplay" data-index="${index}">${item.quantity}</span>
                      </p>
                      <p class="text-sm text-gray-500">
                          Available Stock: <span class="stockDisplay" data-index="${index}">${item.product.Stock}</span>
                      </p>
                      <p class="text-lg font-medium itemTotalPrice self-start" data-index="${index}">₹${itemPrice.toFixed(2)}</p>
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
    document.getElementById("subtotal").textContent = `₹${subtotal.toFixed(2)}`;
    updateTotal(subtotal); // Update total with shipping

    // Attach event listeners
    attachCartEventListeners(cartItems, subtotal);
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
  const quantityElement = document.querySelector(
    `.quantityInput[data-index="${index}"]`
  );
  const itemPriceElement = document.querySelector(
    `.itemTotalPrice[data-index="${index}"]`
  );

  const itemPrice = item.price * item.quantity;

  // Update quantity and item price in DOM
  quantityElement.textContent = item.quantity;
  itemPriceElement.textContent = `₹${itemPrice.toFixed(2)}`;

  // Update subtotal
  let subtotal = 0;
  cartItems.forEach((cartItem) => {
    subtotal += cartItem.price * cartItem.quantity;
  });

  subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
  updateTotal(subtotal);
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
  getCartItems();

  document.querySelectorAll('input[name="shipping"]').forEach((option) => {
    option.addEventListener("change", () => {
      const subtotal =
        parseFloat(
          document.getElementById("subtotal").textContent.replace("₹", "")
        ) || 0;
      updateTotal(subtotal);
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
      const couponCode = document.getElementById("coupon").value; // Get the coupon code
  
      // Assuming couponDiscount is the element with the discount text
      const couponDiscountElement = document.getElementById("couponDiscount"); // Get the element containing the discount text
  
      // Extract discount text from the element
      const discountText = couponDiscountElement.textContent.trim();
  
      // Regular expression to extract the discount amount (₹42118.44)
      const discountAmountMatch = discountText.match(/\(₹([\d,]+\.\d{2})\)/);
  
      let couponDiscount = 0; // Default to 0 if no match is found
  
      // If a match is found, extract the discount value and convert it to a number
      if (discountAmountMatch && discountAmountMatch[1]) {
          couponDiscount = parseFloat(discountAmountMatch[1].replace(",", "")); // Remove commas if any, and parse as float
      }
  
      console.log("Coupon Discount:", couponDiscount); // Log the extracted coupon discount (e.g., 42118.44)
  
      // Get the email input value
      const email = document.getElementById("email").value;
      if (!email) {
        alert("Please provide an email for order updates.");
        return;
      }
  
      // Check if an address is selected
      const selectedAddressCard = document.querySelector('#existing-addresses > div[style*="border-color: red"]');
      if (!selectedAddressCard) {
        alert("Please select an address.");
        return;
      }
  
      // Extract the address details from the selected address card
      const addressDetails = {
        label: selectedAddressCard.querySelector("h3").textContent.trim(),
        address: selectedAddressCard.querySelector("p.text-gray-600:nth-of-type(1)").textContent.trim(),
        city: selectedAddressCard.querySelector("p.text-gray-600:nth-of-type(2)").textContent.trim(),
        pinCode: selectedAddressCard.querySelector("p.text-gray-600:nth-of-type(3)").textContent.trim(),
        phoneNumber: selectedAddressCard.querySelector("p.text-gray-600:nth-of-type(4)").textContent.replace("Phone: ", "").trim(),
      };
  
      // Fetch the shipping charge from the DOM
      const shippingChargeText = document.getElementById("shipping").textContent.trim();
      const shippingCharge = shippingChargeText === "Free" ? 0 : parseFloat(shippingChargeText.replace("₹", ""));
  
      // Fetch the cart data
      const cartResponse = await axios.get("/cartdata");
      const cartdata = cartResponse.data;
      if (!cartdata || !Array.isArray(cartdata.cartData) || cartdata.cartData.length === 0) {
        alert("Cart is empty or invalid data.");
        return;
      }
  
      // Log the cart data to verify
      console.log("Cart Data:", cartdata);
  
      // Get the selected payment method
      const paymentMethodElement = document.querySelector('input[name="payment"]:checked');
      if (!paymentMethodElement) {
        alert("Please select a payment method.");
        return;
      }
      const paymentMethod = paymentMethodElement.value;
      console.log("Payment Method:", paymentMethod);
  
      // Prepare the request payload with all necessary information
      const payload = {
        couponCode,
        couponDiscount,
        email,
        addressDetails,
        shippingCharge,
        paymentMethod,
        cartdata,
      };
  
      const payNowButton = document.getElementById('payNowButton');
      payNowButton.disabled = true;
      payNowButton.textContent = 'Processing...';

      if (paymentMethod === 'paypal') {
          // Handle PayPal Payment
          const paypalResponse = await axios.post('/cart-process-paypal-payment', payload);
          console.log(paypalResponse.data);
          
          const { approvalUrl } = paypalResponse.data;

          if (paypalResponse.status === 200 && approvalUrl) {
              // Redirect user to PayPal for authorization
              window.location.href = approvalUrl;
          } else {
              alert('PayPal payment setup failed. Please try again.');
          }
      } else {
          // Handle other payment methods
          const response = await axios.post('/cart-process-payment', payload);

          if (response.status === 200) {
            const orderDetails = response.data.order;
            
            // SweetAlert with custom styles and Yes/No confirmation
            Swal.fire({
              icon: 'success',
              title: 'Order placed Successfully!',
              text: 'Do you want to proceed to the order success page?',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              background: '#000000', // Black background
              color: '#ffffff', // White text color
              backdrop: `
                rgba(0,0,0,0.8)
                url("/images/nyan-cat.gif")
                left top
                no-repeat
              `, // Custom backdrop with an image
              showClass: {
                popup: `
                  animate__animated
                  animate__fadeInDown
                  animate__faster
                `
              },
              hideClass: {
                popup: `
                  animate__animated
                  animate__fadeOutUp
                  animate__faster
                `
              },
              customClass: {
                title: 'text-white',
                content: 'text-gray-300',
                confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white',
                cancelButton: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600'
              }
            }).then((result) => {
              if (result.isConfirmed) {
                // If the user clicks 'Yes', redirect to order success page
                window.location.href = `/orderSuccess/${orderDetails._id}`;
              } else {
                // Optionally, handle the 'No' action (e.g., stay on the current page)
                console.log("Payment confirmed, but user chose not to proceed.");
              }
            });
          
          } else {
            // In case payment fails, with the same custom styling as above
            Swal.fire({
              icon: 'error',
              title: 'Payment Failed',
              text: 'Please try again.',
              timer: 3000,
              showConfirmButton: false,
              background: '#000000',
              color: '#ffffff',
              backdrop: `
                rgba(0,0,0,0.8)
                url("/images/nyan-cat.gif")
                left top
                no-repeat
              `, // Custom backdrop with an image
              showClass: {
                popup: `
                  animate__animated 
                  animate__flipInX
                  animate__faster
                `
              },
              hideClass: {
                popup: `
                  animate__animated
                  animate__flipOutX
                  animate__faster
                `
              },
              customClass: {
                title: 'text-white',
                content: 'text-gray-300',
                confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'
              }
            });
          }
          
      }
  } catch (error) {
      console.error('Error processing payment:', error);
      alert('An error occurred while processing payment. Please try again later.');
  } finally {
      const payNowButton = document.getElementById('payNowButton');
      payNowButton.disabled = false;
      payNowButton.textContent = 'Pay Now';
  }
  });
  