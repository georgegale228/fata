const db = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const [
      participantsCount,
      kudosAmbassadeurs,
      kudosResponsables,
      actifsResult,
      topAmbasseurs,
      lastAttributions
    ] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM participants', []),
      db.execute('SELECT COALESCE(SUM(kudos), 0) as total FROM kudos_ambassadeurs', []),
      db.execute('SELECT COALESCE(SUM(kudos), 0) as total FROM kudos_responsables', []),
      db.execute(`SELECT COUNT(DISTINCT pseudo) as count FROM kudos_ambassadeurs WHERE date >= '${dateStr}'`),
      db.execute(
        `SELECT pseudo, SUM(kudos) as kudos_total 
         FROM kudos_ambassadeurs 
         GROUP BY pseudo 
         ORDER BY kudos_total DESC 
         LIMIT 5`
      ),
      db.execute(
        `SELECT 'ambassadeur' as type, date, pseudo, kudos, commentaire FROM kudos_ambassadeurs 
         UNION ALL
         SELECT 'responsable' as type, date, pseudo, kudos, commentaire FROM kudos_responsables 
         ORDER BY date DESC, type DESC, pseudo DESC 
         LIMIT 10`
      )
    ]);

    const badges = ['#1', '#2', '#3', '#4', '#5'];
    const topWithBadge = topAmbasseurs.rows.map((row, idx) => ({
      ...row,
      badge: badges[idx] || ''
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        nb_participants: participantsCount.rows[0]?.count || 0,
        total_kudos_ambassadeurs: parseInt(kudosAmbassadeurs.rows[0]?.total) || 0,
        total_kudos_responsables: parseInt(kudosResponsables.rows[0]?.total) || 0,
        ambassadeurs_actifs: actifsResult.rows[0]?.count || 0,
        top_ambassadeurs: topWithBadge,
        dernieres_attributions: lastAttributions.rows
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};