import graphjin from "graphjin";
import graphConfig from "./graphJin.json" assert {type: "json"};


/**
 *   Initialize  and Build Graphjin Resolver for each tenant:
 *  @param {Object} db - catalog database instance
 *  @param {Object} Pgpool - postgres connection pool instance
 */
export const loadAllTenants =  (db,PgPool)=>{

return new Promise(async (resolve,reject)=>{
    try {
        let {rows:tenants} = await db.query('select * from tenants')
        global.graphContext = {} 
        for (const tenant of tenants) {
        const {slug,db_name,db_host,db_username,db_password,db_port}= tenant
        const tenant_db = new PgPool({
            host: db_host,
            port: db_port,
            user: db_username,
            password: db_password,
            database: db_name
        })
        const instance =await graphjin("./config",graphConfig[process.env.NODE_ENV], tenant_db);
        console.log(instance)
        graphContext[slug] = instance
        } 
        console.log("Total Tenants: ",tenants.length)
        resolve()
    } catch (error) {
        console.log("Error: ",error)
        reject(error)
        
    }
})
}