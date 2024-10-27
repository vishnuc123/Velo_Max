
document.addEventListener('DOMContentLoaded',() => {



document.getElementById('openModalBtn').addEventListener('click', async function () {
  try {
    if (document.getElementById('categoryModal')) return;

    const modal = document.createElement('div');
    modal.id = 'categoryModal';
    modal.className = 'absolute fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white w-1/2 h-auto max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg';

    const modalTitle = document.createElement('h2');
    modalTitle.className = 'text-2xl font-semibold mb-4 text-gray-800';
    modalTitle.textContent = 'Select a Category';

    const categorySelect = document.createElement('select');
    categorySelect.className = 'w-full p-3 border border-gray-300 rounded mb-4';

    const response = await axios.get('http://localhost:4000/category-details');
    const data = response.data.data;

    data.forEach(item => {
      const option = document.createElement('option');
      option.value = item.categoryTitle;
      option.textContent = item.categoryTitle;
      categorySelect.appendChild(option);
    });

    const submitButton = document.createElement('button');
    submitButton.className = 'bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition duration-300';
    submitButton.textContent = 'Submit';

    submitButton.addEventListener('click', async function () {
      const selectedCategory = categorySelect.value;
      const response = await axios.get(`http://localhost:4000/products/${selectedCategory}`);
      const data = response.data.categoryAttributes[0];
      

      document.body.removeChild(modal);

      const formModal = document.createElement('div');
      formModal.id = 'formModal';
      formModal.className = 'relative inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center overflow-auto';

      const formModalContent = document.createElement('div');
      formModalContent.className = 'bg-white w-1/2 h-auto max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg relative mt-10';  // Adjust margin-top here

      const closeFormModalButton = document.createElement('span');
      closeFormModalButton.innerHTML = '&times;';
      closeFormModalButton.className = 'absolute top-0 right-0 text-6xl cursor-pointer bg-red-500 w-10';
      closeFormModalButton.addEventListener('click', function () {
        document.body.removeChild(formModal);
      });

      formModalContent.appendChild(closeFormModalButton);

      const formTitle = document.createElement('h2');
      formTitle.className = 'text-2xl font-semibold mb-4 text-gray-800 ';
      formTitle.textContent = 'Add New Product';
      formModalContent.appendChild(formTitle);

      const formContainer = document.createElement('div');
      formContainer.id = 'formContainer';
      formContainer.className = 'grid grid-cols-1 gap-4';

      const productNameGroup = createFormGroup('Product Name', 'text', 'Enter product name');
      const productDescriptionGroup = createFormGroup('Description', 'textarea', 'Enter product description');
      const productRegularPriceGroup = createFormGroup('Regular Price', 'number', 'Enter product price');
      const productListingPriceGroup = createFormGroup('Listing Price', 'number', 'Enter product price');
      const productStockGroup = createFormGroup('Stock', 'number', 'Enter product price');
      const productBrandGroup = createFormGroup('Brand', 'text', 'Enter Brand Name');

      formContainer.appendChild(productNameGroup);
      formContainer.appendChild(productDescriptionGroup);
      formContainer.appendChild(productRegularPriceGroup);
      formContainer.appendChild(productListingPriceGroup);
      formContainer.appendChild(productStockGroup);
      formContainer.appendChild(productBrandGroup);

      const coverImageGroup = document.createElement('div');
      const coverImageLabel = document.createElement('label');
      coverImageLabel.textContent = 'Cover Image:';
      coverImageGroup.appendChild(coverImageLabel);

      const coverImageInput = document.createElement('input');
      coverImageInput.setAttribute('type', 'file');
      coverImageInput.setAttribute('accept', 'image/*');
      coverImageInput.classList.add('form-input', 'w-full', 'p-2', 'border', 'border-gray-300', 'rounded');


      
      // Limit to one cover image preview
      coverImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (coverImageGroup.querySelector('img')) {
          coverImageGroup.querySelector('img').remove(); // Remove the existing preview
        }
        const preview = document.createElement('img');
        preview.src = URL.createObjectURL(file);
        preview.className = 'mt-2 w-full h-32 object-cover border border-gray-300 rounded';
        coverImageGroup.appendChild(preview);
      });
      
      coverImageGroup.appendChild(coverImageInput);
      formContainer.appendChild(coverImageGroup);
      
      const additionalImagesGroup = document.createElement('div');
      const additionalImagesLabel = document.createElement('label');
      additionalImagesLabel.textContent = 'Additional Images:';
      additionalImagesGroup.appendChild(additionalImagesLabel);
      
      let imageCounter = 0;
      const maxImages = 4;
      
      for (let i = 0; i < maxImages; i++) {
        const additionalImageInput = document.createElement('input');
        additionalImageInput.setAttribute('type', 'file');
        additionalImageInput.setAttribute('accept', 'image/*');
        additionalImageInput.classList.add('form-input', 'w-full', 'p-2', 'border', 'border-gray-300', 'rounded');
        
        additionalImageInput.addEventListener('change', (event) => {
          if (imageCounter >= maxImages) {
            alert(`You can only upload up to ${maxImages} images.`);
            return;
          }
          
          const file = event.target.files[0];
          const preview = document.createElement('img');
          preview.src = URL.createObjectURL(file);
          preview.className = 'mt-2 w-1/4 h-32 object-cover border border-gray-300 rounded inline-block';
          additionalImagesGroup.appendChild(preview);

          imageCounter++;  // Increment image counter
        });

        additionalImagesGroup.appendChild(additionalImageInput);
      }

      formContainer.appendChild(additionalImagesGroup);

      for (const key in data) {
        if (key !== '_id') {
          const formGroup = document.createElement('div');
          formGroup.classList.add('form-group', 'mb-4');

          const label = document.createElement('label');
          label.setAttribute('for', key);
          label.innerText = key;
          formGroup.appendChild(label);

          let input;

          if (data[key] === 'string') {
            input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('name', key);
            input.setAttribute('placeholder', `Enter ${key}`);
            input.classList.add('form-input', 'w-full', 'p-2', 'border', 'border-gray-300', 'rounded');
          } else if (data[key] === 'number') {
            input = document.createElement('input');
            input.setAttribute('type', 'number');
            input.setAttribute('name', key);
            input.setAttribute('placeholder', `Enter ${key}`);
            input.classList.add('form-input', 'w-full', 'p-2', 'border', 'border-gray-300', 'rounded');
          } else if (data[key] === 'boolean') {
            input = document.createElement('input');
            input.setAttribute('type', 'checkbox');
            input.setAttribute('name', key);
            input.classList.add('form-checkbox', 'h-4', 'w-4');
          }

          if (input) {
            formGroup.appendChild(input);
          }

          formContainer.appendChild(formGroup);
        }
      }

      formModalContent.appendChild(formContainer);

      const submitFormButton = document.createElement('button');
      submitFormButton.className = 'bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 mt-4';
      submitFormButton.textContent = 'Add Product';

      submitFormButton.addEventListener('click', function (event) {
        event.preventDefault();
        
        
      });

      formModalContent.appendChild(submitFormButton);

      formModal.appendChild(formModalContent);
      document.body.appendChild(formModal);

      formContainer.scrollIntoView({ behavior: 'smooth' });
    });

    modalContent.appendChild(modalTitle);
    modalContent.appendChild(categorySelect);
    modalContent.appendChild(submitButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
});
})

function createFormGroup(labelText, inputType, placeholderText) {
  const group = document.createElement('div');
  group.className = 'mb-4';

  const label = document.createElement('label');
  label.textContent = labelText;
  label.className = 'block font-semibold text-gray-700 mb-2';
  group.appendChild(label);

  if (inputType === 'textarea') {
    const textarea = document.createElement('textarea');
    textarea.className = 'w-full p-2 border border-gray-300 rounded';
    textarea.placeholder = placeholderText;
    group.appendChild(textarea);
  } else {
    const input = document.createElement('input');
    input.type = inputType;
    input.placeholder = placeholderText;
    input.className = 'w-full p-2 border border-gray-300 rounded';
    group.appendChild(input);
  }

  return group;
}

