import { pool } from "../db/db.js";

/**
 * GET /api/clients
 * Returns all clients (coach view).
 */
export async function getAllClients(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name FROM clients ORDER BY id ASC;"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

/**
 * GET /api/clients/:clientId
 * Returns one client by id.
 */
export async function getClientById(req, res) {
  try {
    const { clientId } = req.params;

    const result = await pool.query(
      "SELECT id, name FROM clients WHERE id = $1;",
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Client not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
