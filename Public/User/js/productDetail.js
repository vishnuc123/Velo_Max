async function productData(productId) {
    try {
        const response = await axios.get('http://localhost:4000/product/listProduct');
        const data = response.data; 
        console.log(data);
        // Assuming this is the object containing allDocuments

        if (data.allDocuments && typeof data.allDocuments === 'object') {
            let productFound = false;

            // Iterate over the categories in allDocuments
            for (const category in data.allDocuments) {
                const products = data.allDocuments[category];

                // Print the product IDs for debugging
                console.log(`Checking category: ${category}`);
                products.forEach(product => {
                    console.log(`Available product ID: ${product.id}`); // Log each product ID
                });

                if (Array.isArray(products)) {
                    const product = products.find(item => item.id === productId);

                    if (product) {
                        productFound = true;

                        // Update product details in the DOM
                        document.querySelector('h1').innerText = product.name;
                        document.querySelector('.text-3xl').innerText = `₹${product.price}`;
                        document.querySelector('.line-through').innerText = `₹${product.originalPrice}`;
                        document.querySelector('.text-green-600').innerText = `${product.discount}% off`;
                        document.querySelector('.text-sm').innerText = `Only ${product.stock} item(s) left in stock!`;

                        // Update thumbnail images
                        const thumbnailContainer = document.querySelector('.space-y-2.w-20');
                        thumbnailContainer.innerHTML = '';
                        product.images.forEach((image, index) => {
                            const button = document.createElement('button');
                            button.onclick = () => setActiveImage(button, index);
                            button.className = `w-20 h-20 border-2 rounded-lg overflow-hidden ${index === 0 ? 'thumbnail-active' : ''}`;
                            button.innerHTML = `<img src="${image}" alt="${product.name}" class="w-full h-full object-cover">`;
                            thumbnailContainer.appendChild(button);
                        });

                        // Set the main image
                        document.getElementById('mainImage').src = product.images[0];

                        break; // Break the loop once the product is found
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

// Call the function with a specific product ID
const productIdToSearch = 'bike1'; // Replace with the desired product ID
productData(productIdToSearch);
