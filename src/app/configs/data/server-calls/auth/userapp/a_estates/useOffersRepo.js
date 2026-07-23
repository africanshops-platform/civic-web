import {
	createPropertyOfferApi,
	getMyOffersApi,
	updateOfferBidApi,
	withdrawOfferApi,
	uploadOfferAttachmentApi
} from 'app/configs/data/client/RepositoryAuthClient';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

/**
 * ############################################################
 * @param {Create Property Offer/Bid} Mutation Hook
 * @returns
 * ############################################################
 */
export function useCreatePropertyOffer() {
	const queryClient = useQueryClient();

	return useMutation((formData) => createPropertyOfferApi(formData), {
		onSuccess: (response) => {
			// Invalidate and refetch offers
			queryClient.invalidateQueries('__myOffers');

			if (response?.data?.success) {
				// Additional actions on success can be added here
				toast.success(response?.data?.message || 'Offer submitted successfully!');
			}
		},
		onError: (error) => {
			console.error('Create Property Offer Error:', error);

			// Handle NestJS validation errors (array of messages)
			const errorData = error?.response?.data;

			if (errorData?.message && Array.isArray(errorData.message)) {
				// Display each validation error
				errorData.message.forEach((msg) => {
					toast.error(msg);
				});
			} else if (errorData?.message && typeof errorData.message === 'string') {
				// Single error message
				toast.error(errorData.message);
			} else {
				// Fallback error message
				toast.error(error?.message || 'Failed to submit offer');
			}
		}
	});
}

/**
 * ############################################################
 * @param {View All User Offers with Pagination} Query Hook
 * @returns
 * ############################################################
 */
export function useGetMyOffers(page = 1, limit = 10) {
	return useQuery(['__myOffers', page, limit], () => getMyOffersApi(page, limit), {
		keepPreviousData: true, // Keep showing previous data while fetching new page
		staleTime: 30000, // Consider data fresh for 30 seconds
		onError: (error) => {
			console.error('Get My Offers Error:', error);

			// Handle NestJS validation errors (array of messages)
			const errorData = error?.response?.data;

			if (errorData?.message && Array.isArray(errorData.message)) {
				errorData.message.forEach((msg) => {
					toast.error(msg);
				});
			} else if (errorData?.message && typeof errorData.message === 'string') {
				toast.error(errorData.message);
			} else {
				toast.error(error?.message || 'Failed to fetch offers');
			}
		}
	});
}

/**
 * ############################################################
 * @param {Upgrade/Update Offer Bid} Mutation Hook
 * @returns
 * ############################################################
 */
export function useUpdateOfferBid() {
	const queryClient = useQueryClient();

	return useMutation(({ offerId, formData }) => updateOfferBidApi(offerId, formData), {
		onSuccess: (response) => {
			// Invalidate and refetch offers
			queryClient.invalidateQueries('__myOffers');

			toast.success(response?.data?.message || 'Offer upgraded successfully!');
		},
		onError: (error) => {
			console.error('Update Offer Bid Error:', error);

			// Handle NestJS validation errors (array of messages)
			const errorData = error?.response?.data;

			if (errorData?.message && Array.isArray(errorData.message)) {
				errorData.message.forEach((msg) => {
					toast.error(msg);
				});
			} else if (errorData?.message && typeof errorData.message === 'string') {
				toast.error(errorData.message);
			} else {
				toast.error(error?.message || 'Failed to update offer');
			}
		}
	});
}

/**
 * ############################################################
 * @param {Withdraw Offer} Mutation Hook
 * @returns
 * ############################################################
 */
export function useWithdrawOffer() {
	const queryClient = useQueryClient();

	return useMutation((offerId) => withdrawOfferApi(offerId), {
		onSuccess: (response) => {
			// Invalidate and refetch offers
			queryClient.invalidateQueries('__myOffers');

			toast.success(response?.data?.message || 'Offer withdrawn successfully!');
		},
		onError: (error) => {
			console.error('Withdraw Offer Error:', error);

			// Handle NestJS validation errors (array of messages)
			const errorData = error?.response?.data;

			if (errorData?.message && Array.isArray(errorData.message)) {
				errorData.message.forEach((msg) => {
					toast.error(msg);
				});
			} else if (errorData?.message && typeof errorData.message === 'string') {
				toast.error(errorData.message);
			} else {
				toast.error(error?.message || 'Failed to withdraw offer');
			}
		}
	});
}

/**
 * ############################################################
 * @param {Upload Offer Attachment} Mutation Hook — base64 data URI in,
 * Cloudinary secure_url out. Not tied to a specific offer id since an
 * offer may not exist yet at upload time (create form uploads first).
 * ############################################################
 */
export function useUploadOfferAttachment() {
	return useMutation((base64) => uploadOfferAttachmentApi(base64), {
		onError: (error) => {
			console.error('Upload Offer Attachment Error:', error);
			const errorData = error?.response?.data;
			toast.error(errorData?.message || error?.message || 'Failed to upload attachment');
		}
	});
}
