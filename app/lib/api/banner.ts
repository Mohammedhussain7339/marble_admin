// lib/api.ts
export const API_URL = "https://wwml7ozk70.execute-api.ap-south-1.amazonaws.com/dev/posters";

export const callApi = async (body: any) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return res.json();
};