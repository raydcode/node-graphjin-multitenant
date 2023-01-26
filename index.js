
import express from "express";
import PgPool from "pg-pool"
import { loadAllTenants } from "./loadTenants.js";
import dotenv from "dotenv";

const app = express();


dotenv.config({path:".env"})


const {DB_HOST,DB_PORT,DB_USER,DB_PASSWORD,DB_NAME} =process.env


const catalogueDB = new PgPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
})


await loadAllTenants(catalogueDB,PgPool)

app.use(express.json())

app.use(async(req, resp,next)=>{
    const slug = req.headers['slug']
    if(!slug) return resp.status(403).send({message:"Please check your Connection Slug !"})
    if(!graphContext[slug]) return resp.status(406).send({message:"Invalid Tenant !"})
    req.body.supergraph = graphContext[slug] 
    next()
})

app.post('/graphql', async function(req, resp) {
    const {query,variables,supergraph} = req.body
    const res2 = await supergraph.query(query,variables)
    resp.send(res2.data());
});

app.listen(3000,()=>console.log('Server Listening at PORT: %s',3000));
