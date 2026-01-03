import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
	const tables = [
		'donor', 'Charity', 'Campaign', 'Donation',
		'admin', 'admins', 'admin_actions', 'flagged_campaigns',
		'charities', 'campaigns', 'donations'
	];

	console.log('--- Table Audit ---');
	for (const table of tables) {
		try {
			const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
			if (error) {
				console.log(`${table}: Error - ${error.message} (Code: ${error.code})`);
			} else {
				console.log(`${table}: Found - ${count} rows`);

				// Let's try to see one row to see column names
				if (count > 0) {
					const { data, error: rowError } = await supabase.from(table).select('*').limit(1).single();
					if (!rowError) {
						console.log(`  Columns: ${Object.keys(data).join(', ')}`);
					}
				}
			}
		} catch (e) {
			console.log(`${table}: Exception - ${e.message}`);
		}
	}
}

check();
