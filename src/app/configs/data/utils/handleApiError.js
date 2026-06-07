import { toast } from 'react-toastify';

/**
 * Handles NestJS API errors from axios and shows toast notifications.
 *
 * NestJS error shapes covered:
 *  1. { message: string[], statusCode, error }  → ValidationPipe / class-validator
 *  2. { message: string,   statusCode, error }  → HttpException
 *  3. { error: { message: string } }            → nested error object
 *  4. { error: string }                         → bare error field
 *  5. HTTP status code known messages           → 400/401/403/404/409/422/500/503
 *  6. No response at all                        → network / CORS / timeout
 */
export function handleApiError(error, fallback = 'Something went wrong. Please try again.') {
	if (!error?.response) {
		toast.error(error?.message || 'Network error. Please check your connection and try again.');
		return;
	}

	const { data, status } = error.response;

	if (data) {
		if (Array.isArray(data?.message) && data.message.length > 0) {
			data.message.forEach((m) => toast.error(typeof m === 'string' ? m : JSON.stringify(m)));
			return;
		}

		if (typeof data?.message === 'string' && data.message.trim()) {
			toast.error(data.message);
			return;
		}

		if (data?.error?.message) {
			toast.error(data.error.message);
			return;
		}

		if (typeof data?.error === 'string' && data.error.trim()) {
			toast.error(data.error);
			return;
		}

		const statusMessages = {
			400: 'Bad request. Please check your input.',
			401: 'Unauthorized. Please log in again.',
			403: 'Forbidden. You do not have permission.',
			404: 'Resource not found.',
			409: 'Conflict. The resource already exists.',
			422: 'Unprocessable entity. Invalid data provided.',
			500: 'Server error. Please try again later.',
			503: 'Service unavailable. Please try again later.'
		};

		toast.error(statusMessages[status] || `Error ${status}: ${fallback}`);
		return;
	}

	toast.error(error?.message || fallback);
}
