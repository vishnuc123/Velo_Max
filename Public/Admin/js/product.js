
async function products() {
  try {
    const response = await axios.get('http://localhost:4000/product/listProduct');
    const data = response.data;

    console.log(data);

    const container = document.getElementById('product-list');

    // Loop through each category in allDocuments
    for (const category in data.allDocuments) {
      // Create category heading
      const categoryTitle = document.createElement('h2');
      categoryTitle.className = 'text-2xl font-bold mb-6';
      categoryTitle.textContent = category.replace('_', ' ').toUpperCase();
      container.appendChild(categoryTitle);

      // Create a div for the product grid
      const productGrid = document.createElement('div');
      productGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12';

      // Loop through each product in the category
      data.allDocuments[category].forEach(product => {
        // Create card for the product
        const productCard = document.createElement('div');
        productCard.className = 'bg-white shadow-md rounded-lg overflow-hidden';

        // Create and append product image
        const productImage = document.createElement('img');
        productImage.src = product.coverImage;
        productImage.alt = product.productName;
        productImage.className = 'w-full h-48 object-cover';
        productCard.appendChild(productImage);

        // Create product details div
        const productDetails = document.createElement('div');
        productDetails.className = 'p-4';

        // Create and append product name
        const productName = document.createElement('h3');
        productName.className = 'text-xl font-semibold';
        productName.textContent = product.productName;
        productDetails.appendChild(productName);

        // Create and append product description
        const productDescription = document.createElement('p');
        productDescription.className = 'text-gray-600 mb-2';
        productDescription.textContent = product.productDescription;
        productDetails.appendChild(productDescription);

        // Create and append product price
        const productPrice = document.createElement('p');
        productPrice.className = 'text-green-600 font-bold';
        productPrice.textContent = `Price: $${product.ListingPrice}`;
        productDetails.appendChild(productPrice);

        // Create and append buy button
        const buyButton = document.createElement('button');
        buyButton.id = 'productEditButton'
        buyButton.className = 'mt-4 w-full bg-blue-500 text-white py-2 rounded-lg';
        buyButton.textContent = 'Edit';
        productDetails.appendChild(buyButton);

        // Append product details to card
        productCard.appendChild(productDetails);
        // Append product card to the grid
        productGrid.appendChild(productCard);
        buyButton.addEventListener("click", () => {
  openEditModal(product);
});
      });

      // Append product grid to the container
      container.appendChild(productGrid);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

// Call the products function to load data
products();


document.addEventListener("DOMContentLoaded", () => {
  const ProductListContainer = document.getElementById("product-list");
  let selectedCategory;

  document.getElementById("openModalBtn").addEventListener("click", async function () {
    try {
      if (document.getElementById("categoryModal")) return;

      const modal = document.createElement("div");
      modal.id = "categoryModal";
      modal.className = "absolute fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center";

      const modalContent = document.createElement("div");
      modalContent.className = "bg-white w-1/2 h-auto max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg";

      const modalTitle = document.createElement("h2");
      modalTitle.className = "text-2xl font-semibold mb-4 text-gray-800";
      modalTitle.textContent = "Select a Category";

      const categorySelect = document.createElement("select");
      categorySelect.className = "w-full p-3 border border-gray-300 rounded mb-4";

      const response = await axios.get("http://localhost:4000/category-details");
      const data = response.data.data;

      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.categoryTitle;
        option.textContent = item.categoryTitle;
        categorySelect.appendChild(option);
      });

      const submitButton = document.createElement("button");
      submitButton.className = "bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition duration-300";
      submitButton.textContent = "Submit";

      submitButton.addEventListener("click", async function () {
        selectedCategory = categorySelect.value;
        const response = await axios.get(`http://localhost:4000/products/${selectedCategory}`);
        const data = response.data.categoryAttributes;
        console.log(data);
        
        document.body.removeChild(modal);

        const form = document.createElement("form");
        form.id = "productForm";
        form.className = "grid grid-cols-1 gap-4";
        form.method = "POST";
        form.enctype = 'multipart/form-data';

        const formModal = document.createElement("div");
        formModal.id = "formModal";
        formModal.className = "absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center overflow-auto mt-5";

        const formModalContent = document.createElement("div");
        formModalContent.className = "bg-white w-1/2 h-auto max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg relative mt-10";
        formModalContent.style.top = '50%';

        const closeFormModalButton = document.createElement("span");
        closeFormModalButton.innerHTML = "&times;";
        closeFormModalButton.className = "absolute top-0 right-0 text-6xl cursor-pointer bg-red-500 w-10";
        closeFormModalButton.addEventListener("click", function () {
          document.body.removeChild(formModal);
        });

        formModalContent.appendChild(closeFormModalButton);

        const formTitle = document.createElement("h2");
        formTitle.className = "text-2xl font-semibold mb-4 text-gray-800 ";
        formTitle.textContent = "Add New Product";
        formModalContent.appendChild(formTitle);

        const formContainer = document.createElement("div");
        formContainer.id = "formContainer";
        formContainer.className = "grid grid-cols-1 gap-4";
        formContainer.append(form);

        // Basic Product Form Fields
        form.appendChild(createFormGroup("Product Name", "text", "Enter product name", "productName"));
        form.appendChild(createFormGroup("Description", "textarea", "Enter product description", "productDescription"));
        form.appendChild(createFormGroup("Regular Price", "number", "Enter product price", "productRegularPrice"));
        form.appendChild(createFormGroup("Listing Price", "number", "Enter product price", "productListingPrice"));
        form.appendChild(createFormGroup("Stock", "number", "Enter product stock", "productStock"));
        form.appendChild(createFormGroup("Brand", "text", "Enter brand name", "productBrand"));

        // Cover Image
        const coverImageGroup = createImageInput("Cover Image:", "coverImage");
        form.appendChild(coverImageGroup);

        // Additional Images (up to 4)
        const additionalImagesGroup = document.createElement("div");
        const additionalImagesLabel = document.createElement("label");
        additionalImagesLabel.textContent = "Additional Images:";
        additionalImagesGroup.appendChild(additionalImagesLabel);
        addAdditionalImages(additionalImagesGroup, 4);
        form.appendChild(additionalImagesGroup);

        // Dynamic Fields based on Category Attributes
        data.forEach((item) => {
          const formGroup = document.createElement("div");
          formGroup.classList.add("form-group", "mb-4");

          // Create label
          const label = document.createElement("label");
          label.setAttribute("for", item.key);
          label.innerText = item.key;
          formGroup.appendChild(label);

          let input;

          // Check type and create the appropriate input field
          if (item.value === "string") {
            input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("name", item.key);
            input.setAttribute("placeholder", `Enter ${item.key}`);
            input.classList.add(
              "form-input",
              "w-full",
              "p-2",
              "border",
              "border-gray-300",
              "rounded"
            );
          } else if (item.value === "number") {
            input = document.createElement("input");
            input.setAttribute("type", "number");
            input.setAttribute("name", item.key);
            input.setAttribute("placeholder", `Enter ${item.key}`);
            input.classList.add(
              "form-input",
              "w-full",
              "p-2",
              "border",
              "border-gray-300",
              "rounded"
            );
          } else if (item.value === "boolean") {
            input = document.createElement("input");
            input.setAttribute("type", "checkbox");
            input.setAttribute("name", item.key);
            input.classList.add("form-checkbox", "h-4", "w-5", "m-1");
          }

          if (input) {
            formGroup.appendChild(input);
          }

          // Append the form group to the form container
          form.appendChild(formGroup);
        });

        formModalContent.appendChild(formContainer);

        // Submit Button
        const submitFormButton = document.createElement("button");
        submitFormButton.className = "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 mt-4";
        submitFormButton.textContent = "Add Product";
        submitFormButton.type = "submit";

        submitFormButton.addEventListener("click", async function (event) {
          event.preventDefault();
          const formDetails = new FormData(document.getElementById("productForm"));
          try {

            const response = await axios.post(`http://localhost:4000/product/Addproduct/${selectedCategory}`, formDetails);
            
            
            
          } catch (error) {
            console.error('Error while sending data to the server:', error);
          }
        });

        formModalContent.appendChild(submitFormButton);

        formModal.appendChild(formModalContent);
        document.body.appendChild(formModal);
        formContainer.scrollIntoView({ behavior: "smooth" });
      });

      modalContent.appendChild(modalTitle);
      modalContent.appendChild(categorySelect);
      modalContent.appendChild(submitButton);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  });
});

// Function to create form groups
function createFormGroup(labelText, inputType, placeholderText, name) {
  const group = document.createElement("div");
  group.className = "mb-4";

  const label = document.createElement("label");
  label.textContent = labelText;
  label.className = "block font-semibold text-gray-700 mb-2";
  group.appendChild(label);

  if (inputType === "textarea") {
    const textarea = document.createElement("textarea");
    textarea.className = "w-full p-2 border border-gray-300 rounded";
    textarea.placeholder = placeholderText;
    textarea.name = name;
    group.appendChild(textarea);
  } else {
    const input = document.createElement("input");
    input.type = inputType;
    input.placeholder = placeholderText;
    input.className = "w-full p-2 border border-gray-300 rounded";
    input.name = name;
    group.appendChild(input);
  }

  return group;
}

// Function to create image input with preview and cropper functionality
function createImageInput(labelText, name) {
  const group = document.createElement("div");

  const label = document.createElement("label");
  label.textContent = labelText;
  group.appendChild(label);

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.name = name;
  input.className = "form-input w-full p-2 border border-gray-300 rounded";
  group.appendChild(input);

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (group.querySelector("img")) {
      group.querySelector("img").remove();
    }
    const preview = document.createElement("img");
    preview.src = URL.createObjectURL(file);
    
    preview.className = "mt-2 w-32 h-32 object-cover border border-gray-300 rounded";
    group.appendChild(preview);

    showCropper(preview.src, preview, input);
  });

  return group;
}

// Function to add additional image inputs with cropping for multiple images
function addAdditionalImages(container, maxImages) {
  let imageCounter = 0;
  for (let i = 0; i < maxImages; i++) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.name = `additionalImage_${i}`;
    input.className = "form-input w-full p-2 border border-gray-300 rounded";
    container.appendChild(input);

    input.addEventListener("change", (event) => {
      if (imageCounter >= maxImages) {
        alert(`You can only upload up to ${maxImages} images.`);
        return;
      }
      const file = event.target.files[0];
      const preview = document.createElement("img");
      preview.src = URL.createObjectURL(file);
      preview.className = "mt-2 w-32 h-32 object-cover border border-gray-300 rounded";
      container.appendChild(preview);
      showCropper(preview.src, preview, input);
      imageCounter++;
    });
  }
}

function showCropper(src, previewElement, inputElement) {
  // Create a modal for cropping
  const cropModal = document.createElement("div");
  cropModal.id = "cropModal";
  cropModal.className = "fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center";

  const cropModalContent = document.createElement("div");
  cropModalContent.className = "bg-white w-1/2 max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg relative";

  const cropModalTitle = document.createElement("h2");
  cropModalTitle.className = "text-2xl font-semibold mb-4 text-gray-800";
  cropModalTitle.textContent = "Crop Image";

  // Close button
  const closeCropModalButton = document.createElement("span");
  closeCropModalButton.innerHTML = "&times;";
  closeCropModalButton.className = "absolute top-0 right-0 text-4xl cursor-pointer p-2";
  closeCropModalButton.addEventListener("click", () => {
    document.body.removeChild(cropModal);
  });

  // Append elements to modal
  cropModalContent.appendChild(cropModalTitle);
  cropModalContent.appendChild(closeCropModalButton);

  // Create container for Croppie
  const cropContainer = document.createElement("div");
  cropContainer.id = "cropContainer";
  cropModalContent.appendChild(cropContainer);

  // Create crop button
  const cropButton = document.createElement("button");
  cropButton.className = "bg-green-500 text-white px-4 py-2 rounded mt-4";
  cropButton.textContent = "Crop & Save";

  cropModalContent.appendChild(cropButton);
  cropModal.appendChild(cropModalContent);
  document.body.appendChild(cropModal);

  // Initialize Croppie with square viewport
  const croppieInstance = new Croppie(cropContainer, {
    viewport: { width: 200, height: 200, type: "square" },
    boundary: { width: 300, height: 300 },
    showZoomer: true,
  });
  croppieInstance.bind({ url: src });

  // Handle crop and save
  cropButton.addEventListener("click", () => {
    croppieInstance.result({ type: "blob", format: "jpeg" }).then((croppedBlob) => {
      // Set the cropped image as the preview
      previewElement.src = URL.createObjectURL(croppedBlob);

      // Set the blob as the file in the input element for backend submission
      const dataTransfer = new DataTransfer();
      const croppedFile = new File([croppedBlob], "croppedImage.jpg", { type: "image/jpeg" });
      dataTransfer.items.add(croppedFile);
      inputElement.files = dataTransfer.files;

      // Close the modal
      document.body.removeChild(cropModal);
    });
  });
}

// Existing code...

// Inside the loop where you create the product card


// Function to open edit modal
function openEditModal(product) {
  // Create modal container
  const modal = document.createElement("div");
  modal.className = "absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center";

  const modalContent = document.createElement("div");
  modalContent.className = "bg-white w-1/2 p-6 rounded-lg shadow-lg";

  // Modal title
  const modalTitle = document.createElement("h2");
  modalTitle.className = "text-2xl font-semibold mb-4";
  modalTitle.textContent = "Edit Product";
  modalContent.appendChild(modalTitle);

  // Create form for editing product
  const form = document.createElement("form");
  form.className = "grid grid-cols-1 gap-4";
  form.method = "POST";

  // Populate form fields with product details
  form.appendChild(createFormGroup("Product Name", "text", product.productName, "productName"));
  form.appendChild(createFormGroup("Description", "textarea", product.productDescription, "productDescription"));
  form.appendChild(createFormGroup("Regular Price", "number", product.RegularPrice, "productRegularPrice"));
  form.appendChild(createFormGroup("Listing Price", "number", product.ListingPrice, "productListingPrice"));
  form.appendChild(createFormGroup("Stock", "number", product.stock, "productStock"));
  form.appendChild(createFormGroup("Brand", "text", product.brand, "productBrand"));

  // Cover Image field
  const coverImageGroup = createImageInput("Cover Image", "coverImage", product.coverImage);
  form.appendChild(coverImageGroup);

  // Additional Images (up to 4)
  const additionalImagesGroup = document.createElement("div");
  const additionalImagesLabel = document.createElement("label");
  additionalImagesLabel.textContent = "Additional Images:";
  additionalImagesGroup.appendChild(additionalImagesLabel);
  addAdditionalImages(additionalImagesGroup, 4);
  form.appendChild(additionalImagesGroup);

  // Append form to modal content
  modalContent.appendChild(form);

  // Close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.className = "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600";
  closeButton.addEventListener("click", () => document.body.removeChild(modal));
  modalContent.appendChild(closeButton);

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Save Changes";
  submitButton.className = "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-4";
  submitButton.type = "submit";

  submitButton.addEventListener("click", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      // Send update request to server
      const response = await axios.patch(`http://localhost:4000/product/updateProduct/${product.id}`, formData);
      console.log("Product updated:", response.data);
      document.body.removeChild(modal);
      // Optionally, reload products to reflect changes
      products();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  });

  modalContent.appendChild(submitButton);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

// Updated createFormGroup function to accept a default value
function createFormGroup(labelText, inputType, defaultValue, name) {
  const group = document.createElement("div");
  group.className = "mb-4";

  const label = document.createElement("label");
  label.textContent = labelText;
  label.className = "block font-semibold text-gray-700 mb-2";
  group.appendChild(label);

  let input;
  if (inputType === "textarea") {
    input = document.createElement("textarea");
    input.className = "w-full p-2 border border-gray-300 rounded";
    input.name = name;
    input.textContent = defaultValue || "";
  } else {
    input = document.createElement("input");
    input.type = inputType;
    input.className = "w-full p-2 border border-gray-300 rounded";
    input.name = name;
    input.value = defaultValue || "";
  }
  group.appendChild(input);

  return group;
}

// Updated createImageInput function to accept default image URL
function createImageInput(labelText, name, imageUrl) {
  const group = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = labelText;
  group.appendChild(label);

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.name = name;
  input.className = "form-input w-full p-2 border border-gray-300 rounded";
  group.appendChild(input);

  if (imageUrl) {
    const preview = document.createElement("img");
    preview.src = imageUrl;
    preview.className = "mt-2 w-32 h-32 object-cover border border-gray-300 rounded";
    group.appendChild(preview);
  }

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (group.querySelector("img")) {
      group.querySelector("img").remove();
    }
    const preview = document.createElement("img");
    preview.src = URL.createObjectURL(file);
    preview.className = "mt-2 w-32 h-32 object-cover border border-gray-300 rounded";
    group.appendChild(preview);
  });

  return group;
}
