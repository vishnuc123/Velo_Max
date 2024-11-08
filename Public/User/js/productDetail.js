// Function to get the product ID from the query parameters
function getProductIdFromQueryParam() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id'); // Assumes the query parameter is named 'id', e.g., ?id=bike1
}

// Async function to fetch and display product data
async function productData(productId) {
    try {
        const response = await axios.get('http://localhost:4000/product/listProduct');
        const data = response.data; 
        console.log(data);

        if (data.allDocuments && typeof data.allDocuments === 'object') {
            let productFound = false;

            // Iterate over categories in allDocuments
            for (const category in data.allDocuments) {
                const products = data.allDocuments[category];
                
                console.log(`Checking category: ${category}`);
                products.forEach(product => {
                    console.log(`Available product ID: ${product._id}`);
                });

                if (Array.isArray(products)) {
                    const product = products.find(item => item._id === productId);

                    if (product) {
                        productFound = true;

                        // Update product details in the DOM
                        document.querySelector('h1').innerText = product.productName || 'No name available';
                        document.querySelector('.text-3xl').innerText = `₹${product.ListingPrice || 'N/A'}`;
                        document.querySelector('.line-through').innerText = `₹${product.RegularPrice || 'N/A'}`;
                        document.querySelector('.text-green-600').innerText = `${product.discount || 0}% off`;
                        document.querySelector('.stock').innerText = `Only ${product.Stock || 0} items left in stock!`;

                        // Update thumbnail images
                        const thumbnailContainer = document.querySelector('.space-y-2.w-20');
                        thumbnailContainer.innerHTML = '';
                        (product.additionalImage || []).forEach((image, index) => {
                            const button = document.createElement('button');
                            button.onclick = () => setActiveImage(button, index);
                            button.className = `w-20 h-20 border-2 rounded-lg overflow-hidden ${index === 0 ? 'thumbnail-active' : ''}`;
                            button.innerHTML = `<img src="${image}" alt="${product.productName}" class="w-full h-full object-cover">`;
                            thumbnailContainer.appendChild(button);
                        });
                        document.getElementById('productDescription').innerText = product.productDescription || 'No description available';

                        // Set the main image
                        document.getElementById('mainImage').src = product.coverImage || '';
                        break;
                    }
                }
            }

            if (!productFound) {
                console.log('Product not found');
            }
        } else {
            console.log('No products found or data is not in the expected format');
        }

    } catch (error) {
        console.log('Error while getting data from the server', error);
    }
}

// Get the product ID from the query parameters and call productData
const productIdToSearch = getProductIdFromQueryParam();
if (productIdToSearch) {
    productData(productIdToSearch);
} else {
    console.log('No product ID found in the query parameters');
}
