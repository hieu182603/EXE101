import "reflect-metadata";
import { DbConnection } from "../database/dbConnection";
import { seedAllProducts } from "./seed-products";

async function runSeedProducts() {
  try {
    await DbConnection.createConnection();
    console.log("Database connection established for product seeding.\n");
    await seedAllProducts();
    console.log("\nProduct seeding completed successfully.");
  } catch (error) {
    console.error("Product seeding failed:", error);
    process.exit(1);
  } finally {
    const dataSource = await DbConnection.getConnection();
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log("\nDatabase connection closed.");
    }
  }
}

runSeedProducts();











