async function getOrders() {
    try {
        const response = await axios.get('/getOrderProductDetail');
        const orders = response.data;

        const ordersContainer = document.querySelector('.space-y-6');
        ordersContainer.innerHTML = ''; // Clear existing orders

        if (orders.length === 0) {
            ordersContainer.innerHTML = ` 
                <div class="text-center py-8 animate-fade-up">
                    <h3 class="text-lg font-medium mb-2">No orders yet</h3>
                    <p class="text-gray-600 mb-6">Go to store to place an order.</p>
                    <a href="/store" class="inline-flex items-center text-red-600 hover:text-red-700 transition-colors duration-200">
                        <span>Browse products</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            `;
            return;
        }

        orders.forEach((order, index) => {
            const isCancelled = order.orderStatus.toLowerCase() === 'cancelled';
            const isDelivered = order.orderStatus.toLowerCase() === 'delivered';
            const isShipped = order.orderStatus.toLowerCase() === 'shipped';

            let itemsHtml = '';

            order.orderedItem.forEach(item => {
                const productData = item.productData || {};
                itemsHtml += `
                    <div class="flex space-x-4 mb-4">
                        <img src="${productData.coverImage || '/placeholder.png'}" alt="${productData.productName || 'Product'}" class="w-20 h-20 object-cover rounded-lg"/>
                        <div>
                            <h3 class="font-medium">${productData.productName || 'Unknown Product'}</h3>
                            <p class="text-gray-600">Rp${(productData.price || 0).toLocaleString()}</p>
                            <p class="text-sm text-gray-500">Category: ${item.categoryId || 'N/A'}</p>
                        </div>
                    </div>
                `;
            });

            const orderHtml = `
                <div class="bg-white rounded-2xl p-6 shadow-sm order-card animate-fade-up" style="animation-delay: ${index * 0.1}s;" data-order-id="${order._id}">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <div class="text-sm text-gray-500">Order ID</div>
                            <div class="font-medium">#${order._id}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-500">Order Date: ${new Date(order.orderDate).toLocaleDateString()}</div>
                            <div class="text-green-500 font-medium">${order.orderStatus}</div>
                        </div>
                    </div>

                    <div>${itemsHtml}</div>

                    <div class="mt-6 flex justify-between items-center">
                        <div>
                            <span class="text-sm text-gray-500">${order.orderedItem.length} items</span>
                            <p class="font-medium">Rp${order.finalAmount.toLocaleString()}</p>
                        </div>
                        <div class="space-x-4">
                            ${!isCancelled && !isDelivered && !isShipped ? `
                                <button class="px-4 py-2 bg-red-600 border border-black text-black rounded hover:bg-black hover:text-white transition-colors" onclick="cancelOrders('${order._id}', ${JSON.stringify(order.orderedItem.map(item => item._doc.productId))})">
                                    Cancel Order
                                </button>
                                <button class="px-4 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition-colors" onclick="trackOrder('${order._id}')">
                                    Track Order
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            ordersContainer.innerHTML += orderHtml;
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        const ordersContainer = document.querySelector('.space-y-6');
        ordersContainer.innerHTML = `<p class="text-red-600">Failed to load orders. Please try again later.</p>`;
    }
}

// Call getOrders when the page loads
document.addEventListener('DOMContentLoaded', getOrders);



// Keep the existing viewProductDetails and trackOrder functions

// Modify the hover effects
document.addEventListener('mouseover', function(event) {
    const orderCard = event.target.closest('.order-card');
    if (orderCard) {
        orderCard.style.transform = 'translateY(-2px)';
        orderCard.style.transition = 'transform 0.2s ease-out';
    }
}, true);

document.addEventListener('mouseout', function(event) {
    const orderCard = event.target.closest('.order-card');
    if (orderCard) {
        orderCard.style.transform = 'translateY(0)';
    }
}, true);

async function cancelOrders(productId, orderId) {
    try {
        console.log("click");

        // Send a POST request to cancel the order
        const response = await axios.post('/cancelOrder', {
            productId,
            orderId,
        });

        if (response.status === 200) {
            alert('Order canceled successfully!');
            window.location.reload(); // Reload the page to update the orders list

            // Find the specific order card
            const orderCard = document.querySelector(`.order-card[data-order-id="${orderId}"]`);
            if (orderCard) {
                // Remove the "Cancel Order" and "Track Order" buttons
                const actionsDiv = orderCard.querySelector('.space-x-4');
                if (actionsDiv) actionsDiv.remove(); // Remove the buttons

                // Update the order status to "Cancelled"
                const statusDiv = orderCard.querySelector('.text-green-500');
                if (statusDiv) {
                    statusDiv.textContent = 'Cancelled';
                    statusDiv.classList.remove('text-green-500');
                    statusDiv.classList.add('text-red-500'); // Change the status color to red
                }
            }
        } else {
            alert('Failed to cancel the order. Please try again.');
        }
    } catch (error) {
        console.error('Error canceling order:', error);
        alert('An error occurred while canceling the order. Please try again.');
    }
}


// Call getOrders when the page loads
// document.addEventListener('DOMContentLoaded', getOrders);
