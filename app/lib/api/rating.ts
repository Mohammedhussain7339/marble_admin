const REVIEWS_API_URL =
  "https://6l19cbdw6e.execute-api.ap-south-1.amazonaws.com/default/Marble_reviews";

export type AddReviewPayload = {
  product_id: string;
  rating: number;
  comment: string;
  user_id: string;
};

export async function addReview(payload: AddReviewPayload) {
  const res = await fetch(REVIEWS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_action: "add_review",
      ...payload,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to submit review");
  }

  return res.json();
}

export async function getReviews(product_id: string) {
  const res = await fetch(REVIEWS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_action: "get_review",
      product_id,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to fetch reviews");
  }

  return res.json();
}

export async function getReviewsOrder(payload: {
  product_id: string;
  user_id: string;
}) {
  const res = await fetch(REVIEWS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_action: "get_review",
      product_id: payload.product_id,
      user_id: payload.user_id,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to fetch review");
  }

  return res.json();
}
