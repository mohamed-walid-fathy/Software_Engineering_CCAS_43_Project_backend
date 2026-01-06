import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get charity-specific statistics
 */
export const getCharityStats = async (req, res, next) => {
	try {
		const { id } = req.params;

		// 1. Get all campaigns for this charity
		const { data: campaigns } = await supabase
			.from('campaign')
			.select('campaign_id, title, current_amount, target_amount, status')
			.eq('charity_id', id);

		const campaignIds = campaigns?.map(c => c.campaign_id) || [];

		if (campaignIds.length === 0) {
			return successResponse(res, {
				total_raised: 0,
				total_donors: 0,
				active_campaigns: 0,
				donation_trends: []
			}, 'No data found for this charity', 200);
		}

		// 2. Get all donations for these campaigns
		const { data: donations } = await supabase
			.from('donation')
			.select('amount, donor_id, donation_date')
			.in('campaign_id', campaignIds)
			.in('transaction_status', ['completed', 'Done']);

		const totalRaised = donations?.reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0;
		const uniqueDonors = new Set(donations?.map(d => d.donor_id).filter(id => id !== null)).size;

		// 3. Calculate trends (last 6 months)
		const trends = {};
		const now = new Date();
		for (let i = 5; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const monthYear = d.toLocaleString('default', { month: 'short', year: '2-digit' });
			trends[monthYear] = 0;
		}

		donations?.forEach(d => {
			const date = new Date(d.donation_date);
			const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
			if (trends.hasOwnProperty(monthYear)) {
				trends[monthYear] += parseFloat(d.amount);
			}
		});

		const donationTrends = Object.keys(trends).map(month => ({
			month,
			amount: trends[month]
		}));

		return successResponse(res, {
			total_raised: totalRaised,
			total_donors: uniqueDonors,
			active_campaigns: campaigns.filter(c => c.status === 'active').length,
			donation_trends: donationTrends,
			campaign_performance: campaigns.map(c => ({
				title: c.title,
				raised: parseFloat(c.current_amount || 0),
				target: parseFloat(c.target_amount || 0)
			}))
		}, 'Charity statistics retrieved successfully', 200);
	} catch (error) {
		next(error);
	}
};

/**
 * Get monthly report for charity
 */
export const getMonthlyReport = async (req, res, next) => {
	try {
		const { id } = req.params;
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

		// Get campaigns
		const { data: campaigns } = await supabase
			.from('campaign')
			.select('campaign_id')
			.eq('charity_id', id);

		const campaignIds = campaigns?.map(c => c.campaign_id) || [];

		if (campaignIds.length === 0) {
			return successResponse(res, null, 'No campaigns found', 200);
		}

		// Get donations for this month
		const { data: donations } = await supabase
			.from('donation')
			.select('*')
			.in('campaign_id', campaignIds)
			.gte('donation_date', startOfMonth)
			.in('transaction_status', ['completed', 'Done']);

		const summary = {
			month: now.toLocaleString('default', { month: 'long' }),
			year: now.getFullYear(),
			total_donations: donations?.length || 0,
			total_amount: donations?.reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0,
			unique_donors: new Set(donations?.map(d => d.donor_id).filter(id => id !== null)).size
		};

		return successResponse(res, summary, 'Monthly report generated successfully', 200);
	} catch (error) {
		next(error);
	}
};

/**
 * Get custom report for charity (on-the-fly calculation)
 */
export const getCustomReport = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { start, end } = req.query;

		if (!start || !end) {
			return errorResponse(res, 'Missing dates', 'Start and end dates are required', 400);
		}

		// Get campaigns
		const { data: campaigns } = await supabase
			.from('campaign')
			.select('campaign_id, title')
			.eq('charity_id', id);

		const campaignIds = campaigns?.map(c => c.campaign_id) || [];

		if (campaignIds.length === 0) {
			return successResponse(res, {
				total_donations: 0,
				total_amount: 0,
				unique_donors: 0,
				campaign_breakdown: []
			}, 'No data found for this period', 200);
		}

		// Get donations for this period
		const { data: donations } = await supabase
			.from('donation')
			.select('amount, donor_id, campaign_id')
			.in('campaign_id', campaignIds)
			.gte('donation_date', start)
			.lte('donation_date', end)
			.in('transaction_status', ['completed', 'Done']);

		if (!donations || donations.length === 0) {
			return successResponse(res, {
				total_donations: 0,
				total_amount: 0,
				unique_donors: 0,
				campaign_breakdown: campaigns.map(c => ({ title: c.title, amount: 0 }))
			}, 'No donations found for this period', 200);
		}

		const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
		const uniqueDonors = new Set(donations.map(d => d.donor_id).filter(id => id !== null)).size;

		const breakdown = campaigns.map(c => {
			const campaignDonations = donations.filter(d => d.campaign_id === c.campaign_id);
			return {
				title: c.title,
				amount: campaignDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0),
				count: campaignDonations.length
			};
		});

		return successResponse(res, {
			period: { start, end },
			total_donations: donations.length,
			total_amount: totalAmount,
			unique_donors: uniqueDonors,
			campaign_breakdown: breakdown
		}, 'Custom report generated successfully', 200);

	} catch (error) {
		next(error);
	}
};

/**
 * Update charity details and resubmit for verification
 */
export const updateCharityDetails = async (req, res, next) => {
	try {
		const { id } = req.params;
		const updates = req.body;

		// Prevent updating sensitive fields directly if needed, but for now we trust the client to send valid fields
		// We explicitly reset rejection_reason to null and Verified Status to false (pending)
		// to signify a resubmission.

		// Filter out fields that shouldn't be updated directly via this endpoint if necessary
		// For now, we mix in the status reset:
		const payload = {
			...updates,
			rejection_reason: null,
			verified_status: 'pending' // Reset to pending
		};

		// Remove immutable or unwanted fields
		delete payload.charity_id;
		delete payload.phone; // We are using email instead of phone as per request
		delete payload.id;
		delete payload.role;
		delete payload.created_at;
		delete payload.email; // Usually we don't allow email change here without verification

		const { data, error } = await supabase
			.from('charity')
			.update(payload)
			.eq('charity_id', id)
			.select()
			.single();

		if (error) {
			return errorResponse(res, 'Failed to update charity details', error.message, 400);
		}

		return successResponse(res, data, 'Charity details updated and resubmitted for verification', 200);

	} catch (error) {
		next(error);
	}
};
