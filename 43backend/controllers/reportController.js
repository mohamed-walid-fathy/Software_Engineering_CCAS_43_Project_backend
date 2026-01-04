import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Generate a new report for a charity
 */
export const generateReport = async (req, res, next) => {
	try {
		const { charity_id, report_type, period_start, period_end } = req.body;

		if (!charity_id || !report_type || !period_start || !period_end) {
			return errorResponse(res, 'Missing required fields', null, 400);
		}

		const { data, error } = await supabase
			.from('Report')
			.insert({
				Charity_id: charity_id,
				report_type,
				Period_start: period_start,
				Period_end: period_end,
				generated_date: new Date().toISOString()
			})
			.select()
			.single();

		if (error) {
			return errorResponse(res, 'Failed to generate report', error.message, 400);
		}

		return successResponse(res, data, 'Report generated successfully', 201);
	} catch (error) {
		next(error);
	}
};

/**
 * Get all reports for a charity
 */
export const getCharityReports = async (req, res, next) => {
	try {
		const { charity_id } = req.params;

		const { data, error } = await supabase
			.from('Report')
			.select('*')
			.eq('Charity_id', charity_id)
			.order('generated_date', { ascending: false });

		if (error) {
			return errorResponse(res, 'Failed to fetch reports', error.message, 500);
		}

		return successResponse(res, data, 'Reports retrieved successfully', 200);
	} catch (error) {
		next(error);
	}
};

/**
 * Get a single report by ID
 */
export const getReportById = async (req, res, next) => {
	try {
		const { id } = req.params;

		const { data, error } = await supabase
			.from('Report')
			.select('*')
			.eq('Report_id', id)
			.single();

		if (error || !data) {
			return errorResponse(res, 'Report not found', error?.message, 404);
		}

		return successResponse(res, data, 'Report details retrieved successfully', 200);
	} catch (error) {
		next(error);
	}
};
