const db = require('./db');

function getSemaineISO(dateStr) {
  const date = new Date(dateStr);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    const type = event.queryStringParameters?.type || 'ambassadeurs';
    const table = type === 'responsables' ? 'kudos_responsables' : 'kudos_ambassadeurs';
    const pseudoFilter = event.queryStringParameters?.pseudo;
    
    let sql = `SELECT * FROM ${table}`;
    const args = [];
    
    if (pseudoFilter) {
      sql += ' WHERE pseudo = ?';
      args.push(pseudoFilter);
    }
    
    sql += ' ORDER BY date DESC';
    
    const result = await db.execute(sql, args);
    return { statusCode: 200, body: JSON.stringify(result.rows) };
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      const { id, date, pseudo, kudos, semaine_iso, commentaire, type, _method } = body;
      const table = type === 'responsables' ? 'kudos_responsables' : 'kudos_ambassadeurs';

      if (_method === 'PUT' && id) {
        const semaine = semaine_iso || getSemaineISO(date);
        await db.execute(
          `UPDATE ${table} SET date = ?, kudos = ?, semaine_iso = ?, commentaire = ? WHERE id = ?`,
          [date, kudos, semaine, commentaire || null, id]
        );
        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
      }

      if (_method === 'DELETE' && id) {
        await db.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
      }

      const semaine = getSemaineISO(date);
      await db.execute(
        `INSERT INTO ${table} (date, pseudo, kudos, semaine_iso, commentaire) VALUES (?, ?, ?, ?, ?)`,
        [date, pseudo, kudos, semaine, commentaire || null]
      );
      
      return { statusCode: 201, body: JSON.stringify({ ok: true }) };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};