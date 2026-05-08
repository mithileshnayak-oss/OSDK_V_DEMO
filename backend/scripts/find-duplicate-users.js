/**
 * One-off: list VanyarUser objects grouped by email, highlight duplicates.
 * Usage: node scripts/find-duplicate-users.js
 * Delete the extras manually in Ontology Manager.
 */
import 'dotenv/config';
import { listObjects } from '../foundry.js';

const PAGE_SIZE = 100;

async function main() {
  const result = await listObjects('VanyarUser', { pageSize: PAGE_SIZE });
  const users = result?.data ?? [];
  console.log(`Fetched ${users.length} VanyarUser objects.\n`);

  const byEmail = new Map();
  for (const u of users) {
    const { __primaryKey, __apiName, __rid, __title, ...props } =
      u.__primaryKey !== undefined ? u : { __primaryKey: u.primaryKey, ...(u.properties ?? {}) };
    const email = (props.email ?? '').toLowerCase();
    const userId = __primaryKey;
    if (!email) continue;
    if (!byEmail.has(email)) byEmail.set(email, []);
    byEmail.get(email).push({ userId, name: props.name, role: props.role });
  }

  const dupes = [...byEmail.entries()].filter(([, list]) => list.length > 1);
  if (dupes.length === 0) {
    console.log('No duplicate emails found.');
    return;
  }

  console.log(`Found ${dupes.length} email(s) with duplicates:\n`);
  for (const [email, list] of dupes) {
    console.log(`  ${email}  (${list.length} entries)`);
    for (const u of list) {
      console.log(`    - userId=${u.userId}  name=${u.name}  role=${u.role}`);
    }
    console.log('');
  }
  console.log('Open Ontology Manager → VanyarUser → delete all but one per email.');
  console.log('Prefer keeping the userId that has submissions/progress attached.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
