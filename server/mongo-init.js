db.createUser({
  user: process.env.MONGO_INITDB_USERNAME,
  pwd: process.env.MONGO_INITDB_PASSWORD,
  roles: [{ role: "root", db: "admin" }]
});

rs.initiate();