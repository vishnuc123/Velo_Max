async function allProducts() {
  try {
    const container = document.getElementById("productsListing"); // Ensure this matches your actual container ID
    const response = await axios.get(
      "http://localhost:4000/product/listProduct"
    );
    const data = response.data;

    const categoryDetailsResponse = await axios.get("http://localhost:4000/category-details");
    const categoryDetails = categoryDetailsResponse.data;

    const allDocuments = data.allDocuments;
    createAllProductsButton(data);

    // Create category buttons for each category
    Object.keys(allDocuments).forEach((categoryName) => {
      createCategoryButton(categoryName, data, categoryDetails);
    });

    // Display all unblocked products by default on page load
    displayAllProducts(data);
  } catch (error) {
    console.log("Error while getting products from the server", error);
  }
}

// Run the function to fetch and display all products
allProducts();

let activeCategory = null; // Variable to keep track of the currently active category

function createAllProductsButton(data) {
  const container = document.getElementById("product-tag");
  const allProductsButton = document.createElement("button");
  allProductsButton.classList.add(
    "bg-gray-400",
    "text-white",
    "px-4",
    "py-2",
    "rounded-full",
    "mr-2"
  );
  allProductsButton.textContent = "All Products";

  allProductsButton.addEventListener("click", () => {
    if (activeCategory) {
      activeCategory.classList.remove("bg-black");
      activeCategory.classList.add("bg-gray-500");
    }

    // Set the All Products button as active
    allProductsButton.classList.remove("bg-gray-400");
    allProductsButton.classList.add("bg-red-800");
    activeCategory = null; // Clear active category reference

    // Display all unblocked products
    displayAllProducts(data);
  });

  container.appendChild(allProductsButton);
}

function createCategoryButton(categoryName, data, categoryDetails) {
  const container = document.getElementById("product-tag");

  const button = document.createElement("button");
  button.classList.add("bg-gray-400", "text-white", "px-4", "py-2", "rounded-full", "mr-2");
  button.textContent = categoryName;

  button.addEventListener("click", () => {
    if (activeCategory) {
      activeCategory.classList.remove("bg-black");
      activeCategory.classList.add("bg-gray-500");
    }

    // Set the clicked button as active
    activeCategory = button;
    button.classList.remove("bg-gray-500");
    button.classList.add("bg-black");

    // Display products of the selected category
    displayCategoryProducts(categoryName, data);
  });

  container.appendChild(button);
}

function displayAllProducts(data) {
  const container = document.getElementById("productsListing");
  container.innerHTML = ""; // Clear previous products

  Object.keys(data.allDocuments).forEach((categoryName) => {
    const products = data.allDocuments[categoryName];
    if (products) {
      products.filter((product) => !product.isblocked)
              .forEach((product) => createProductCard(product, categoryName)); // Pass categoryName
    }
  });
}


// Function to display products of a specific category
function displayCategoryProducts(categoryName, data) {
  const container = document.getElementById("productsListing");
  container.innerHTML = ""; // Clear previous products

  const products = data.allDocuments[categoryName];
  if (products) {
    products.filter((product) => !product.isblocked)
            .forEach((product) => createProductCard(product, categoryName)); // Pass categoryName
  }
}

function createProductCard(product,categoryName) {
  const container = document.getElementById("productsListing");

  const card = document.createElement("div");
  card.classList.add("bg-white", "p-4", "rounded-lg", "shadow-lg", "mb-4", "transition", "transform", "hover:scale-105", "hover:shadow-2xl");

  const img = document.createElement("img");
  img.src = product.coverImage;
  img.alt = product.productName;
  img.classList.add("w-full", "h-48", "object-cover", "mb-4", "rounded-lg", "transition", "transform", "hover:scale-110");
  card.appendChild(img);

  const title = document.createElement("h3");
  title.classList.add("font-bold", "text-xl", "text-gray-800", "mb-2", "text-center", "cursor-pointer");
  title.textContent = product.productName;

  title.addEventListener("click", () => {
    window.location.href = `/product-detail?category=${categoryName}&id=${product._id}`;
  });
  card.appendChild(title);

  const actionDiv = document.createElement("div");
  actionDiv.classList.add("flex", "justify-between", "items-center", "pt-4", "border-t", "border-gray-200");

  const price = document.createElement("span");
  price.classList.add("text-gray-800", "font-semibold", "text-lg");
  price.textContent = `₹${product.ListingPrice}`;
  actionDiv.appendChild(price);

  const button = document.createElement("button");
  button.classList.add("flex", "items-center", "bg-gradient-to-r", "from-blue-200", "to-red-600", "text-white", "px-4", "py-2", "rounded-full", "hover:from-blue-200", "hover:to-blue-700", "transition", "transform", "hover:scale-105");
  button.innerHTML = `<span class="mr-2">Add to Cart</span> &#128722;`;
  actionDiv.appendChild(button);

  const heart = document.createElement("span");
  heart.classList.add("text-red-500", "cursor-pointer", "hover:text-red-600", "transition");
  heart.innerHTML = "&#9829;";
  actionDiv.appendChild(heart);

  card.appendChild(actionDiv);
  container.appendChild(card);
}
