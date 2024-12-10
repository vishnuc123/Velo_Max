async function getCategory() {
  try {
    const response = await axios.get("/dashboard/category-details");
    const data = response.data;
    console.log(data);

    for (let i = 0; i < data.data.length; i++) {
      // Assuming `data` is an object with `imageUrl`, `categoryTitle`, and `categoryDescription` properties
      const container = document.getElementById("cards-container");

      // Add Tailwind CSS grid classes to the container
      container.classList.add(
        "grid",
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-4",
        "gap-4",
        "p-8"
      );

      // Create the card div element
      const card = document.createElement("div");
      card.classList.add(
        "bg-white",
        "rounded-lg",
        "shadow-lg",
        "overflow-hidden"
      );

      // Create the image element
      const img = document.createElement("img");
      img.src = data.data[i].imageUrl; // Assuming `data.imageUrl` is available
      img.alt = "Bike Plan";
      img.classList.add("w-full", "h-40", "object-cover");

      // Create the content div element
      const content = document.createElement("div");
      content.classList.add("p-4");

      // Create the title (h2) element
      const title = document.createElement("h2");
      title.classList.add("text-lg", "font-semibold");
      title.textContent = data.data[i].categoryTitle; // Assuming `data.categoryTitle` is available

      // Create the description (p) element
      const description = document.createElement("p");
      description.classList.add("text-gray-600");
      description.textContent = data.data[i].categoryDescription; // Assuming `data.categoryDescription` is available

      // Append the title and description to the content div
      content.appendChild(title);
      content.appendChild(description);

      // Append the image and content to the card div
      card.appendChild(img);
      card.appendChild(content);

      // Append the card to the container
      container.appendChild(card);
    }
  } catch (error) {
    console.error("error while getting categoryDetails ", error);
  }
}

getCategory();
