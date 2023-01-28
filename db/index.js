import PgPool from "pg-pool"
import dotenv from "dotenv";
import { getNamespace } from "continuation-local-storage";
dotenv.config({path:".env"})

const {DB_HOST,DB_PORT,DB_USER,DB_PASSWORD,DB_NAME} =process.env


export const catalogueDB = new PgPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
})


export const getConnection = () => {
    try {
      const nameSpace = getNamespace("graph");
      const superGraph = nameSpace.get("superGraph");
  
      if (!superGraph) {
        console.log("Connection is not set for any tenant database.");
        return;
      }
  
      return superGraph;
    } catch (err) {
      console.log(err);
    }
  };
