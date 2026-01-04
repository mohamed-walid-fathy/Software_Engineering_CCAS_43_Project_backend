import { supabase } from './config/supabase.js';

// Test script to check if rejection_reason column exists and test the update
async function testRejectionColumns() {
	console.log('Testing rejection_reason columns...\n');

	// Test 1: Check Charity table structure
	console.log('1. Testing Charity table:');
	try {
		const { data: charities, error } = await supabase
			.from('Charity')
			.select('*')
			.limit(1);

		if (error) {
			console.error('Error fetching Charity:', error.message);
		} else if (charities && charities.length > 0) {
			console.log('Charity columns:', Object.keys(charities[0]));
			console.log('Has rejection_reason?', 'rejection_reason' in charities[0]);
		} else {
			console.log('No charities found in database');
		}
	} catch (e) {
		console.error('Exception:', e.message);
	}

	console.log('\n2. Testing Campaign table:');
	try {
		const { data: campaigns, error } = await supabase
			.from('Campaign')
			.select('*')
			.limit(1);

		if (error) {
			console.error('Error fetching Campaign:', error.message);
		} else if (campaigns && campaigns.length > 0) {
			console.log('Campaign columns:', Object.keys(campaigns[0]));
			console.log('Has rejection_reason?', 'rejection_reason' in campaigns[0]);
		} else {
			console.log('No campaigns found in database');
		}
	} catch (e) {
		console.error('Exception:', e.message);
	}

	console.log('\n3. Testing update with rejection_reason:');
	try {
		// Try to update a test record (this will fail if column doesn't exist)
		const { error } = await supabase
			.from('Charity')
			.update({ rejection_reason: 'test' })
			.eq('Charity_id', 'nonexistent-id'); // Use fake ID so we don't actually update anything

		if (error) {
			console.error('Update test error:', error.message);
			console.error('Error code:', error.code);
			console.error('Error details:', error.details);
		} else {
			console.log('Update test passed (column exists)');
		}
	} catch (e) {
		console.error('Exception:', e.message);
	}
}

testRejectionColumns();
