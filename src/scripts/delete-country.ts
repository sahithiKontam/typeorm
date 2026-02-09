import { AppDataSource } from "../dataSource";
import { Country } from "../entity/Country";

async function run() {
  await AppDataSource.initialize();

  const countryRepo = AppDataSource.getRepository(Country);

  await countryRepo.delete({ code: "IND" });

  console.log("Country delete attempted");
  process.exit(0);
}
run();
