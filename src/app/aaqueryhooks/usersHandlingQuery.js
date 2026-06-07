import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import {
	andminActivateNewUserEndpoint,
	andminCreateNewUserEndpoint,
	getAllUsers,
	getSingleUserAndListings
} from './routestoserver';
import { setCreateNewUserAccount } from './utils/opsUtils';
import { handleApiError } from 'app/configs/data/utils/handleApiError';

export default function useGetAllUsers() {
	return useQuery(['__getAllUsers'], getAllUsers);
}

/** *Get USER By  ID */
export function useGetUserDataById(params) {
	return useQuery(['__getAllUsers', params], () => getSingleUserAndListings(params), {
		enabled: Boolean(params)
	});
}

/** *Recruite New User Accounts */
export function useAdminCreateNewUser() {
	const navigate = useNavigate();
	return useMutation(andminCreateNewUserEndpoint, {
		onSuccess: (data) => {
			console.log('User-INVITATION-PAYLOAD', data?.data);

			if (data?.data?.success && data?.data?.activation_token) {
				setCreateNewUserAccount(data?.data?.activation_token);
				navigate('/users/user/authorize/activate');
				toast.success(data?.data?.message);
			} else if (data?.data?.error) {
				console.log('In-BoundError:', data?.data?.error);
			} else {
				toast.info('something unexpected happened');
			}
		},
		onError: (error) => {
			handleApiError(error);
		}
	});
}

/** *Recruite New User Accounts */
export function useActivateNewUserByAdmin() {
	const navigate = useNavigate();
	return useMutation(andminActivateNewUserEndpoint, {
		onSuccess: (data) => {
			if (data?.data?.success && data?.data?.user) {
				setCreateNewUserAccount(data?.data?.activation_token);
				navigate('/users/user');
				toast.success(data?.data?.message);
			} else if (data?.data?.error) {
				toast.error(data?.data?.error?.message || 'An error occurred');
				console.log('In-BoundError:', data?.data?.error);
			} else {
				toast.info('something unexpected happened');
			}
		},
		onError: (error) => {
			console.log('INSIDE ERROR BLOCK', error);
			handleApiError(error);
		}
	});
}
