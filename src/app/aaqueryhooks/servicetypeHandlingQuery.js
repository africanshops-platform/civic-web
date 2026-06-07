import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import {
	createServiceTypes,
	deleteServiceTypesRoute,
	getAllServiceTypes,
	getSingleServiceType,
	updateServiceTypesRoute
} from './routestoserver';
import { handleApiError } from 'app/configs/data/utils/handleApiError';

export default function useGetAllServicetypes() {
	return useQuery(['__getAllServiceTypes'], getAllServiceTypes);
}

/** *Get Listing By Its ID */
export function useGetSingleServiveType(params) {
	return useQuery(['__getAllServiceTypesById', params], () => getSingleServiceType(params), {
		enabled: Boolean(params)
	});
}

export function useCreateServiceType() {
	const navigate = useNavigate();

	return useMutation(createServiceTypes, {
		onSuccess: (data) => {
			if (data?.data?.success && data?.data?.servicetype) {
				toast.success('service type created successfully');
				navigate(`/packages/servicetypes`);
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

export function useUpdateServiceType() {
	const navigate = useNavigate();

	return useMutation(updateServiceTypesRoute, {
		onSuccess: (data) => {
			if (data?.data?.success && data?.data?.servicetype) {
				toast.success('service type updated successfully');
				navigate(`/packages/servicetypes`);
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

export function useDeleteServiceType() {
	const navigate = useNavigate();

	return useMutation(deleteServiceTypesRoute, {
		onSuccess: (data) => {
			if (data?.data?.success && data?.data?.servicetype) {
				toast.success('service type deleted successfully');
				navigate(`/packages/servicetypes`);
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
