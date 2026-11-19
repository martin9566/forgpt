export async function apiRequest(path, options, { allowUnauthorized = false } = {}) {
  let response;

  try {
    response = await fetch(path, options);
  } catch {
    throw new Error(
      "The API server could not be reached. Start it with `npm run server` and check your database connection.",
    );
  }

  if (response.status === 204) {
    return { response, data: null };
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      "The API returned a webpage instead of data. Make sure the API server is running with a valid DATABASE_URL, then restart the frontend.",
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The API returned an invalid response. Please try again.");
  }

  if (!response.ok && !(allowUnauthorized && response.status === 401)) {
    throw new Error(data.error || "The request could not be completed.");
  }

  return { response, data };
}
