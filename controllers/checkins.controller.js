import { pool } from "../db/db.js";

// helpers 
function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function safeParseJson(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/**
 * GET /api/checkins
 * Optional query: ?clientId=c1
 */
export async function getCheckIns(req, res) {
  try {
    const clientId = String(req.query.clientId || "").trim();

    if (clientId) {
      const result = await pool.query(
        `
        SELECT id, client_id AS "clientId", date, status, coach_notes AS "coachNotes", payload_json
        FROM check_ins
        WHERE client_id = $1
        ORDER BY date DESC;
        `,
        [clientId]
      );

      const rows = result.rows.map((r) => {
        let payload = null;
        try { payload = JSON.parse(r.payload_json); } catch {}

        return payload && typeof payload === "object"
          ? { ...payload, id: r.id, clientId: r.clientId, date: r.date, status: r.status, coachNotes: r.coachNotes }
          : { id: r.id, clientId: r.clientId, date: r.date, status: r.status, coachNotes: r.coachNotes };
      });

      return res.json(rows);
    }

    // inbox list (minimal)
    const result = await pool.query(
      `
      SELECT id, client_id AS "clientId", date, status, coach_notes AS "coachNotes"
      FROM check_ins
      ORDER BY date DESC;
      `
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}


/**
 * GET /api/checkins/:id
 */
export async function getCheckInById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, client_id, date, status, coach_notes, payload_json
       FROM check_ins
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Check-in not found" });
    }

    const r = result.rows[0];
    const payload = safeParseJson(r.payload_json) || {};

    res.json({
      ...payload,
      id: r.id,
      clientId: r.client_id,
      date: r.date,
      status: r.status,
      coachNotes: r.coach_notes || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load check-in" });
  }
}

/**
 * POST /api/checkins
 * Body: the full check-in object from frontend
 */
export async function createCheckIn(req, res) {
  try {
    const payload = req.body || {};

    const id = payload.id || `ci_${Date.now()}`;
    const clientId = payload.clientId;

    if (!clientId) {
      return res.status(400).json({ error: "clientId is required" });
    }

    const date = payload.date || isoToday();
    const status = payload.status || "submitted"; // backend status
    const coachNotes = payload.coachNotes || "";

    // store the whole object to preserve frontend shape
    const storedPayload = {
      ...payload,
      id,
      clientId,
      date,
      status,
      coachNotes,
    };

    await pool.query(
      `INSERT INTO check_ins (id, client_id, date, status, coach_notes, payload_json)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, clientId, date, status, coachNotes, JSON.stringify(storedPayload)]
    );

    res.status(201).json(storedPayload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create check-in" });
  }
}

/**
 * PUT /api/checkins/:id/review
 * Body: { coachNotes: "...", status: "reviewed" } 
 */
export async function reviewCheckIn(req, res) {
  try {
    const { id } = req.params;
    const { coachNotes, status } = req.body || {};

    // load existing
    const existing = await pool.query(
      `SELECT id, client_id, date, status, coach_notes, payload_json
       FROM check_ins
       WHERE id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Check-in not found" });
    }

    const r = existing.rows[0];
    const oldPayload = safeParseJson(r.payload_json) || {};

    const nextStatus = status || "reviewed";
    const nextCoachNotes = coachNotes ?? r.coach_notes ?? "";

    const nextPayload = {
      ...oldPayload,
      id: r.id,
      clientId: r.client_id,
      date: r.date,
      status: nextStatus,
      coachNotes: nextCoachNotes,
    };

    const updated = await pool.query(
      `UPDATE check_ins
       SET status = $2,
           coach_notes = $3,
           payload_json = $4
       WHERE id = $1
       RETURNING id, client_id, date, status, coach_notes, payload_json`,
      [id, nextStatus, nextCoachNotes, JSON.stringify(nextPayload)]
    );

    const u = updated.rows[0];
    res.json({
      ...nextPayload,
      id: u.id,
      clientId: u.client_id,
      date: u.date,
      status: u.status,
      coachNotes: u.coach_notes || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to review check-in" });
  }
}
