import graphjin from 'graphjin';
import graphConfig from './graphJin.json' assert { type: 'json' };
import dotenv from 'dotenv';
import PgPool from 'pg-pool';
import { catalogueDB } from './db/index.js';
import { createNamespace } from 'continuation-local-storage';
dotenv.config({ path: '.env' });

let nameSpace = createNamespace('graph');

export const connectionResolver = (req, res, next) => {
	try {
		const slug = req.headers['slug'];
		if (!slug)
			return res
				.status(403)
				.send({ message: 'Please check your Connection Slug !' });

		const superGraph = graphContext[slug];

		if (!superGraph)
			return res.status(406).send({ message: 'Invalid Tenant !' });

		nameSpace.run(() => {
			if (superGraph) {
				nameSpace.set('superGraph', superGraph);
				next();
			} else {
				return res
					.status(401)
					.send({ type: 'warning', message: 'Tenant data does NOT exists' });
			}
		});
	} catch (error) {
		console.error(error);
		return res.status(500).send({ error: error.message });
	}
};

/**
 *   Initialize  and Build Graphjin Resolver for each tenant:
 *  @param {Object} db - catalog database instance
 *  @param {Object} Pgpool - postgres connection pool instance
 */
export const loadAllTenants = () => {
	return new Promise(async (resolve, reject) => {
		try {
			let { rows: tenants } = await catalogueDB.query('select * from tenants');

			if(!tenants.length) return reject('No tenants');

			global.graphContext = {};
			for (const tenant of tenants) {
				const { slug, db_name, db_host, db_username, db_password, db_port } =
					tenant;
				const tenant_db = new PgPool({
					host: db_host,
					port: db_port,
					user: db_username,
					password: db_password,
					database: db_name,
				});

				console.log('GraphJin Ready for Database : %s', db_name);
				const instance = await graphjin(
					'./config',
					graphConfig[process.env.NODE_ENV],
					tenant_db,
				);
				
				graphContext[slug] = instance;
			}

			console.log('Total Tenants :',tenants.length)

			resolve();
		} catch (error) {
			console.log('Error: ', error);
			reject(error);
		}
	});
};
