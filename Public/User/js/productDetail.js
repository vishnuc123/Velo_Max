const eventOrigin = new EventSource('/events');

// Handle the event when received
eventOrigin.onmessage = async function (e1) {
  try {
    // Check if the event is an 'updatedProduct' event
    if (e1.data === 'updatedProduct') {
      console.log('Product has been updated. Reloading...');

      // Get the product ID from the query parameter
      const productId = await getProductIdFromQueryParam();
      
      if (productId) {
        // Fetch and update product data with the new product ID
        const data = await productData(productId);
        console.log('Product data updated:', data);
      } else {
        console.error('Product ID not found.');
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
};



// Function to get the product ID from the query parameters
function getProductIdFromQueryParam() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id"); // Assumes the query parameter is named 'id', e.g., ?id=bike1
}
function setActiveImage(button) {
  // Remove active class from all thumbnails
  const thumbnails = document.querySelectorAll(".space-y-2.w-20 button");
  thumbnails.forEach((thumbnail) =>
    thumbnail.classList.remove("thumbnail-active")
  );

  // Add active class to the clicked thumbnail
  button.classList.add("thumbnail-active");

  // Update the main image based on the selected thumbnail
  const mainImage = document.getElementById("mainImage");
  mainImage.src = button.querySelector("img").src;

  applyImageMagnifier(mainImage);
}

// Function to apply the magnifier effect on mouse enter
function applyImageMagnifier(imageElement) {
  // Function to create the magnifier only on mouse enter
  function createMagnifier() {
    // Clear any existing magnifier container if it exists
    const existingMagnifier = imageElement.parentNode.querySelector(
      ".magnifier-container"
    );
    if (existingMagnifier) {
      existingMagnifier.remove();
    }

    // Create a new magnifier container
    const magnifierContainer = document.createElement("div");
    magnifierContainer.className = "magnifier-container";
    magnifierContainer.style.position = "absolute";
    magnifierContainer.style.top = "0";
    magnifierContainer.style.left = "0";
    magnifierContainer.style.width = "100%";
    magnifierContainer.style.height = "100%";
    magnifierContainer.style.overflow = "hidden";
    magnifierContainer.style.cursor = "zoom-in";
    magnifierContainer.style.backgroundImage = `url(${imageElement.src})`;
    magnifierContainer.style.backgroundSize = "200%"; // Adjust for magnification level
    magnifierContainer.style.backgroundPosition = "center";

    // Add event listeners for mouse movement
    magnifierContainer.addEventListener("mousemove", (e) => {
      const rect = imageElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      magnifierContainer.style.backgroundPosition = `${x}% ${y}%`;
    });

    // Remove the magnifier when the user leaves the image
    magnifierContainer.addEventListener("mouseleave", () => {
      magnifierContainer.remove();
    });

    // Append the magnifier container to the image's parent
    imageElement.parentNode.appendChild(magnifierContainer);
  }

  // Attach the createMagnifier function only on mouse enter
  imageElement.addEventListener("mouseenter", createMagnifier);
}

// Function to auto-change images every 5 seconds
function startImageAutoChange() {
  const thumbnails = document.querySelectorAll(".space-y-2.w-20 button");
  let currentIndex = 0;

  setInterval(() => {
    // Update main image based on current index
    setActiveImage(thumbnails[currentIndex]);

    // Move to the next thumbnail, looping back to the first if at the end
    currentIndex = (currentIndex + 1) % thumbnails.length;
  }, 5000); // 5000 milliseconds = 5 seconds
}

// Async function to fetch and display product data
async function productData(productId) {
  try {
    const response = await axios.get("/getProducts");
    const data = response.data;
    console.log(data);

    const cycleLoading = document.getElementById("cycleLoading");

    if (data.allDocuments && typeof data.allDocuments === "object") {
      let productFound = false;

      for (const category in data.allDocuments) {
        const products = data.allDocuments[category];

        if (Array.isArray(products)) {
          const product = products.find((item) => item._id === productId);

          if (product) {
            productFound = true;

            document.querySelector("h1").innerText =
              product.productName || "No name available";
            document.querySelector(".text-3xl").innerText =
              `₹${product.ListingPrice || "N/A"}`;
            document.querySelector(".line-through").innerText =
              `₹${product.RegularPrice || "N/A"}`;
            document.querySelector(".text-green-600").innerText =
              `${product.discount || 0}% off`;
            document.querySelector(".stock").innerText =
              product.Stock === 1
                ? `Hurry! Only 1 item left in stock!`
                : product.Stock === 0
                  ? `Out of stock!`
                  : `Only ${product.Stock} items left in stock!`;

                  

            // Update thumbnail images
            const thumbnailContainer =
              document.querySelector(".space-y-2.w-20");
            thumbnailContainer.innerHTML = "";
            (product.additionalImage || []).forEach((image, index) => {
              const button = document.createElement("button");
              button.onclick = () => setActiveImage(button);
              button.className = `w-20 h-20 border-2 rounded-lg overflow-hidden ${index === 0 ? "thumbnail-active" : ""}`;
              button.innerHTML = `<img src="${image}" alt="${product.productName}" class="w-full h-full object-cover transform hover:scale-125 transition duration-200 ease-in-out">`;
              thumbnailContainer.appendChild(button);
            });

            document.getElementById("productDescription").innerText =
              product.productDescription || "No description available";
            document.getElementById("mainImage").classList.remove("hidden");
            document.getElementById("mainImage").src = product.coverImage || "";

            const decriptionButton =
              document.getElementById("descriptionButton");
            const descriptionShow =
              document.getElementById("productDescription");
            decriptionButton.addEventListener("click", () => {
              descriptionShow.innerText =
                product.productDescription || "No description available";
            });

            const relatedProducts = products.filter(
              (item) => item._id !== productId
            );

            // whislist button animartion  // 
            const wishlistButton = document.createElement("button");
                  wishlistButton.id = "wishlistBtn";
                  wishlistButton.className = "relative group overflow-hidden bg-white hover:bg-gray-50 rounded-full p-4 shadow-lg transition-shadow hover:shadow-xl";
                  wishlistButton.setAttribute("data-productId", productId); // Set product ID on the button
                  wishlistButton.setAttribute("data-categoryId", category); // Set category ID on the button
                  
                  wishlistButton.innerHTML = `
                    <div class="button-content relative z-10 flex items-center gap-2">
                      <svg class="heart-icon w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path class="heart-path" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      <span class="text-sm font-medium">Add to Wishlist</span>
                    </div>
                  `;
                  
                  // Insert wishlist button after the stock information
                  const stockElement = document.querySelector(".stock");
                  stockElement.parentNode.insertBefore(wishlistButton, stockElement.nextSibling);
                  
                  // Add to wishlist event listener
                  wishlistButton.addEventListener("click", () => {
                    const productId = wishlistButton.getAttribute("data-productId");
                    const categoryId = wishlistButton.getAttribute("data-categoryId");
                  
                    // Data to send to the backend
                    const data = {
                      productId: productId,
                      categoryId: categoryId,
                    };
                  
                    // Send the data using Axios
                    axios
                      .post("/addToWishlist", data)
                      .then((response) => {
                        // Handle success response
                        console.log("Added to wishlist:", response.data);
                        alert("Product added to wishlist!");
                      })
                      .catch((error) => {
                        // Handle error response
                        console.error("Error adding to wishlist:", error);
                        alert("Failed to add product to wishlist.");
                      });
                  });
                  

            // Function to display random related products
            function displayRandomRelatedProducts() {
              const relatedProductsContainer =
                document.getElementById("relative-product");

              // Smoothly fade out the current products
              relatedProductsContainer.classList.add("opacity-0");

              setTimeout(() => {
                relatedProductsContainer.innerHTML = ""; // Clear the container before adding new items

                // Shuffle the related products to display them randomly
                const shuffledProducts = relatedProducts.sort(
                  () => Math.random() - 0.5
                );

                // Select the first 4 shuffled products
                const selectedProducts = shuffledProducts.slice(0, 4);

                selectedProducts.forEach((relatedProduct) => {
                  const productCard = document.createElement("div");
                  productCard.className = "relative-product-card";

                  // Combine coverImage and additionalImage array
                  const images = [
                    relatedProduct.coverImage,
                    ...(relatedProduct.additionalImage || []),
                  ];

                  let currentImageIndex = 0;
                  const productImageContainer = document.createElement("div");
                  productImageContainer.className = "relative-product-images";

                  // Create image element to display the first image in the array
                  const imageElement = document.createElement("img");
                  imageElement.src = images[currentImageIndex];
                  imageElement.className = "w-full h-48 object-cover";
                  productImageContainer.appendChild(imageElement);

                  // Function to handle image transitions for related products
                  function changeImage() {
                    currentImageIndex = (currentImageIndex + 1) % images.length;
                    imageElement.src = images[currentImageIndex];
                  }

                  // Start the auto-image transition (change image every 3 seconds)
                  setInterval(changeImage, 3000); // Adjust the interval time (in ms) as needed

                  productCard.appendChild(productImageContainer);

                  // Add product name, price, and discount information
                  productCard.innerHTML += `
                    <div class="product-info bg-white rounded shadow-md p-4">
                      <div class="flex items-center mb-2">
                        <svg class="h-6 w-6 text-red-500 animate-bounce" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 class="text-lg font-bold ml-2 cursor-pointer">${relatedProduct.productName}</h3>
                      </div>
                      <p class="text-gray-600 text-sm mb-1">₹${relatedProduct.ListingPrice || "N/A"}</p>
                      <p class="text-green-500 text-sm">${relatedProduct.discount || 0}% off</p>
                    </div>
                  `;

                  // Add event listener to navigate to the product detail page when the product card is clicked
                  productCard.addEventListener("click", () => {
                    const categoryName = category; // Assuming 'category' is defined earlier in your code or passed to this function
                    const productId = relatedProduct._id;
                    window.location.href = `/product-detail?category=${categoryName}&id=${productId}`;
                  });

                  // Append the product card to the container
                  relatedProductsContainer.appendChild(productCard);
                });

                // After new products are added, fade them in
                relatedProductsContainer.classList.remove("opacity-0");
                relatedProductsContainer.classList.add(
                  "transition-opacity",
                  "opacity-100",
                  "duration-1000"
                );
              }, 500); // Set the timeout for a smooth fade-out transition
            }

            // Display random related products initially
            displayRandomRelatedProducts();

            // Set an interval to change the related products every 5 seconds
            setInterval(displayRandomRelatedProducts, 5000);

            // Start the auto image changer after thumbnails are set
            startImageAutoChange();
            return products;
          }
        }
      }

      if (!productFound) {
        console.log("Product not found");
        cycleLoading.style.display = "block";
      } else {
        cycleLoading.style.display = "none";
      }
    } else {
      console.log("No products found or data is not in the expected format");
    }
  } catch (error) {
    console.log("Error while getting data from the server", error);
  }
}

// Get the product ID from the query parameters and call productData
const productIdToSearch = getProductIdFromQueryParam();
if (productIdToSearch) {
  productData(productIdToSearch).then((products) => {
    if (products) {
      specificationListing(products); // Pass products to specificationListing
    }
  });
} else {
  console.log("No product ID found in the query parameters");
}

async function specificationListing(products) {
  const specificationButton = document.getElementById("specification");

  // Array of fields to exclude
  const standardFields = [
    "_id",
    "productName",
    "ListingPrice",
    "RegularPrice",
    "discount",
    "Stock",
    "coverImage",
    "additionalImage",
    "additionalImages",
    "productDescription",
    "__v",
    "isblocked",
  ];

  // Extract the product ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id'); // Assuming the URL has a query like ?productId=12345
  
  // Find the selected product from the products array
  const selectedProduct = products.find(product => product._id === productId);
  if (!selectedProduct) {
    alert("Product not found!");
    return;
  }

  // Attach the event listener only once
  specificationButton.addEventListener("click", () => {
    // Toggle the flag to manage multiple clicks
    const productDescriptionContainer = document.getElementById("productDescription");

    // Check if specifications are already displayed
    const existingContainer = productDescriptionContainer.querySelector(".specification-container");
    if (existingContainer) {
      // Remove existing specifications container
      existingContainer.remove();
      return;
    }

    // Clear previous content
    productDescriptionContainer.innerHTML = "";

    // Create the container div for specifications
    const container = document.createElement("div");
    container.className = "w-full max-w-4xl mx-auto specification-container";

    // Create the header section
    const header = document.createElement("div");
    header.className = "flex items-center justify-between p-4 border-b border-gray-200";

    const title = document.createElement("h2");
    title.className = "text-xl font-semibold text-gray-900";
    title.innerText = "Specification";

    const downloadButton = document.createElement("button");
    downloadButton.className =
      "inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
    downloadButton.innerHTML = `
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        Download Full Specifications
    `;

    header.appendChild(title);
    header.appendChild(downloadButton);
    container.appendChild(header);

    // Create the table div for specifications
    const table = document.createElement("div");
    table.className = "divide-y divide-gray-200";

    // Display specifications only once for each unique field
    const uniqueFields = new Set();
    Object.keys(selectedProduct).forEach((field, index) => {
      // Exclude standard fields and already displayed fields
      if (!standardFields.includes(field) && !uniqueFields.has(field)) {
        uniqueFields.add(field); // Track displayed fields

        const row = document.createElement("div");
        row.className = `flex ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`;

        const fieldCell = document.createElement("div");
        fieldCell.className =
          "w-1/3 px-4 py-3 text-sm font-medium text-gray-900";
        fieldCell.innerText = field;

        const valueCell = document.createElement("div");
        valueCell.className = "w-2/3 px-4 py-3 text-sm text-gray-500";

        // Check if the value is boolean, and display "Yes" or "No"
        if (typeof selectedProduct[field] === "boolean") {
          valueCell.innerText = selectedProduct[field] ? "Yes" : "No";
        } else {
          valueCell.innerText = selectedProduct[field] || "N/A"; // Display the value or "N/A"
        }

        row.appendChild(fieldCell);
        row.appendChild(valueCell);
        table.appendChild(row);
      }
    });

    container.appendChild(table);
    productDescriptionContainer.appendChild(container);

    // Download the PDF with specifications
    downloadButton.addEventListener("click", () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(16);

      if (selectedProduct) {
        doc.text("Product Specifications", 14, 20);

        // Add Product Name and Description
        doc.setFontSize(12);
        doc.text(
          `Product Name: ${selectedProduct.productName || "N/A"}`,
          14,
          30
        );
        doc.text(
          `Product Description: ${selectedProduct.productDescription || "N/A"}`,
          14,
          40
        );

        // Add specifications to the PDF
        let yPosition = 50;
        uniqueFields.forEach((field) => {
          doc.text(
            `${field}: ${selectedProduct[field] || "N/A"}`,
            14,
            yPosition
          );
          yPosition += 10;
        });

        // Adding website link and description
        doc.setFontSize(14);
        doc.text(
          "Visit the VeloMax Website for more information:",
          14,
          yPosition
        );
        yPosition += 10;

        doc.setFontSize(12);
        const websiteLink = "http://localhost:4000/";
        doc.text(`Website: ${websiteLink}`, 14, yPosition);

        yPosition += 10;
        doc.text(
          "VeloMax is the ultimate platform for cyclists to track their rides, connect with other riders, and improve their performance.",
          14,
          yPosition
        );
        yPosition += 10;

        doc.text(
          "With the VeloMax app, you can access custom cycling routes, real-time weather updates, and advanced analytics to take your cycling to the next level.",
          14,
          yPosition
        );
        yPosition += 10;

        // Optional: You can add the link as a clickable URL
        doc.setTextColor(0, 0, 255); // Set color to blue for the link
        doc.textWithLink(websiteLink, 14, yPosition, { url: websiteLink });

        // Generate and download PDF with a unique name
        const productName = selectedProduct.productName || "Product"; // Fallback to "Product" if no name
        const productFileName = `${productName.replace(/\s+/g, "-")}-specifications.pdf`; // Replace spaces with hyphens in the file name
        doc.save(productFileName); // Use dynamic file name
      } else {
        alert("Product not found!");
      }
    });
  });
}
