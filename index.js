
import express from "express";
import { getConnection } from "./db/index.js";
import { connectionResolver, loadAllTenants } from "./loadTenants.js";

await loadAllTenants()

const app = express();

app.use(express.json())

app.use(connectionResolver)

app.use(async(req, res,next)=>{
    req.body.superGraph = getConnection()
    next()
})

app.post('/graphql', async (req, res)=> {
    const {query,variables,superGraph} = req.body
    const graphResponse = await superGraph.query(query,variables)
    res.status(200).send(graphResponse.data());
});

app.listen(3000,()=>console.log('Server Listening at PORT: %s',3000));
