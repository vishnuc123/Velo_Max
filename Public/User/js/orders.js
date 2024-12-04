async function getOrders() {
    try {
        const response = await axios.get('http://localhost:4000/getOrders');
        const orders = response.data.orders;
        console.log(orders);

        const ordersContainer = document.getElementById('orders-container');
        ordersContainer.innerHTML = ''; // Clear existing orders

        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="text-center py-8">
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

        orders.forEach(order => {
            const orderHtml = `
                <div class="border-b border-gray-200 pb-4">
                    <h3 class="text-lg font-semibold">Order ID: #${order._id}</h3>
                    <p class="text-gray-600">Quantity: ${order.categoryId}</p>
                    <p class="text-gray-600">Quantity: ${order.quantity}</p>
                    <p class="text-gray-600">Total Price: $${order.totalPrice}</p>
                    <p class="text-gray-600">Status: ${order.orderStatus}</p>
                    <p class="text-gray-500 text-sm">Ordered on: ${new Date(order.orderDate).toLocaleDateString()}</p>
                    
                    <div class="mt-4 space-x-4">
                        <button class="border border-black text-black px-4 py-2 rounded hover:bg-black hover:text-white transition" onclick="viewProductDetails('${order.productId}')">
                            View Product Details
                        </button>
                        <button class="border border-black text-black px-4 py-2 rounded hover:bg-black hover:text-white transition" onclick="trackOrder('${order._id}')">
                            Track Order
                        </button>
                    </div>
                </div>
            `;
            ordersContainer.innerHTML += orderHtml;
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        const ordersContainer = document.getElementById('orders-container');
        ordersContainer.innerHTML = `<p class="text-red-600">Failed to load orders. Please try again later.</p>`;
    }
}

getOrders();

// Functions to handle button clicks
async function viewProductDetails(productId,categoryId) {
    try {
        const response = await axios.get(`http://localhost:4000/orderProductDetails/${productId}/${categoryId}`);
        const product = response.data;
        alert(`Product Details:\nName: ${product.name}\nPrice: $${product.price}\nDescription: ${product.description}`);
    } catch (error) {
        console.error("Error fetching product details:", error);
        alert("Failed to fetch product details. Please try again later.");
    }
}

async function trackOrder(orderId) {
    try {
        const response = await axios.get(`http://localhost:4000/orders/${orderId}/track`);
        const trackingInfo = response.data;
        alert(`Order Tracking:\nCurrent Status: ${trackingInfo.status}\nEstimated Delivery: ${trackingInfo.estimatedDeliveryDate}`);
    } catch (error) {
        console.error("Error fetching order tracking details:", error);
        alert("Failed to fetch tracking details. Please try again later.");
    }
}


// Add hover effects to buttons and cards
document.querySelectorAll('button, .hover\\:border-purple-500').forEach(element => {
    element.addEventListener('mouseover', () => {
        element.style.transform = 'translateY(-2px)';
        element.style.transition = 'transform 0.2s ease-out';
    });
    element.addEventListener('mouseout', () => {
        element.style.transform = 'translateY(0)';
    });
});

