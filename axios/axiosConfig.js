const fetchApi = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const uploadImage = async (imageFile) => {
//   const imageData = new FormData();
//   imageData.append("file", imageFile);
//   imageData.append("upload_preset", "home_customization");
//   imageData.append("cloud_name", "dckwbkqjv");

  const response = await fetchApi("https://api.cloudinary.com/v1_1/dckwbkqjv/image/upload", {
    method: "POST",
    body: imageFile
  });
  console.log(response);

  return response.secure_url;
};