import axios from "axios";

const API_KEY = "699c6fb5dc80bf81c0f7251767598e13";

export const uploadImage = async (
  imageFile
) => {

  const formData = new FormData();

  formData.append(
    "image",
    imageFile
  );

  const response = await axios.post(
    `https://api.imgbb.com/1/upload?key=${API_KEY}`,
    formData
  );

  return response.data.data.url;
};