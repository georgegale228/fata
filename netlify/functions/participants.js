const db = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    const result = await db.execute(
      `SELECT p.*, 
        COALESCE(SUM(ka.kudos), 0) as kudos_total 
        FROM participants p 
        LEFT JOIN kudos_ambassadeurs ka ON p.pseudo = ka.pseudo 
        GROUP BY p.id 
        ORDER BY p.nom, p.prenoms`,
      []
    );
    return { statusCode: 200, body: JSON.stringify(result.rows) };
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      const { id, nom, prenoms, sexe, pseudo, email, ecole, _method } = body;

      if (_method === 'PUT' && id) {
        await db.execute(
          `UPDATE participants SET nom = ?, prenoms = ?, sexe = ?, email = ?, ecole = ? WHERE id = ?`,
          [nom, prenoms, sexe || null, email || null, ecole || null, id]
        );
        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
      }

      await db.execute(
        `INSERT INTO participants (nom, prenoms, sexe, pseudo, email, ecole) VALUES (?, ?, ?, ?, ?, ?)`,
        [nom, prenoms, sexe || null, pseudo, email || null, ecole || null]
      );
      
      return { statusCode: 201, body: JSON.stringify({ ok: true }) };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  if (event.httpMethod === 'DELETE') {
    const pathParts = event.path.split('/');
    const id = pathParts[pathParts.length - 1];
    
    try {
      await db.execute('DELETE FROM participants WHERE id = ?', [id]);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};