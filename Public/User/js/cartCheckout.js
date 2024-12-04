document.addEventListener("DOMContentLoaded", async () => {
  const cartContainer = document.querySelector(".cart-container"); // Target the container for cart items.
  const orderSubtotal = document.querySelector(".order-subtotal"); // Target for subtotal
  const orderTotal = document.querySelector(".order-total"); // Target for total
  const orderShipping = document.querySelector(".order-shipping"); // Target for shipping cost

  let cartItems = []; // Initialize an empty array to store cart items

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

    let subtotal = 0; // Track the subtotal

    // Function to generate the cart HTML
    function generateCartHTML(cartItems) {
      return cartItems
        .map((item) => {
          const totalPrice = item.product.ListingPrice * item.cartItem.quantity;
          subtotal += totalPrice; // Accumulate the total price for the subtotal

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
                            <p class="text-lg font-semibold">$${totalPrice.toFixed(2)}</p>
                            <button class="mt-4 text-red-500 hover:text-red-700 remove-btn" data-id="${item.cartItem.productId}">
                                Remove
                            </button>
                        </div>
                    </div>
                `;
        })
        .join("");
    }

    // Function to update the subtotal and total
    function updateSubtotalAndTotal(cartItems) {
      let subtotal = 0;
      cartItems.forEach((item) => {
        const quantity = parseInt(item.cartItem.quantity);
        const totalPrice = item.product.ListingPrice * quantity;
        subtotal += totalPrice;
      });

      orderSubtotal.textContent = `$${subtotal.toFixed(2)}`;
      orderTotal.textContent = `$${(subtotal + 29).toFixed(2)}`; // Total = Subtotal + Shipping cost
    }

    // Initially update the cart UI
    cartContainer.innerHTML = generateCartHTML(cartItems);
    updateSubtotalAndTotal(cartItems);

    // Add event listeners for increasing and decreasing quantity
    document.querySelectorAll(".increase-quantity").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const productId = e.target.dataset.id;
        const quantityElement = e.target.previousElementSibling; // The quantity span

        let newQuantity = parseInt(quantityElement.textContent) + 1;
        if (newQuantity <= 0) return; // Prevent quantity from being negative

        // Send the updated quantity to the backend
        try {
          await axios.post("/updateCartItem", {
            productId,
            quantity: newQuantity,
          });

          // Update the quantity in the UI
          quantityElement.textContent = newQuantity;

          // Recalculate the subtotal and total
          updateSubtotalAndTotal(cartItems);
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

        let newQuantity = parseInt(quantityElement.textContent) - 1;
        if (newQuantity <= 0) return; // Prevent quantity from being negative

        // Send the updated quantity to the backend
        try {
          await axios.post("/updateCartItem", {
            productId,
            quantity: newQuantity,
          });

          // Update the quantity in the UI
          quantityElement.textContent = newQuantity;

          // Recalculate the subtotal and total
          updateSubtotalAndTotal(cartItems);
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
            updateSubtotalAndTotal(cartItems);
            window.location.reload();
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
});
