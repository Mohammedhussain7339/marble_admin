const IMAGE_UPLOAD_API_URL =
  "https://o2oex3m67g.execute-api.ap-south-1.amazonaws.com/default/marble_img_upload_our";

export type UploadedImage = {
  key: string;
  url: string;
};

export const uploadSingleImage = async (
  file: File,
  folder_name:string,
  description = "Marble Product Image"
): Promise<UploadedImage> => {
  const uuid = `marble_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // 1️⃣ request signed URL
  const uploadRes = await fetch(IMAGE_UPLOAD_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: "anonymous",
      design_uuid_val: uuid,
      description,
      operation: "upload",
      folder_name,
    }),
  });

  if (!uploadRes.ok) throw new Error("Failed to get upload URL");

  const uploadData = await uploadRes.json();

  // 2️⃣ upload to S3
  const putRes = await fetch(uploadData.s3_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!putRes.ok) throw new Error("S3 upload failed");

  // 3️⃣ get download URL
  const downloadRes = await fetch(IMAGE_UPLOAD_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: "anonymous",
      design_uuid_val: uuid,
      description,
      operation: "download",
      folder_name,
    }),
  });

  if (!downloadRes.ok) throw new Error("Failed to get download URL");

  const downloadData = await downloadRes.json();

  return {
    key: downloadData.s3_key,
    url: downloadData.s3_url,
  };
};
