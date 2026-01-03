import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
	const variations = [
		'*, Charity(*)',
		'*, Charity!charity_id(*)',
		'*, Charity:charity_id(*)',
		'*, Charity:Charity_id(*)'
	];

	for (const v of variations) {
		console.log(`\nTesting variation: ${v}`);
		try {
			const { data, error } = await supabase
				.from('Campaign')
				.select(v)
				.limit(1);

			if (error) {
				console.error(`Variation ${v} failed:`, error.message);
			} else {
				console.log(`Variation ${v} succeeded!`);
				if (data && data.length > 0) {
					console.log('Keys in result:', Object.keys(data[0]));
				} else {
					console.log('No data returned.');
				}
			}
		} catch (e) {
			console.error(`Variation ${v} threw exception:`, e.message);
		}
	}
}

testQuery();
