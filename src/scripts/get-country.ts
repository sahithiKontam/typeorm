import { AppDataSource } from "../dataSource";
import { Country } from "../entity/Country";


async function run() {
  await AppDataSource.initialize();

  const countryRepo = AppDataSource.getRepository(Country);

  const india = await countryRepo.findOne({
    where: { code: "IND" },
    relations: ["populations"],

  });

  console.log(india);
  process.exit(0);
}


run();
