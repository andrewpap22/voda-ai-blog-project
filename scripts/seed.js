const fetch = require("node-fetch");

const API_URL = "http://localhost:3000/api/posts/fetchAndStore";

async function seedDb() {
  // Make a GET request to the tRPC server
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Throw an error if the request failed
  if (!response.ok) {
    // console.log(response);

    throw new Error(
      `Failed to seed database: ${response.status} ${response.statusText}`
    );
  }

  // Otherwise, print the response
  const data = await response.json();
  console.log("Database seeded successfully:", data);
}

seedDb()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
