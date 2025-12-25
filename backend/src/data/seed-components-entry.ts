import "reflect-metadata";
import { DbConnection } from "../database/dbConnection";
import { seedAllComponents } from "./seed-components";

async function runSeedComponents() {
  try {
    await DbConnection.createConnection();
    console.log("Database connection established for component seeding.\n");
    await seedAllComponents();
    console.log("\nComponent seeding completed successfully.");
  } catch (error) {
    console.error("Component seeding failed:", error);
    process.exit(1);
  } finally {
    const dataSource = await DbConnection.getConnection();
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log("\nDatabase connection closed.");
    }
  }
}

runSeedComponents();








