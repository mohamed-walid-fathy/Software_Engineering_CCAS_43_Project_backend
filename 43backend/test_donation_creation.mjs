import { supabase } from './config/supabase.js';

// Test donation creation
async function testDonationCreation() {
	console.log('Testing donation creation...\n');

	// Test data
	const testDonation = {
		campaign_id: 1, // Use an existing campaign ID
		donor_id: 1,
		amount: 50.00,
		is_anonymous: false,
		transaction_status: 'pending',
		payment_method: 'card'
	};

	console.log('Attempting to insert:', JSON.stringify(testDonation, null, 2));

	const { data, error } = await supabase
		.from('Donation')
		.insert(testDonation)
		.select()
		.single();

	if (error) {
		console.error('\n❌ Error creating donation:');
		console.error('Message:', error.message);
		console.error('Code:', error.code);
		console.error('Details:', error.details);
		console.error('Hint:', error.hint);
		console.error('Full error:', JSON.stringify(error, null, 2));
	} else {
		console.log('\n✅ Donation created successfully:');
		console.log(JSON.stringify(data, null, 2));
	}

	// Check Donation table structure
	console.log('\n\nChecking Donation table structure...');
	const { data: donations, error: fetchError } = await supabase
		.from('Donation')
		.select('*')
		.limit(1);

	if (fetchError) {
		console.error('Error fetching donations:', fetchError.message);
	} else if (donations && donations.length > 0) {
		console.log('Donation table columns:', Object.keys(donations[0]));
	} else {
		console.log('No donations found in table');
	}
}

testDonationCreation();
