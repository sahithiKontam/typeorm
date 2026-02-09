import axios from "axios";
import { AppDataSource } from "./dataSource";
import { Country } from "./entity/Country";
import { Population } from "./entity/Population";

const BASE_URL =
  "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL";

const PER_PAGE = 100;
const MAX_PAGES = 173;
const CONCURRENT_REQUESTS = 7;

let totalFetchTime = 0n;
let totalInsertTime = 0n;

console.time("Total Execution Time");
async function fetchPage(page: number): Promise<any[]> {
  const start = process.hrtime.bigint();

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        format: "json",
        per_page: PER_PAGE,
        page,
      },
      timeout: 15000,
      validateStatus: (status) => status < 500, // allow 400
    });

    if (!Array.isArray(response.data)) {
      console.warn(` Page ${page} returned invalid data, skipping`);
      return [];
    }

    const end = process.hrtime.bigint();
    totalFetchTime += end - start;

    return response.data[1] || [];
  } catch (err) {
    console.error(` Page ${page} failed, skipping`);
    return [];
  }
}

async function saveRecords(records: any[]) {
  const countryRepo = AppDataSource.getRepository(Country);
  const popRepo = AppDataSource.getRepository(Population);

  const countryMap = new Map<string, Country>();
  const populations: Population[] = [];

  for (const r of records) {
    if (!r.countryiso3code || !r.date) continue;

    let country = countryMap.get(r.countryiso3code);

    if (!country) {
      country = countryRepo.create({
        code: r.countryiso3code,
        name: r.country?.value,
      });
      countryMap.set(r.countryiso3code, country);
    }

    populations.push(
      popRepo.create({
        country,
        year: Number(r.date),
        population: r.value,
      })
    );
  }

  const insertStart = process.hrtime.bigint();

  await AppDataSource.transaction(async (manager) => {
    await manager.save([...countryMap.values()]);
    await manager.upsert(Population, populations, ["country", "year"]);
  });

  const insertEnd = process.hrtime.bigint();
  totalInsertTime += insertEnd - insertStart;
}

async function main() {
  await AppDataSource.initialize();
  console.log("Database connected");

  for (let i = 1; i <= MAX_PAGES; i += CONCURRENT_REQUESTS) {
    const pages: number[] = [];

    for (let p = i; p < i + CONCURRENT_REQUESTS && p <= MAX_PAGES; p++) {
      pages.push(p);
    }

    console.log(`Fetching pages ${pages.join(", ")}`);

    const fetchStart = process.hrtime.bigint();
    const results = await Promise.all(pages.map(fetchPage));
    const fetchEnd = process.hrtime.bigint();

    totalFetchTime += fetchEnd - fetchStart;

    const allRecords = results.flat();
    await saveRecords(allRecords);

    console.log(`Saved pages ${pages.join(", ")}`);
  }

  console.log(
    `Total Fetch Time: ${(Number(totalFetchTime) / 1e9).toFixed(2)} seconds`
  );
  console.log(
    `Total Insert Time: ${(Number(totalInsertTime) / 1e9).toFixed(2)} seconds`
  );

  console.timeEnd("Total Execution Time");
  console.log("DATA FETCH & SAVE COMPLETED");

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
