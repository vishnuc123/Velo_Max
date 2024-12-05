async function getOrders() {
    try {
        const response = await axios.get('http://localhost:4000/getOrderProductDetail');
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
            const orderHtml = `
                <div class="bg-white rounded-2xl p-6 shadow-sm order-card animate-fade-up" style="animation-delay: ${index * 0.1}s;">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <div class="text-sm text-gray-500">Order ID</div>
                            <div class="font-medium">#${order._id}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-500">Estimated arrival: ${new Date(order.orderDate).toLocaleDateString()}</div>
                            <div class="text-green-500 font-medium">${order.orderStatus}</div>
                        </div>
                    </div>

                    <div class="flex items-center mb-6">
                        <div class="flex items-center text-sm text-gray-600">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            Origin
                        </div>
                        <div class="mx-4 border-t-2 border-dashed flex-1 border-gray-200"></div>
                        <div class="flex items-center text-sm text-gray-600">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                            Destination
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-6">
                        <div class="flex space-x-4">
                            <img src="${order.productData.coverImage}" alt="${order.productData.productName}" class="w-20 h-20 object-cover rounded-lg"/>
                            <div>
                                <h3 class="font-medium">${order.productData.productName}</h3>
                                <p class="text-gray-600">Rp${order.totalPrice.toLocaleString()}</p>
                                <p class="text-sm text-gray-500">Category: ${order.categoryId}</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-between items-center">
                        <div>
                            <span class="text-sm text-gray-500">${order.quantity} items</span>
                            <p class="font-medium">Rp${order.totalPrice.toLocaleString()}</p>
                        </div>
                        <div class="space-x-4">
                            <button class="px-4 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition-colors" onclick="viewProductDetails('${order.productId}', '${order.categoryId}')">
                                View Product Details
                            </button>
                            <button class="px-4 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition-colors" onclick="trackOrder('${order._id}')">
                                Track Order
                            </button>
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

// Call getOrders when the page loads
document.addEventListener('DOMContentLoaded', getOrders);
