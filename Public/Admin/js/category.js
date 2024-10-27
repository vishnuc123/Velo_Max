
document.addEventListener('DOMContentLoaded',async () => {

  // Open Modal
  document.getElementById("openModal").onclick = function () {
    document.getElementById("modal").classList.remove("hidden");
  };

  // Close Modal
  document.getElementById("closeMainModal").onclick = function () {
    document.getElementById("modal").classList.add("hidden");
  };

  let responsetracker = false;

  let cropper;
  let image_url;

  // Elements
  let input = document.getElementById("input");
  let image_show = document.getElementById("wrapper");
  let cropbutton = document.getElementById("crop-button");
  let cropmodal = document.getElementById("cropModal");
  let newWrap = document.getElementById("newwrap");
  let cropModalCloseButton = document.getElementById("closeModal");
  let cropImageSaveButton = document.getElementById("cropButton");
  let finalImage = document.getElementById("croppedImageDataURl");

  // Create a hidden input field to store the cropped image data
  let croppedImageInput = document.createElement("input");
  croppedImageInput.type = "hidden";
  croppedImageInput.name = "croppedImageDataUrl"; // Consistent naming
  document.getElementById("categoryForm").appendChild(croppedImageInput);

  // Image upload and display in the wrapper
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

  // Handle Crop button click
  cropbutton.addEventListener("click", (event) => {
    event.preventDefault();
    cropmodal.classList.remove("hidden");

    newWrap.innerHTML = "";

    let cropImage = document.createElement("img");
    cropImage.src = image_url;
    newWrap.appendChild(cropImage);

    // Initialize Croppie
    cropper = new Croppie(cropImage, {
      viewport: { width: 300, height: 300, type: "square" },
      boundary: { width: 400, height: 400 },
      enableExif: true,
    });
  });

  // Handle cropping
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

  // form submission
  document
    .getElementById("categoryForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log(croppedImageInput.value);

      const categoryName = document.getElementById("categoryName").value;
      finalImage = croppedImageInput.value;
      const categoryDescription = document.getElementById(
        "categoryDescription"
      ).value;

      if (!categoryName || !finalImage) {
        alert("Please fill out all fields and upload an image.");
        return;
      }

      const formData = new FormData(this);
      formData.append("categoryImage", croppedImageInput.value);
      formData.append("categoryDescription", categoryDescription);

      try {
        const response = await axios.post('http://localhost:4000/category',formData)
        const data = response.data
        console.log('sucess',data);


        this.reset();
          image_show.innerHTML = "";
          croppedImageInput.value = "";
      } catch (error) {
        console.error('error while post the form data',error);
        
      }
    
      

      // await axios
      //   .post("http://localhost:4000/category", formData)
      //   .then((response) => {
      //     console.log("Success:", response.data);
      //     responsetracker = true;

      //     // creating dynamic card

          // Reset form
          
        })
        
})

  document
    .getElementById("addAttribute")
    .addEventListener("click", async function () {
      const attributesContainer = document.getElementById(
        "attributesContainer"
      );

      const attributeRow = document.createElement("div");
      attributeRow.classList.add(
        "attribute-row",
        "flex",
        "items-center",
        "mb-2"
      );

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

      // Create select for the type
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

// showing category functionsss

async function listcategory() {
  try {
    const res = await axios.get("http://localhost:4000/category-details");
    const data = res.data;
    console.log(data);
    for (let i = 0; i < data.data.length; i++) {
      console.log(i);

      const container = document.getElementById("category-list");
      const card = document.createElement("div");
      card.className = "max-w-md rounded overflow-hidden shadow-lg";
      container.appendChild(card);

      // Image element
      const image = document.createElement("img");
      image.className = "object-fit w-full h-48";
      image.src = data.data[i].imageUrl;
      card.appendChild(image);

      // Card content container
      const cardContent = document.createElement("div");
      cardContent.className = "px-6 py-4";

      // Title element
      const title = document.createElement("div");
      title.className = "font-bold text-xl mb-2";
      title.textContent = data.data[i].categoryTitle;
      title.innerHTML = data.data[i].categoryTitle;
      cardContent.appendChild(title);

      // Description element
      const description = document.createElement("p");
      description.className = "text-gray-700 text-base";
      description.textContent = data.data[i].categoryDescription;
      cardContent.appendChild(description);

      card.appendChild(cardContent);
    }
  } catch (error) {
    console.log("error while getting data in the function", error);
  }
}

listcategory();

