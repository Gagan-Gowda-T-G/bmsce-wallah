export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "bmsce_wallah"); // we create this below
  formData.append("folder", "bmsce-wallah");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url; // this is the download URL
};