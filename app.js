const express = require("express");
const sql = require("mssql");
const app = express();
const port = 3000;

// Middleware to parse incoming JSON requests (needed to get the query from the front-end)
app.use(express.json()); 

// Configuration for your database
const config = {
  user: "sa",
  password: "1234567890",
  server: "localhost",
  database: "QLGV",
  options: {
    trustServerCertificate: true,
  },
};

// --- NEW API Route to Execute Custom Query ---
app.post("/api/execute-query", async (req, res) => {
  // Get the query string sent from the front-end
  const sqlQuery = req.body.sqlQuery; 

  // Basic validation (you should do much more!)
  if (!sqlQuery) {
      return res.status(400).json({ error: "No SQL query provided." });
  }

  // !!! DANGER: Running raw user input as SQL !!!
  console.log("Executing query:", sqlQuery);

  try {
    const pool = await sql.connect(config);
    
    // Execute the user's query
    const result = await pool.request().query(sqlQuery);

    // Send only the recordset back
    res.json(result.recordset);

  } catch (err) {
    console.error("Database error:", err);
    // Send a 500 status with the database error message
    res.status(500).json({ 
        error: "Failed to execute query.",
        detail: err.message // Send error message back to the client for debugging
    });
  } finally {
    sql.close();
  }
});

// --- Serve Static HTML File ---
app.use(express.static(__dirname));

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});