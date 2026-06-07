import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import {
	createPropertyTypesEndpoint,
	deletePropertyTypesEndpoint,
	getAllPropertyTypesEndpoint,
	getSinglePropertyTypesEndpoint,
	updatePropertyTypesEndpoint
} from './routestoserver';
import { handleApiError } from 'app/configs/data/utils/handleApiError';

export default function useGetAllPropertytypes() {
	return useQuery(['__getAllPropertyTypes'], getAllPropertyTypesEndpoint);
}

/** *Get property type By Its ID */
export function useGetPropertyType(params) {
	return useQuery(['__getAllPropertyTypes', params], () => getSinglePropertyTypesEndpoint(params), {
		enabled: Boolean(params)
	});
}

export function useCreatePropertyType() {
	const navigate = useNavigate();

	return useMutation(createPropertyTypesEndpoint, {
		onSuccess: (data) => {
			if (data?.data?.success && data?.data?.propertytype) {
				toast.success('property type created successfully');
				navigate(`/types/propertytypes`);
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

export function useUpdatePropertyType() {
	const navigate = useNavigate();

	return useMutation(updatePropertyTypesEndpoint, {
		onSuccess: (data) => {
			if (data?.data?.success && data?.data?.propertytype) {
				toast.success('property type updated successfully');
				navigate(`/types/propertytypes`);
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

export function useDeletePropertyType() {
	const navigate = useNavigate();

	return useMutation(deletePropertyTypesEndpoint, {
		onSuccess: (data) => {
			if (data?.data?.success && data?.data?.propertytype) {
				toast.success('property type deleted successfully');
				navigate(`/types/propertytypes`);
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
