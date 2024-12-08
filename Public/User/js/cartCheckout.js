document.addEventListener("DOMContentLoaded", async () => {
  const cartContainer = document.querySelector(".cart-container"); // Target the container for cart items
  const orderSubtotal = document.querySelector(".order-subtotal"); // Target for subtotal
  const orderTotal = document.querySelector(".order-total"); // Target for total
  const orderShipping = document.querySelector(".order-shipping"); // Target for shipping cost
  const shippingForm = document.querySelector("#shipping-form"); // Shipping method form

  let cartItems = []; // Initialize an empty array to store cart items
  let shippingCost = 0; // Default shipping cost is free (Standard Shipping)

  // Function to calculate subtotal and total
  function calculateTotals() {
    let subtotal = 0;
    cartItems.forEach((item) => {
      const quantity = parseInt(item.quantity);
      const totalPrice = item.price * quantity;
      subtotal += totalPrice;
    });

    // Update UI
    orderSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
    orderShipping.textContent = `₹${shippingCost.toFixed(2)}`; // Update shipping cost
    orderTotal.textContent = `₹${(subtotal + shippingCost).toFixed(2)}`; // Total = Subtotal + Shipping
  }

  // Event listener for shipping method selection
  shippingForm.addEventListener("change", (event) => {
    if (event.target.type === "radio") {
      const selectedMethod = event.target.nextElementSibling.textContent.trim(); // Get the label text
      shippingCost = selectedMethod === "Express Shipping" ? 80 : 0; // Set shipping cost based on selection
      calculateTotals(); // Recalculate totals
    }
  });

  // Function to generate the cart HTML
  function generateCartHTML(cartItems) {
    
    return cartItems
      .map((item) => {
        const totalPrice = item.price * item.quantity;
        console.log(item);
        

        return `
          <div class="flex items-center space-x-4 border-b pb-4" data-id="${item.productId}">
              <img src="${item.product.coverImage}" alt="${item.product.productName}" class="w-20 h-20 object-cover rounded-md">
              <div class="flex-grow">
                  <h3 class="font-medium">${item.product.productName}</h3>
                  <div class="flex items-center mt-2">
                      <button class="text-gray-500 hover:text-gray-700 decrease-quantity" data-id="${item.productId}">-</button>
                      <span class="mx-2 quantity-input">${item.quantity}</span>
                      <button class="text-gray-500 hover:text-gray-700 increase-quantity" data-id="${item.productId}">+</button>
                  </div>
              </div>
              <div class="text-right">
                  <p class="text-lg font-semibold item-total" data-id="${item.productId}">₹${totalPrice.toFixed(2)}</p>
                  <button class="mt-4 text-red-500 hover:text-red-700 remove-btn" data-id="${item.productId}">Remove</button>
              </div>
          </div>
      `;
      })
      .join("");
  }

  try {
    // Fetch cart items from the backend
    const response = await axios.get("/cartItems");
    cartItems = response.data.cartItems;

    // Check if cart items are available
    if (cartItems.length === 0) {
      cartContainer.innerHTML = `
        <p class="text-gray-600">Your cart is empty.</p>
        <button onclick="window.location.href='/dashboard/products'" class="btn btn-primary mt-4">Browse Products</button>
      `;
      return;
    }

    // Initially update the cart UI
    cartContainer.innerHTML = generateCartHTML(cartItems);
    calculateTotals();

    // Add event listeners for increasing and decreasing quantity
    document.querySelectorAll(".increase-quantity").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const productId = e.target.dataset.id;
        const quantityElement = e.target.previousElementSibling; // The quantity span
        const itemTotalElement = document.querySelector(`.item-total[data-id="${productId}"]`);

        let newQuantity = parseInt(quantityElement.textContent) + 1;

        try {
          // Find the item to calculate its total price
          const item = cartItems.find((i) => i.productId === productId);
          const totalPrice = item.price * newQuantity;

          // Send the updated quantity to the backend
          await axios.post("/updateCartItem", { productId, quantity: newQuantity });

          // Update the quantity in the UI
          quantityElement.textContent = newQuantity;

          // Update the total price for this item
          item.quantity = newQuantity;
          itemTotalElement.textContent = `₹${totalPrice.toFixed(2)}`;

          // Recalculate totals
          calculateTotals();
        } catch (error) {
          console.error("Error updating quantity:", error);
          alert("Failed to update the cart. Please try again.");
        }
      });
    });

    document.querySelectorAll(".decrease-quantity").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const productId = e.target.dataset.id;
        const quantityElement = e.target.nextElementSibling; // The quantity span
        const itemTotalElement = document.querySelector(`.item-total[data-id="${productId}"]`);

        let newQuantity = parseInt(quantityElement.textContent) - 1;
        if (newQuantity <= 0) return; // Prevent quantity from being negative

        try {
          // Find the item to calculate its total price
          const item = cartItems.find((i) => i.productId === productId);
          const totalPrice = item.price * newQuantity;

          // Send the updated quantity to the backend
          await axios.post("/updateCartItem", { productId, quantity: newQuantity });

          // Update the quantity in the UI
          quantityElement.textContent = newQuantity;

          // Update the total price for this item
          item.quantity = newQuantity;
          itemTotalElement.textContent = `₹${totalPrice.toFixed(2)}`;

          // Recalculate totals
          calculateTotals();
        } catch (error) {
          console.error("Error updating quantity:", error);
          alert("Failed to update the cart. Please try again.");
        }
      });
    });

    // Event listener for removing items from the cart
    document.addEventListener("click", async (e) => {
      if (e.target.classList.contains("remove-btn")) {
        const productId = e.target.dataset.id;

        try {
          // Send DELETE request to the backend to remove the item
          const response = await axios.delete("/removeCartItem", { data: { productId } });

          if (response.status === 200) {
            // Remove item locally from the cartItems array
            cartItems = cartItems.filter((item) => item.productId !== productId);

            // Re-render the cart UI with updated items
            cartContainer.innerHTML = generateCartHTML(cartItems);
            calculateTotals();

            // Reload page if the cart becomes empty
            if (cartItems.length === 0) {
              window.location.reload();
            }
          }
        } catch (error) {
          console.error("Failed to remove item:", error);
          alert("Failed to remove item. Please try again.");
        }
      }
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    cartContainer.innerHTML = `<p class="text-red-600">Failed to load cart items. Please try again later.</p>`;
  }



  
  // Initialize an empty array to hold addresses
  let addresses = [];

  // Select elements
  const addAddressButton = document.getElementById("add-address-btn");
  const addAddressForm = document.getElementById("add-address-form");
  const saveAddressButton = document.getElementById("save-address-btn");
  const existingAddressesContainer = document.getElementById("existing-addresses");

  // Function to render the existing addresses
  function renderAddresses() {
      existingAddressesContainer.innerHTML = ""; // Clear current addresses
      if (addresses.length === 0) {
          existingAddressesContainer.innerHTML = "<p class='text-gray-600'>No existing addresses found.</p>";
      } else {
          addresses.forEach((address, idx) => {
              const addressDiv = document.createElement("div");
              addressDiv.classList.add("p-4", "border", "border-gray-300", "rounded", "space-y-2");
              addressDiv.innerHTML = `
                  <h3 class="font-medium">Address ${idx + 1}</h3>
                  <p><strong>Name:</strong> ${address.firstName} ${address.lastName}</p>
                  <p><strong>Company:</strong> ${address.company || "Not provided"}</p>
                  <p><strong>Address:</strong> ${address.address}</p>
                  <p><strong>Postal Code:</strong> ${address.pinCode}</p>
                  <p><strong>City:</strong> ${address.city}</p>
              `;
              existingAddressesContainer.appendChild(addressDiv);
          });
      }
  }

  // Toggle visibility of the Add Address form
  addAddressButton.addEventListener("click", () => {
      addAddressForm.classList.toggle("hidden"); // Toggle visibility
  });

  // Handle address form submission
  saveAddressButton.addEventListener("click", () => {
      const label = document.getElementById("label").value;
      const city = document.getElementById("city").value;
      const address = document.getElementById("address").value;
      const pincode = document.getElementById("pincode").value;
      const phoneNumber = document.getElementById("phoneNumber").value;

      // Validate form fields (you can add more validation)
      if (!firstName || !lastName || !address || !pincode || !city) {
          alert("Please fill in all required fields!");
          return;
      }

      // Save the new address
      const newAddress = {
          label,
          phoneNumber,
          address,
          pincode,
          city,
      };

      addresses.push(newAddress); // Add the new address to the array

      // Clear the form inputs
      document.getElementById("label").value = "";
      document.getElementById("phoneNumber").value = "";
      document.getElementById("address").value = "";
      document.getElementById("pincode").value = "";
      document.getElementById("city").value = "";

      // Hide the Add Address form
      addAddressForm.classList.add("hidden");

      // Re-render the addresses
      renderAddresses();
  });

  // Initial render when the page loads
  renderAddresses();
    // ... (keep existing code for cart items, totals calculation, etc.)
  
    // Modify the getAddress function
    async function getAddress() {
      try {
        const response = await axios.get('/get-address');
        const addresses = response.data.addresses;
        const addressContainer = document.getElementById('existing-addresses');
  
        addressContainer.innerHTML = ''; // Clear existing addresses
  
        addresses.forEach((address, index) => {
          const addressCard = document.createElement('div');
          addressCard.className = 'border bg-white rounded-lg p-4 hover:border-black-500 transition-colors duration-200';
          addressCard.id = `addressCard-${address._id}`;
          
          if (index === 0) {
            addressCard.style.borderColor = 'red';
          }
  
          addressCard.innerHTML = `
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold">${address.label}</h3>
                <p class="text-gray-600">${address.address}</p>
                <p class="text-gray-600">${address.city}</p>
                <p class="text-gray-600">${address.pinCode}</p>
                <p class="text-gray-600">Phone: ${address.phoneNumber}</p>
              </div>
              <button class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 select-btn" data-id="${address._id}">
                Select
              </button>
            </div>
          `;
  
          addressContainer.appendChild(addressCard);
        });
  
        // Add event listeners to "Select" buttons
        const selectButtons = document.querySelectorAll('.select-btn');
        selectButtons.forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const addressId = e.target.dataset.id;
            document.querySelectorAll('#existing-addresses > div').forEach((card) => {
              card.style.borderColor = 'transparent';
            });
            const selectedCard = document.getElementById(`addressCard-${addressId}`);
            selectedCard.style.borderColor = 'red';
          });
        });
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    }
  
    // Call getAddress() when the page loads
    getAddress();
  
    // Modify the payNowButton event listener
    document.getElementById('payNowButton').addEventListener('click', async () => {
      try {
        const selectedAddressCard = document.querySelector('#existing-addresses > div[style*="border-color: red"]');
        if (!selectedAddressCard) {
          alert('Please select an address.');
          return;
        }
  
        const addressDetails = {
          label: selectedAddressCard.querySelector('h3').textContent.trim(),
          address: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(1)').textContent.trim(),
          city: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(2)').textContent.trim(),
          pinCode: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(3)').textContent.trim(),
          phoneNumber: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(4)').textContent.replace('Phone: ', '').trim(),
        };
  
        const selectedShippingOption = document.querySelector('input[name="shipping"]:checked');
        const selectedPaymentMethod = document.querySelector('input[name="payment"]:checked');
        const totalPriceElement = document.querySelector('.order-total');
        if (!totalPriceElement) {
          console.error('Total price element not found!');
          return;
        }
        
        const totalPriceText = parseFloat(totalPriceElement.textContent.replace('₹', ''));
        console.log('Total Price Text:', totalPriceText);
        
        const totalPrice = parseFloat(totalPriceText);
        if (isNaN(totalPrice)) {
          console.error('Total price is not a valid number:', totalPriceText);
          return;
        }

        
        const firstCartItem = cartItems[0];
        console.log(firstCartItem);
        const categoryId = firstCartItem.categoryId;
        const productId = firstCartItem.productId;


        const orderData = {
          categoryId,
          productId,
          shippingMethod: selectedShippingOption.nextElementSibling.textContent.trim(),
          quantity: 1, // You may need to update this based on your cart logic
          totalPrice: parseFloat(totalPriceElement.textContent.replace('₹', '')),
          address: addressDetails,
          paymentMethod: selectedPaymentMethod.value,
        };
  
        console.log('Order data:', orderData);
  
        const payNowButton = document.getElementById('payNowButton');
        payNowButton.disabled = true;
        payNowButton.textContent = 'Processing...';

        console.log(orderData);
        
        const response = await axios.post('/process-payment', orderData);
        console.log(response.data);
  
        if (response.status === 200) {
          alert('Payment successful!');
          window.location.href = '/orderSuccess';
        } else {
          throw new Error('Payment failed');
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        alert('An error occurred while processing payment. Please try again later.');
      } finally {
        const payNowButton = document.getElementById('payNowButton');
        payNowButton.disabled = false;
        payNowButton.textContent = 'Confirm Order';
      }
    });
  });
