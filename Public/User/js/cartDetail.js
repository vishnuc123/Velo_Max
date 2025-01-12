// Fetch and render cart items
async function getCartItems() {
    try {
        const response = await axios.get('/cartItems');
        const cartDetails = response.data;
        const cartItems = cartDetails.cartItems; // Array of cart items
        const cartList = document.getElementById('productList');
        cartList.innerHTML = ''; 
        let totalPrice = 0;

        // Render each cart item
        cartItems.forEach((item, index) => {
            const itemPrice = item.price * item.quantity;
            totalPrice += itemPrice; // Sum the total price for the cart

            const itemElement = document.createElement('div');
            itemElement.className = "flex items-center space-x-4 border-b pb-4";
            itemElement.innerHTML = `
                <div class="flex gap-6 pb-6 border-b" data-product-id="${item.productId}" data-category-id="${item.categoryId}">
                    <div class="w-32 h-32 bg-gray-50 rounded-lg overflow-hidden">
                        <img src="${item.product.coverImage || '/placeholder.svg'}" 
                             alt="Product" 
                             class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-medium">${item.product.productName}</h3>
                        <div class="flex items-center justify-between mt-4">
                            <div class="flex items-center border rounded">
                                <button class="px-3 py-1 hover:bg-gray-100 decreaseBtn" data-index="${index}">-</button>
                                <span class="px-3 py-1 border-x quantityInput" data-index="${index}">${item.quantity}</span>
                                <button class="px-3 py-1 hover:bg-gray-100 increaseBtn" data-index="${index}">+</button>
                            </div>
                            <p class="text-lg font-medium itemTotalPrice" data-index="${index}">₹${itemPrice.toFixed(2)}</p>
                        </div>
                        <button class="mt-4 text-gray-500 hover:text-gray-700" onclick="removeCartItem('${item.productId}')">
                            Remove
                        </button>
                    </div>
                </div>
            `;
            cartList.appendChild(itemElement);
        });

        // After rendering the cart, update the total price in the DOM
        updateTotalPrice(totalPrice);

        // Attach event listeners
        attachCartEventListeners(cartItems);
    } catch (error) {
        console.error("Failed to fetch cart items:", error);
    }
}

// Attach event listeners for increase and decrease buttons
function attachCartEventListeners(cartItems) {
    document.querySelectorAll('.increaseBtn').forEach(button => {
        button.addEventListener('click', async () => {
            const index = button.getAttribute('data-index');
            const item = cartItems[index];

            if (item.quantity < 5) {
                item.quantity += 1;
                await updateCartDisplay(item, index, cartItems);
            }
        });
    });

    document.querySelectorAll('.decreaseBtn').forEach(button => {
        button.addEventListener('click', async () => {
            const index = button.getAttribute('data-index');
            const item = cartItems[index];

            if (item.quantity > 1) {
                item.quantity -= 1;
                await updateCartDisplay(item, index, cartItems);
            }
        });
    });
}

// Update cart display and sync with server
async function updateCartDisplay(item, index, cartItems) {
    try {
        const quantityElement = document.querySelector(`.quantityInput[data-index="${index}"]`);
        const itemPriceElement = document.querySelector(`.itemTotalPrice[data-index="${index}"]`);
        const itemPrice = item.price * item.quantity;

        // Update the quantity and item price in the DOM
        if (quantityElement && itemPriceElement) {
            quantityElement.textContent = item.quantity;
            itemPriceElement.textContent = `₹${itemPrice.toFixed(2)}`;
        }

        // Recalculate total price after the update
        let totalPrice = 0;
        cartItems.forEach((cartItem) => {
            totalPrice += cartItem.price * cartItem.quantity;
        });

        // Update total price in the DOM
        const cartTotalElement = document.getElementById('mainCartTotalPrice');
        if (cartTotalElement) {
            cartTotalElement.textContent = `₹${totalPrice.toFixed(2)}`;
        }

        // Sync updated quantity with the server
        await axios.post('/updateCartItem', {
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        });
    } catch (error) {
        console.error('Error updating cart item:', error);
    }
}

// Update total price in the DOM
function updateTotalPrice(totalPrice) {
    const cartTotalElement = document.getElementById('mainCartTotalPrice');
    if (cartTotalElement) {
        cartTotalElement.textContent = `₹${totalPrice.toFixed(2)}`;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    getCartItems();
});
