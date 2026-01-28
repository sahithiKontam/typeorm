const axios = require("axios");
const pool = require("./db");

// World Bank API
const BASE_URL =
  "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL";

const PER_PAGE = 100;
const MAX_PAGES = 173; 
// sleep helper (rate-limit safe)
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function fetchAndSave() {
  for (let page = 1; page <= MAX_PAGES; page++) {
    console.log(`Fetching page ${page}...`);

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          format: "json",
          per_page: PER_PAGE,
          page: page,
        },
        timeout: 10000,
      });

      // World Bank response format: [metadata, data[]]
      const records = response.data[1];

      if (!records || records.length === 0) {
        console.log("No more records found");
        break;
      }

      // insert page records
      for (const record of records) {
        const countryCode = record.countryiso3code;
        const countryName = record.country?.value;
        const year = parseInt(record.date);
        const population = record.value;

        if (!countryCode || !year) continue;

        await pool.query(
          `
          INSERT INTO world_bank_population
          (country_code, country_name, year, population)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (country_code, year)
          DO UPDATE SET population = EXCLUDED.population
          `,
          [countryCode, countryName, year, population]
        );
      }

      console.log(`Page ${page} saved successfully`);

      // small delay to avoid API issues
      await sleep(500);

    } catch (error) {
      console.error(`Error on page ${page}. Skipping this page.`);
      await sleep(2000); // wait before next page
      continue;
    }
  }

  console.log("DATA FETCH & SAVE COMPLETED");
  process.exit(0);
}

// run job
fetchAndSave().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
