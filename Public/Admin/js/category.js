document.addEventListener("DOMContentLoaded", async () => {
  // modal opening
  document.getElementById("openModal").onclick = function () {
    document.getElementById("modal").classList.remove("hidden");
  };

  // modal closing
  document.getElementById("closeMainModal").onclick = function () {
    document.getElementById("modal").classList.add("hidden");
  };

  let responsetracker = false;

  let cropper;
  let image_url;

  let input = document.getElementById("input");
  let image_show = document.getElementById("wrapper");
  let cropbutton = document.getElementById("crop-button");
  let cropmodal = document.getElementById("cropModal");
  let newWrap = document.getElementById("newwrap");
  let cropModalCloseButton = document.getElementById("closeModal");
  let cropImageSaveButton = document.getElementById("cropButton");
  let finalImage = document.getElementById("croppedImageDataURl");

  let croppedImageInput = document.createElement("input");
  croppedImageInput.type = "hidden";
  croppedImageInput.name = "croppedImageDataUrl"; // Consistent naming
  document.getElementById("categoryForm").appendChild(croppedImageInput);

  input.addEventListener("change", (event) => {
    if (event.target.files && event.target.files[0]) {
      cropbutton.classList.remove("hidden");

      let image_file = event.target.files[0];
      let reader = new FileReader();

      reader.readAsDataURL(image_file);
      reader.onload = (e) => {
        image_url = e.target.result;
        image_show.innerHTML = "";

        let image = document.createElement("img");
        image.src = image_url;
        image.style.width = "100px";
        image.style.height = "100px";
        image.classList.add(
          "categoryImage",
          "w-20",
          "h-20",
          "object-cover",
          "rounded-md"
        );
        image_show.appendChild(image);
      };
    }
  });

  cropbutton.addEventListener("click", (event) => {
    event.preventDefault();
    cropmodal.classList.remove("hidden");

    newWrap.innerHTML = "";

    let cropImage = document.createElement("img");
    cropImage.src = image_url;
    newWrap.appendChild(cropImage);

    cropper = new Croppie(cropImage, {
      viewport: { width: 300, height: 300, type: "square" },
      boundary: { width: 400, height: 400 },
      enableExif: true,
    });
  });

  cropImageSaveButton.addEventListener("click", (event) => {
    event.preventDefault();
    if (cropper) {
      cropper
        .result({
          type: "base64",
          size: { width: 300, height: 300 },
          format: "jpeg",
          quality: 1,
        })
        .then((result) => {
          let croppedImage = document.createElement("img");
          croppedImage.src = result;
          croppedImage.style.width = "100px";
          croppedImage.style.height = "100px";
          croppedImage.classList.add(
            "categoryImage",
            "w-20",
            "h-20",
            "object-cover",
            "rounded-md"
          );

          image_show.innerHTML = "";
          image_show.appendChild(croppedImage);

          croppedImageInput.value = result;
          cropmodal.classList.add("hidden");
        });
    }
  });

  cropModalCloseButton.addEventListener("click", (event) => {
    event.preventDefault();
    cropmodal.classList.add("hidden");
  });

  document
    .getElementById("categoryForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const categoryNameError = document.getElementById("categoryNameError");
      const categoryDescError = document.getElementById("categoryDescError");
      const categoryImageError = document.getElementById("categoryImageError");

      console.log(croppedImageInput.value);

      const categoryName = document.getElementById("categoryName").value;
      finalImage = croppedImageInput.value;
      const categoryDescription = document.getElementById(
        "categoryDescription"
      ).value;
      let hasError = false;

      // Regex for category name (letters, spaces, and must end with 's')
      const categoryRegex = /^[A-Za-z ]+s$/;

      // Regex for description (allow letters, numbers, spaces)
      const generalRegex = /^[A-Za-z0-9 ]+$/;


      // Validate Category Name
      if (categoryName.trim() === "") {
        categoryNameError.textContent = "Category Name is required";
        categoryNameError.classList.add(
          "text-red-600",
          "text-sm",
          "mt-1",
          "font-medium",
          "bg-red-100",
          "p-2",
          "rounded",
          "shadow-md",
          "animate-pulse"
        );
        hasError = true;
      } else if (!categoryRegex.test(categoryName.trim())) {
        categoryNameError.textContent = "Category Name must end with 's'.";
        categoryNameError.classList.add(
          "text-red-600",
          "text-sm",
          "mt-1",
          "font-medium",
          "bg-red-100",
          "p-2",
          "rounded",
          "shadow-md",
          "animate-pulse"
        );
        hasError = true;
      } else {
        categoryNameError.textContent = "";
      }
      // Validate Category Description
      if (categoryDescription.trim() === "") {
        categoryDescError.textContent = "Category Description is required";
        categoryDescError.classList.add(
          "text-red-600",
          "text-sm",
          "mt-1",
          "font-medium",
          "bg-red-100",
          "p-2",
          "rounded",
          "shadow-md",
          "animate-pulse"
        );
        hasError = true;
      } else if (!categoryDescription.trim()) {
        categoryDescError.textContent = "Category Description";
        categoryDescError.classList.add(
          "text-red-600",
          "text-sm",
          "mt-1",
          "font-medium",
          "bg-red-100",
          "p-2",
          "rounded",
          "shadow-md",
          "animate-pulse"
        );
        hasError = true;
      } else {
        categoryDescError.textContent = "";
      }

      // Validate Category Image (Assuming it's a URL, you might want to adjust the regex based on URL format)
      const urlRegex = /^[A-Za-z0-9-._~:/?#[\]@!$&'()*+,;=]+$/;

      if (finalImage.trim() === "") {
        categoryImageError.textContent = "Category Image is required";
        categoryImageError.classList.add(
          "text-red-600",
          "text-sm",
          "mt-1",
          "font-medium",
          "bg-red-100",
          "p-2",
          "rounded",
          "shadow-md",
          "animate-pulse"
        );
        hasError = true;
      } else if (!urlRegex.test(finalImage.trim())) {
        categoryImageError.textContent =
          "Category Image must be a valid URL or contain only valid characters.";
        categoryImageError.classList.add(
          "text-red-600",
          "text-sm",
          "mt-1",
          "font-medium",
          "bg-red-100",
          "p-2",
          "rounded",
          "shadow-md",
          "animate-pulse"
        );
        hasError = true;
      } else {
        categoryImageError.textContent = "";
      }

      if (hasError) return;

      const formData = new FormData(this);
      formData.append("categoryDescription", categoryDescription);
      formData.append("categoryImage", croppedImageInput.value);

      try {
        const response = await axios.post("/category", formData);
        const data = response;
        console.log("sucess", data);

        Swal.fire({
          title: "Category Added Successfully!",
          text: "Your new category has been added successfully.",
          icon: "success",
          confirmButtonText: "Great!",
          confirmButtonColor: "#4CAF50",
          backdrop: `rgba(0,0,0,0.4)`,
        });

        
        
        image_show.innerHTML = "";
        croppedImageInput.value = "";
        document.getElementById("modal").classList.add("hidden");
      } catch (error) {
        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            "An error occurred while submitting the form.";
          console.log(`Error: ${errorMessage}`);
          console.error("Error response:", error.response.data);
        } else if (error.request) {
          console.log(
            "No response received from the server. Please try again later."
          );
          console.error("Error request:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
      }

      // await axios
      //   .post("/category", formData)
      //   .then((response) => {
      //     console.log("Success:", response.data);
      //     responsetracker = true;

      //     // creating dynamic card

      // Reset form
    });
});

// adding attributes

document
  .getElementById("addAttribute")
  .addEventListener("click", async function () {
    const attributesContainer = document.getElementById("attributesContainer");

    const attributeRow = document.createElement("div");
    attributeRow.classList.add("attribute-row", "flex", "items-center", "mb-2");

    const keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.placeholder = "Key";
    keyInput.required = true;
    keyInput.classList.add(
      "border",
      "border-gray-300",
      "rounded-md",
      "p-2",
      "w-1/3",
      "mr-2"
    );
    keyInput.name = "attributeKey[]";

    const typeSelect = document.createElement("select");
    typeSelect.required = true;
    typeSelect.classList.add(
      "border",
      "border-gray-300",
      "rounded-md",
      "p-2",
      "mr-2"
    );
    typeSelect.name = "attributeType[]";

    const optionString = document.createElement("option");
    optionString.value = "string";
    optionString.text = "String";
    const optionNumber = document.createElement("option");
    optionNumber.value = "number";
    optionNumber.text = "Number";
    const optionBoolean = document.createElement("option");
    optionBoolean.value = "boolean";
    optionBoolean.text = "Boolean";

    typeSelect.appendChild(optionString);
    typeSelect.appendChild(optionNumber);
    typeSelect.appendChild(optionBoolean);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.classList.add(
      "remove-attribute",
      "bg-red-500",
      "text-white",
      "px-2",
      "rounded-md"
    );

    attributeRow.appendChild(keyInput);
    attributeRow.appendChild(typeSelect);
    attributeRow.appendChild(removeButton);

    attributesContainer.appendChild(attributeRow);

    removeButton.addEventListener("click", function () {
      attributeRow.remove();
    });
  });

async function listcategory() {
  try {
    const res = await axios.get("/category-details");
    const data = res.data;

    const container = document.getElementById("category-list");
    container.innerHTML = ""; // Clear existing content

    for (let i = 0; i < data.data.length; i++) {
      const card = document.createElement("div");
      card.className =
        "flex-shrink-0 w-80 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col";
      container.appendChild(card);

      const image = document.createElement("img");
      image.className = "w-full h-48 object-cover";
      image.src = data.data[i].imageUrl;
      card.appendChild(image);

      const cardContent = document.createElement("div");
      cardContent.className = "p-6";

      const title = document.createElement("h2");
      title.className = "font-bold text-xl mb-2";
      title.textContent = data.data[i].categoryTitle;
      cardContent.appendChild(title);

      const description = document.createElement("p");
      description.className = "text-gray-700 text-base mb-4";
      description.textContent = data.data[i].categoryDescription;
      cardContent.appendChild(description);

      const buttonContainer = document.createElement("div");
      buttonContainer.className =
        "flex items-center justify-between p-4 mt-auto";

      const toggleButton = document.createElement("button");
      toggleButton.className =
        "toggleButton px-3 py-1 bg-teal-500 text-white font-semibold rounded-lg text-sm transition-colors duration-300 hover:bg-teal-600";
      toggleButton.textContent = data.data[i].isblocked ? "Unblock" : "Block";
      toggleButton.setAttribute("data-user-id", data.data[i]._id);

      const statusText = document.createElement("span");
      statusText.textContent = data.data[i].isblocked ? "Blocked" : "Active";
      statusText.className = `px-2 py-1 rounded-full text-xs font-semibold ${
        data.data[i].isblocked
          ? "bg-red-500 text-white"
          : "bg-green-500 text-white"
      }`;

      const editButton = document.createElement("button");
      editButton.className =
        "editButton px-3 py-1 bg-blue-500 text-white font-semibold rounded-lg text-sm transition-colors duration-300 hover:bg-blue-600";
      editButton.textContent = "Edit";
      editButton.setAttribute("data-user-id", data.data[i]._id);

      buttonContainer.appendChild(toggleButton);
      buttonContainer.appendChild(statusText);
      buttonContainer.appendChild(editButton);

      cardContent.appendChild(buttonContainer);
      card.appendChild(cardContent);

      // Add event listeners (toggle and edit functionality remains the same)
      toggleButton.addEventListener("click", handleToggle);
      editButton.addEventListener("click", handleEdit);
    }
  } catch (error) {
    console.log("Error while getting data in the function", error);
  }
}

function handleToggle(e) {
  const buttonToggle = e.target;
  const categoryId = buttonToggle.getAttribute("data-user-id");
  const statusText = buttonToggle.nextElementSibling;

  buttonToggle.textContent = "Loading...";
  buttonToggle.disabled = true;

  const isCurrentlyBlocked = statusText.textContent === "Blocked";
  const endpoint = isCurrentlyBlocked
    ? `/category-details/${categoryId}/unblock`
    : `/category-details/${categoryId}/block`;

  axios
    .patch(endpoint)
    .then((response) => {
      if (
        response.data &&
        response.data.categoryData &&
        response.data.categoryData.isblocked !== undefined
      ) {
        const isBlockedNow = response.data.categoryData.isblocked;

        statusText.textContent = isBlockedNow ? "Blocked" : "Active";
        buttonToggle.textContent = isBlockedNow ? "Unblock" : "Block";

        if (isBlockedNow) {
          statusText.classList.replace("bg-green-500", "bg-red-500");
        } else {
          statusText.classList.replace("bg-red-500", "bg-green-500");
        }

        console.log(
          `Category ${categoryId} is now ${isBlockedNow ? "blocked" : "active"}`
        );
      } else {
        throw new Error("Unexpected response format from server.");
      }
    })
    .catch((error) => {
      console.error("Error updating category status:", error);
      buttonToggle.textContent = "Error";
      setTimeout(() => {
        buttonToggle.textContent =
          statusText.textContent === "Active" ? "Block" : "Unblock";
      }, 3000);
    })
    .finally(() => {
      buttonToggle.disabled = false;
    });
}

// Function to handle edit
function handleEdit(e) {
  const editButton = e.target;
  const categoryId = editButton.getAttribute("data-user-id");

  // Fetch the category data and populate the modal
  axios
    .get(`/category-details/${categoryId}`)
    .then((response) => {
      const category = response.data.categoryData[0];
      console.log(category);

      // Populate form with category data
      document.getElementById("editCategoryId").value = category._id;
      document.getElementById("editCategoryTitle").value =
        category.categoryTitle;
      document.getElementById("editCategoryDescription").value =
        category.categoryDescription;

      // Show current category image if available
      const currentImage = document.getElementById("currentCategoryImage");
      currentImage.src = category.imageUrl || ""; // Show the existing image or a placeholder

      // Open the modal for editing
      document.getElementById("editCategoryModal").classList.remove("hidden");
    })
    .catch((error) => {
      console.error("Error fetching category details:", error);
    });
}

// Function to handle image file to Base64 conversion
function convertImageToBase64(imageFile, callback) {
  const reader = new FileReader();
  reader.onloadend = function () {
    callback(reader.result);
  };
  reader.readAsDataURL(imageFile); // This converts the file to a base64 string
}

// Function to handle form submission
document
  .getElementById("editCategoryForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission

    const categoryId = document.getElementById("editCategoryId").value;
    const title = document.getElementById("editCategoryTitle").value;
    const description = document.getElementById(
      "editCategoryDescription"
    ).value;
    const imageFile = document.getElementById("editCategoryImage").files[0];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    if (imageFile) {
      // Convert the image to base64 format before appending
      await new Promise((resolve) => {
        convertImageToBase64(imageFile, (base64Image) => {
          formData.append("image", base64Image); // Send base64 string instead of file
          resolve();
        });
      });
    }

    // Show SweetAlert2 confirmation dialog
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update this category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.patch(
            `/category/${categoryId}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          Swal.fire(
            "Updated!",
            "The category has been updated successfully.",
            "success"
          );

          // Close the modal after the update
          document.getElementById("editCategoryModal").classList.add("hidden");

          // Refresh the category list
          listcategory();
        } catch (error) {
          console.error("Error updating category:", error);
          Swal.fire(
            "Error!",
            "There was an issue updating the category. Please try again.",
            "error"
          );
        }
      }
    });
  });

// Function to handle image removal
document.getElementById("removeImageButton").addEventListener("click", () => {
  const currentImage = document.getElementById("currentCategoryImage");
  currentImage.src = ""; // Clear the image preview
  document.getElementById("editCategoryImage").value = null; // Clear the file input

  console.log(
    "Image removed, you can handle this action server-side if necessary."
  );

  // Optional: You can also send a request to the backend to remove the image
  const categoryId = document.getElementById("editCategoryId").value;

  axios
    .patch(`/category/remove-image/${categoryId}`)
    .then((response) => {
      console.log("Image removed from the server successfully:", response.data);
    })
    .catch((error) => {
      console.error("Error removing image:", error);
    });
});

// Call listcategory() to populate the category list initially
listcategory();
