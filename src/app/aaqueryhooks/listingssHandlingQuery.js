import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import {
	approvePropertyListing,
	disApprovePropertyListingEndpoint,
	getAllPropertyListings,
	getSinglePropertyListing
} from './routestoserver';
import { handleApiError } from 'app/configs/data/utils/handleApiError';

export default function useGetAllListings() {
	return useQuery(['__getAllProperties'], getAllPropertyListings);
}

/** *Get Listing By Its ID */
export function useGetSingleListing(params) {
	return useQuery(['__listById', params], () => getSinglePropertyListing(params), {
		enabled: Boolean(params),
		staleTime: 5000
	});
}

/** *Approve Listing */
export function useApproveAProperty() {
	const queryClient = useQueryClient();
	return useMutation(approvePropertyListing, {
		onSuccess: (data) => {
			if (data?.data?.approvedListing) {
				toast.success('Listing Approved');
				queryClient.invalidateQueries('__listById');
				queryClient.refetchQueries();
			} else if (data?.data?.error) {
				toast.error(data?.data?.error?.message || 'An error occurred');
			} else {
				toast.info('something unexpected happened');
			}
		},
		onError: (error) => {
			handleApiError(error);
		}
	});
}

/** *Dis-Approve Listing */
export function useDisApproveAProperty() {
	const queryClient = useQueryClient();
	return useMutation(disApprovePropertyListingEndpoint, {
		onSuccess: (data) => {
			if (data?.data?.approvedListing) {
				toast.success('Listing Dis-Approved');
				queryClient.invalidateQueries('__listById');
				queryClient.refetchQueries();
			} else if (data?.data?.error) {
				toast.error(data?.data?.error?.message || 'An error occurred');
			} else {
				toast.info('something unexpected happened');
			}
		},
		onError: (error) => {
			handleApiError(error);
		}
	});
}
