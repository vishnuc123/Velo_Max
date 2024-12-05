document.addEventListener("DOMContentLoaded", async () => {
  const cartContainer = document.querySelector(".cart-container"); // Target the container for cart items.
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
      const quantity = parseInt(item.cartItem.quantity);
      const totalPrice = item.product.ListingPrice * quantity;
      subtotal += totalPrice;
    });

    // Update UI
    orderSubtotal.textContent = `$${subtotal.toFixed(2)}`;
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
        const totalPrice = item.product.ListingPrice * item.cartItem.quantity;

        return `
          <div class="flex items-center space-x-4 border-b pb-4" data-id="${item.cartItem.productId}">
              <img src="${item.product.coverImage}" alt="${item.product.productName}" class="w-20 h-20 object-cover rounded-md">
              <div class="flex-grow">
                  <h3 class="font-medium">${item.product.productName}</h3>
                  <div class="flex items-center mt-2">
                      <button class="text-gray-500 hover:text-gray-700 decrease-quantity" data-id="${item.cartItem.productId}">-</button>
                      <span class="mx-2 quantity">${item.cartItem.quantity}</span>
                      <button class="text-gray-500 hover:text-gray-700 increase-quantity" data-id="${item.cartItem.productId}">+</button>
                  </div>
              </div>
              <div class="text-right">
                  <p class="text-lg font-semibold item-total" data-id="${item.cartItem.productId}">$${totalPrice.toFixed(2)}</p>
                  <button class="mt-4 text-red-500 hover:text-red-700 remove-btn" data-id="${item.cartItem.productId}">Remove</button>
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
        const itemTotalElement = document.querySelector(
          `.item-total[data-id="${productId}"]`
        );
      
        let newQuantity = parseInt(quantityElement.textContent) + 1;
      
        try {
          // Find the item to calculate its total price
          const item = cartItems.find((i) => i.cartItem.productId === productId);
          const totalPrice = item.product.ListingPrice * newQuantity;
      
          // Send the updated quantity and price to the backend
          await axios.post("/updateCartItem", {
            productId,
            quantity: newQuantity,
            price: totalPrice, // Include the updated price
          });
      
          // Update the quantity in the UI
          quantityElement.textContent = newQuantity;
      
          // Update the total price for this item
          item.cartItem.quantity = newQuantity;
          itemTotalElement.textContent = `$${totalPrice.toFixed(2)}`;
      
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
        const itemTotalElement = document.querySelector(
          `.item-total[data-id="${productId}"]`
        );
      
        let newQuantity = parseInt(quantityElement.textContent) - 1;
        if (newQuantity <= 0) return; // Prevent quantity from being negative
      
        try {
          // Find the item to calculate its total price
          const item = cartItems.find((i) => i.cartItem.productId === productId);
          const totalPrice = item.product.ListingPrice * newQuantity;
      
          // Send the updated quantity and price to the backend
          await axios.post("/updateCartItem", {
            productId,
            quantity: newQuantity,
            price: totalPrice, // Include the updated price
          });
      
          // Update the quantity in the UI
          quantityElement.textContent = newQuantity;
      
          // Update the total price for this item
          item.cartItem.quantity = newQuantity;
          itemTotalElement.textContent = `$${totalPrice.toFixed(2)}`;
      
          // Recalculate totals
          calculateTotals();
        } catch (error) {
          console.error("Error updating quantity:", error);
          alert("Failed to update the cart. Please try again.");
        }
      });
      
    });

    // Event listener for removing items from cart
    document.addEventListener("click", async (e) => {
      if (e.target.classList.contains("remove-btn")) {
        const productId = e.target.dataset.id;

        try {
          // Send DELETE request to the backend to remove the item
          const response = await axios.delete("/removeCartItem", {
            data: { itemId: productId },
          });

          if (response.status === 200) {
            // Remove item locally from the cartItems array
            cartItems = cartItems.filter(
              (item) => item.cartItem.productId !== productId
            );

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
                  <p><strong>Postal Code:</strong> ${address.postalCode}</p>
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
      const firstName = document.getElementById("first-name").value;
      const lastName = document.getElementById("last-name").value;
      const company = document.getElementById("company").value;
      const address = document.getElementById("address").value;
      const postalCode = document.getElementById("postal-code").value;
      const city = document.getElementById("city").value;

      // Validate form fields (you can add more validation)
      if (!firstName || !lastName || !address || !postalCode || !city) {
          alert("Please fill in all required fields!");
          return;
      }

      // Save the new address
      const newAddress = {
          firstName,
          lastName,
          company,
          address,
          postalCode,
          city,
      };

      addresses.push(newAddress); // Add the new address to the array

      // Clear the form inputs
      document.getElementById("first-name").value = "";
      document.getElementById("last-name").value = "";
      document.getElementById("company").value = "";
      document.getElementById("address").value = "";
      document.getElementById("postal-code").value = "";
      document.getElementById("city").value = "";

      // Hide the Add Address form
      addAddressForm.classList.add("hidden");

      // Re-render the addresses
      renderAddresses();
  });

  // Initial render when the page loads
  renderAddresses();

  async function getAddress() {
    try {
        const response = await axios.get('/get-address'); // Fetch addresses from backend
        const addresses = response.data.addresses; // Extract addresses from the response
        const addressContainer = document.getElementById('existing-addresses'); // Get the container for addresses


        addresses.forEach((address, index) => {
            // Create a card for each address
            const addressCard = document.createElement('div');
            addressCard.className = 'border bg-white rounded-lg p-4 hover:border-black-500 transition-colors duration-200';
            addressCard.id = `addressCard-${address._id}`;
            
            // Set red border for the first address initially
            if (index === 0) {
                addressCard.style.borderColor = 'red';
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
        const selectButtons = document.querySelectorAll('.select-btn');
        selectButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const addressId = e.target.dataset.id; // Get the address ID

                // Reset all address borders
                document.querySelectorAll('#existing-addresses > div').forEach((card) => {
                    card.style.borderColor = 'transparent';
                });

                // Highlight the selected address
                const selectedCard = document.getElementById(`addressCard-${addressId}`);
                selectedCard.style.borderColor = 'red';

                console.log('Selected address ID:', addressId);
                // Perform further actions (e.g., save the selected address)
            });
        });
    } catch (error) {
        console.error('Error fetching addresses:', error);
    }
}

// Load existing addresses on page load
getAddress();
});
