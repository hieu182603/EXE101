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
      await this.appDataSource.initialize().catch((error) => {
        console.log(error);
      });
      await this.appDataSource.query("SET timezone = '+07:00'");
      return this.appDataSource;
    } catch (err) {
      console.log(err);
    }
    return null;
  }
}
