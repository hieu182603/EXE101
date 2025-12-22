import { seedAllData } from "../data/seed-data-script";
import { DbConnection } from "./database/dbConnection";

async function main() {
  try {
    console.log("🔌 Connecting to database...");
    const dataSource = await DbConnection.createConnection();
    
    if (!dataSource) {
      throw new Error("Failed to connect to database");
    }
    
    console.log("✅ Database connected successfully\n");
    
    // Seed data
    await seedAllData();
    
    console.log("\n✅ Seeding completed successfully!");
    
    // Close connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log("🔌 Database connection closed");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();






