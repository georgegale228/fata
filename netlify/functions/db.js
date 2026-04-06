const TURSO_URL = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;

async function execute(sql, args = []) {
  const url = TURSO_URL.includes('/v1/') ? TURSO_URL : `${TURSO_URL}/v1/execute`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      args: args.length > 0 ? args : undefined,
      stmt: { sql }
    })
  });
  
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || data.error);
  
  return {
    rows: data.result?.rows?.map(row => {
      const obj = {};
      data.result.cols.forEach((col, i) => {
        obj[col.name] = row[i]?.value ?? row[i];
      });
      return obj;
    }) || [],
    rowsAffected: data.result?.affected_row_count || 0
  };
}

module.exports = { execute };