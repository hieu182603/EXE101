import { DataSource } from "typeorm";
import config from "./ormconfig";

export class DbConnection {
  static appDataSource: DataSource;

  public static async getConnection() {
    if (this.appDataSource) return this.appDataSource;
    return null;
  }

  public static async createConnection() {
    try {
      this.appDataSource = new DataSource(config);
      // Initialize and throw on failure so caller can handle it (fail-fast)
      await this.appDataSource.initialize();
      await this.appDataSource.query("SET timezone = '+07:00'");
      console.log("✅ Database connection established successfully.");
      return this.appDataSource;
    } catch (err) {
      console.error("❌ Failed to create database connection:", err);
      throw err;
    }
  }
}
