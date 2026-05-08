/**
 * Foundry Ontology REST API v2 client.
 * Handles confidential client OAuth (client_credentials grant) with
 * automatic token caching and refresh.
 */

const FOUNDRY_URL = process.env.FOUNDRY_URL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const ONTOLOGY_RID = process.env.ONTOLOGY_RID;

let _token = null;
let _tokenExpiry = 0;

async function getToken() {
  if (_token && Date.now() < _tokenExpiry - 60_000) return _token;

  const resp = await fetch(`${FOUNDRY_URL}/multipass/api/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      // Must match operations enabled in Developer Console → OAuth & scopes → Scope & access
      scope: 'api:use-ontologies-read api:use-ontologies-write api:use-mediasets-read api:use-mediasets-write',
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Foundry OAuth failed (${resp.status}): ${text}`);
  }

  const data = await resp.json();
  _token = data.access_token;
  _tokenExpiry = Date.now() + data.expires_in * 1000;
  console.log('[foundry] token refreshed, expires in', data.expires_in, 's');
  return _token;
}

async function authHeaders() {
  return { Authorization: `Bearer ${await getToken()}`, Accept: 'application/json' };
}

/**
 * GET /api/v2/ontologies/{rid}/objects/{objectType}
 * Supports $pageSize, $pageToken, $orderBy
 */
export async function listObjects(objectType, { pageSize = 50, orderBy, where } = {}) {
  const url = new URL(
    `${FOUNDRY_URL}/api/v2/ontologies/${ONTOLOGY_RID}/objects/${objectType}`
  );
  if (pageSize) url.searchParams.set('$pageSize', pageSize);
  if (orderBy) url.searchParams.set('$orderBy', orderBy);

  const resp = await fetch(url, { headers: await authHeaders() });
  if (!resp.ok) throw new Error(`listObjects(${objectType}) → ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

/**
 * GET /api/v2/ontologies/{rid}/objects/{objectType}/{primaryKey}
 */
export async function getObject(objectType, primaryKey) {
  const resp = await fetch(
    `${FOUNDRY_URL}/api/v2/ontologies/${ONTOLOGY_RID}/objects/${objectType}/${encodeURIComponent(primaryKey)}`,
    { headers: await authHeaders() }
  );
  if (!resp.ok) throw new Error(`getObject(${objectType}, ${primaryKey}) → ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

/**
 * POST /api/v2/ontologies/{rid}/objects/{objectType}/search
 * where: Foundry SearchQuery JSON (see docs)
 * orderBy: array of { field, direction }
 */
export async function searchObjects(objectType, { where, orderBy, pageSize = 50 } = {}) {
  // Foundry v2 expects `where` (not `query`) and `orderBy` as a bare array.
  const body = { pageSize };
  if (where) body.where = where;
  if (orderBy) body.orderBy = { fields: orderBy };

  const resp = await fetch(
    `${FOUNDRY_URL}/api/v2/ontologies/${ONTOLOGY_RID}/objects/${objectType}/search`,
    {
      method: 'POST',
      headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!resp.ok) throw new Error(`searchObjects(${objectType}) → ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

/**
 * POST /api/v2/ontologies/{rid}/objects/{objectType}/aggregate
 * aggregations: array of Foundry AggregationClause
 * groupBy: array of Foundry GroupByClause
 */
export async function aggregateObjects(objectType, { aggregations, groupBy, where } = {}) {
  // Foundry v2 expects singular `aggregation` + `groupBy` (always present)
  const body = {
    aggregation: aggregations || [],
    groupBy: groupBy || [],
  };
  if (where) body.where = where;

  const resp = await fetch(
    `${FOUNDRY_URL}/api/v2/ontologies/${ONTOLOGY_RID}/objects/${objectType}/aggregate`,
    {
      method: 'POST',
      headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!resp.ok) throw new Error(`aggregateObjects(${objectType}) → ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

/**
 * POST /api/v2/ontologies/{rid}/actions/{actionRid}/apply
 * parameters: object matching the action's parameter schema
 */
export async function callAction(actionRid, parameters) {
  const resp = await fetch(
    `${FOUNDRY_URL}/api/v2/ontologies/${ONTOLOGY_RID}/actions/${actionRid}/apply`,
    {
      method: 'POST',
      headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
      body: JSON.stringify({ parameters }),
    }
  );
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`callAction(${actionRid}) → ${resp.status}: ${text}`);
  }
  return resp.json();
}

/**
 * GET linked objects via a link type
 * GET /api/v2/ontologies/{rid}/objects/{objectType}/{pk}/links/{linkType}
 */
export async function getLinkedObjects(objectType, primaryKey, linkType, { pageSize = 50 } = {}) {
  const url = new URL(
    `${FOUNDRY_URL}/api/v2/ontologies/${ONTOLOGY_RID}/objects/${objectType}/${encodeURIComponent(primaryKey)}/links/${linkType}`
  );
  url.searchParams.set('$pageSize', pageSize);

  const resp = await fetch(url, { headers: await authHeaders() });
  if (!resp.ok) throw new Error(`getLinkedObjects(${objectType}/${primaryKey}/${linkType}) → ${resp.status}: ${await resp.text()}`);
  return resp.json();
}
