






// Function to get the product ID from the query parameters
function getProductIdFromQueryParam() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id"); // Assumes the query parameter is named 'id', e.g., ?id=bike1
}
function setActiveImage(button) {
  // Remove active class from all thumbnails
  const thumbnails = document.querySelectorAll(".space-y-2.w-20 button");
  thumbnails.forEach((thumbnail) => thumbnail.classList.remove("thumbnail-active"));

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
    const existingMagnifier = imageElement.parentNode.querySelector(".magnifier-container");
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
    const response = await axios.get("http://localhost:4000/product/listProduct");
    const data = response.data;
    const cycleLoading = document.getElementById("cycleLoading");

    if (data.allDocuments && typeof data.allDocuments === "object") {
      let productFound = false;

      for (const category in data.allDocuments) {
        const products = data.allDocuments[category];
        
        if (Array.isArray(products)) {
          const product = products.find((item) => item._id === productId);

          if (product) {
            productFound = true;

            document.querySelector("h1").innerText = product.productName || "No name available";
            document.querySelector(".text-3xl").innerText = `₹${product.ListingPrice || "N/A"}`;
            document.querySelector(".line-through").innerText = `₹${product.RegularPrice || "N/A"}`;
            document.querySelector(".text-green-600").innerText = `${product.discount || 0}% off`;
            document.querySelector(".stock").innerText = 
            product.Stock === 1 
              ? `Hurry! Only 1 item left in stock!` 
              : product.Stock === 0 
              ? `Out of stock!` 
              : `Only ${product.Stock} items left in stock!`;
          

            // Update thumbnail images
            const thumbnailContainer = document.querySelector(".space-y-2.w-20");
            thumbnailContainer.innerHTML = "";
            (product.additionalImage || []).forEach((image, index) => {
              const button = document.createElement("button");
              button.onclick = () => setActiveImage(button);
              button.className = `w-20 h-20 border-2 rounded-lg overflow-hidden ${index === 0 ? "thumbnail-active" : ""}`;
              button.innerHTML = `<img src="${image}" alt="${product.productName}" class="w-full h-full object-cover transform hover:scale-125 transition duration-200 ease-in-out">`;
              thumbnailContainer.appendChild(button);
            });
            
            document.getElementById("productDescription").innerText = product.productDescription || "No description available";
            document.getElementById("mainImage").classList.remove('hidden');
            document.getElementById("mainImage").src = product.coverImage || "";


            
            const decriptionButton = document.getElementById('descriptionButton')
            const descriptionShow = document.getElementById('productDescription')
            decriptionButton.addEventListener('click',() => {
              descriptionShow.innerText = product.productDescription || "No description available";
            })
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
  productData(productIdToSearch).then(products => {
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
  const standardFields = ["_id", "productName", "ListingPrice", "RegularPrice", "discount", "Stock", "coverImage", "additionalImage","additionalImages", "productDescription", "__v", "isblocked"];

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
    downloadButton.className = "inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
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

    products.forEach((product) => {
      Object.keys(product).forEach((field, index) => {
        if (!standardFields.includes(field) && !uniqueFields.has(field)) {
          uniqueFields.add(field); // Track displayed fields

          const row = document.createElement("div");
          row.className = `flex ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`;

          const fieldCell = document.createElement("div");
          fieldCell.className = "w-1/3 px-4 py-3 text-sm font-medium text-gray-900";
          fieldCell.innerText = field;

          const valueCell = document.createElement("div");
          valueCell.className = "w-2/3 px-4 py-3 text-sm text-gray-500";
          valueCell.innerText = product[field] || "N/A";

          row.appendChild(fieldCell);
          row.appendChild(valueCell);
          table.appendChild(row);
        }
      });
    });

    container.appendChild(table);
    productDescriptionContainer.appendChild(container);
  });
}


