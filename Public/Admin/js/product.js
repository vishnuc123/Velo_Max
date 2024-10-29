
document.addEventListener("DOMContentLoaded", () => {
  const ProductListContainer = document.getElementById("product-list");
  document
    .getElementById("openModalBtn")
    .addEventListener("click", async function () {
      try {
        if (document.getElementById("categoryModal")) return;

        const modal = document.createElement("div");
        modal.id = "categoryModal";
        modal.className =
          "absolute fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center";

        const modalContent = document.createElement("div");
        modalContent.className =
          "bg-white w-1/2 h-auto max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg";

        const modalTitle = document.createElement("h2");
        modalTitle.className = "text-2xl font-semibold mb-4 text-gray-800";
        modalTitle.textContent = "Select a Category";

        const categorySelect = document.createElement("select");
        categorySelect.className =
          "w-full p-3 border border-gray-300 rounded mb-4";

        const response = await axios.get(
          "http://localhost:4000/category-details"
        );
        const data = response.data.data;

        data.forEach((item) => {
          const option = document.createElement("option");
          option.value = item.categoryTitle;
          option.textContent = item.categoryTitle;
          categorySelect.appendChild(option);
        });

        const submitButton = document.createElement("button");
        submitButton.className =
          "bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition duration-300";
        submitButton.textContent = "Submit";

        submitButton.addEventListener("click", async function () {
          const selectedCategory = categorySelect.value;
          const response = await axios.get(
            `http://localhost:4000/products/${selectedCategory}`
          );
          const data = response.data.categoryAttributes;
          console.log(data);

          document.body.removeChild(modal);

          const form = document.createElement("form");
          form.id = "productForm";
          form.className = "grid grid-cols-1 gap-4";
          form.method = "POST"
          form.enctype = 'multipart/form-data';

          const formModal = document.createElement("div");
          formModal.id = "formModal";
          formModal.className =
            "absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center overflow-auto mt-5";

          const formModalContent = document.createElement("div");
          formModalContent.className =
            "bg-white w-1/2 h-auto max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg relative mt-10"; // Adjust margin-top here

          formModalContent.style.top = "50%";
          const closeFormModalButton = document.createElement("span");
          closeFormModalButton.innerHTML = "&times;";
          closeFormModalButton.className =
            "absolute top-0 right-0 text-6xl cursor-pointer bg-red-500 w-10";
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

          const productNameGroup = createFormGroup(
            "Product Name",
            "text",
            "Enter product name",
            "productName"
          );
          const productDescriptionGroup = createFormGroup(
            "Description",
            "textarea",
            "Enter product description",
            "productDescription"
          );
          const productRegularPriceGroup = createFormGroup(
            "Regular Price",
            "number",
            "Enter product price",
            "productRegularPrice"
          );
          const productListingPriceGroup = createFormGroup(
            "Listing Price",
            "number",
            "Enter product price",
            "productListingPrice"
          );
          const productStockGroup = createFormGroup(
            "Stock",
            "number",
            "Enter product price",
            "productStockGroup"
          );
          const productBrandGroup = createFormGroup(
            "Brand",
            "text",
            "Enter Brand Name",
            "productBrandGroup"
          );

          form.appendChild(productNameGroup);
          form.appendChild(productDescriptionGroup);
          form.appendChild(productRegularPriceGroup);
          form.appendChild(productListingPriceGroup);
          form.appendChild(productStockGroup);
          form.appendChild(productBrandGroup);

          const coverImageGroup = document.createElement("div");
          const coverImageLabel = document.createElement("label");
          coverImageLabel.textContent = "Cover Image:";
          coverImageGroup.appendChild(coverImageLabel);

          const coverImageInput = document.createElement("input");
          coverImageInput.setAttribute("type", "file");
          coverImageInput.setAttribute("accept", "image/*");
          coverImageInput.setAttribute('name','coverImage')
          coverImageInput.classList.add(
            "form-input",
            "w-full",
            "p-2",
            "border",
            "border-gray-300",
            "rounded"
          );

          // Limit to one cover image preview
          coverImageInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (coverImageGroup.querySelector("img")) {
              coverImageGroup.querySelector("img").remove(); // Remove the existing preview
            }
            const preview = document.createElement("img");
            preview.id = "imagePreview";
            preview.src = URL.createObjectURL(file);
            preview.className =
              "mt-2 w-full h-32 object-cover border border-gray-300 rounded";
            coverImageGroup.appendChild(preview);

            // Show the cropper immediately after an image is selected
            showCropper(preview.src, preview);
          });

          coverImageGroup.appendChild(coverImageInput);
          form.appendChild(coverImageGroup);

          const additionalImagesGroup = document.createElement("div");
          const additionalImagesLabel = document.createElement("label");
          additionalImagesLabel.textContent = "Additional Images:";
          additionalImagesGroup.appendChild(additionalImagesLabel);

          let imageCounter = 0;
          const maxImages = 4;

          for (let i = 0; i < maxImages; i++) {
            const additionalImageInput = document.createElement("input");
            additionalImageInput.setAttribute("type", "file");
            additionalImageInput.setAttribute("accept", "image/*");
            additionalImageInput.setAttribute("name", "additonalImage");
            additionalImageInput.classList.add(
              "form-input",
              "w-full",
              "p-2",
              "border",
              "border-gray-300",
              "rounded"
            );

            additionalImageInput.addEventListener("change", (event) => {
              if (imageCounter >= maxImages) {
                alert(`You can only upload up to ${maxImages} images.`);
                return;
              }

              const file = event.target.files[0];

              // Create a container to hold the image preview and the crop button together
              const imageContainer = document.createElement("div");
              imageContainer.className =
                "inline-block w-1/4 mt-2 mr-2 border border-gray-300 rounded p-1";

              // Create and append the image preview
              const preview = document.createElement("img");
              preview.id = "imagePreview";
              preview.src = URL.createObjectURL(file);
              preview.className = "w-full h-32 object-cover rounded";
              imageContainer.appendChild(preview);

              // Create and append the crop button below the image preview
              const cropButton = document.createElement("button");
              cropButton.textContent = "Crop";
              cropButton.className =
                "bg-yellow-500 text-white px-2 py-1 rounded mt-2 w-full";
              cropButton.addEventListener("click", () => {
                showCropper(preview.src, preview);
              });
              imageContainer.appendChild(cropButton);

              // Append the container to the additionalImagesGroup
              additionalImagesGroup.appendChild(imageContainer);

              imageCounter++; // Increment image counter
            });

            additionalImagesGroup.appendChild(additionalImageInput);
          }

          form.appendChild(additionalImagesGroup);

          // Assuming `data` is the array you provided
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

          const submitFormButton = document.createElement("button");
          submitFormButton.className =
            "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 mt-4";
          submitFormButton.textContent = "Add Product";
          submitFormButton.type = "submit";

          submitFormButton.addEventListener("click", async function (event) {
            event.preventDefault();

            const formdetials = document.getElementById('productForm')
            console.log(formdetials);
            
            const AddProductForm = new FormData(formdetials)
            const additionalImages = document.querySelectorAll('input[name="additionalImage"]');
            additionalImages.forEach((input) => {
              if (input.files.length > 0) {
                formData.append('additionalImages[]', input.files[0]); // Use array syntax
              }
            });
           
            try {
              const response = await axios.post('http://localhost:4000/product/Addproduct',AddProductForm)
              const data = response.data
              console.log(data)
              formdetials.reset();
            } catch (error) {
              console.log('error while sending data to the server');
              
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

function createFormGroup(labelText, inputType, placeholderText,name) {
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
    group.appendChild(textarea);
  } else {
    const input = document.createElement("input");
    input.type = inputType;
    input.placeholder = placeholderText;
    input.className = "w-full p-2 border border-gray-300 rounded";
    input.name = name
    group.appendChild(input);
  }

  return group;
}

function showCropper(imageSrc, previewElement) {
  // Create a new modal for the cropper
  const cropModal = document.createElement("div");
  cropModal.id = "cropModal";
  cropModal.className =
    "absolute fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center";

  const cropModalContent = document.createElement("div");
  cropModalContent.className =
    "bg-white w-1/2 max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg relative";

  const cropModalTitle = document.createElement("h2");
  cropModalTitle.className = "text-2xl font-semibold mb-4 text-gray-800";
  cropModalTitle.textContent = "Crop Image";

  // Close button
  const closeCropModalButton = document.createElement("span");
  closeCropModalButton.innerHTML = "&times;";
  closeCropModalButton.className =
    "absolute top-0 right-0 text-4xl cursor-pointer p-2";
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

  // Initialize Croppie
  const croppieInstance = new Croppie(cropContainer, {
    viewport: { width: 200, height: 200, type: "square" },
    boundary: { width: 300, height: 300 },
    showZoomer: true,
  });
  croppieInstance.bind({ url: imageSrc });

  // Handle crop save
  cropButton.addEventListener("click", () => {
    croppieInstance
      .result({ type: "blob", format: "jpeg" })
      .then((croppedImageBlob) => {
        // Set the cropped image as the preview
        previewElement.src = URL.createObjectURL(croppedImageBlob);

        // Close the modal
        document.body.removeChild(cropModal);
      });
  });
}
