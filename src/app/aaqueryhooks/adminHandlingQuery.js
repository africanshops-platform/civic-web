import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import {
	adminUserInviteAcceptanceEndpoint,
	getAllAdminsRoutes,
	getSingleAdminUser,
	recruitAdminUserEndpoint
} from './routestoserver';
import { handleApiError } from 'app/configs/data/utils/handleApiError';

export default function useGetAllAdminUsers() {
	return useQuery(['__getAllAdmin'], getAllAdminsRoutes);
}

/** *Get Admin By Its ID */
export function useGetAdminById(params) {
	return useQuery(['__getAllAdmin', params], () => getSingleAdminUser(params), {
		enabled: Boolean(params) || Boolean(params !== 'new')
	});
}

/** *Recruite New Admins */
export function useAdminRecruitStaff() {
	const navigate = useNavigate();
	return useMutation(recruitAdminUserEndpoint, {
		onSuccess: (data) => {
			console.log('ADMIN-INVITATION-PAYLOAD', data?.data);

			if (data?.data?.success && data?.data?.activation_token) {
				toast.success('Admin Invite Sent, Acceptance Pending');
				navigate('/users/admin');
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

/** *Admin Accept Invites */
export function useAdminInvitationAcceptance() {
	const navigate = useNavigate();
	return useMutation(adminUserInviteAcceptanceEndpoint, {
		onSuccess: (data) => {
			console.log('ADMIN-ACCEPT-INVITATION-PAYLOAD', data?.data);

			if (data?.data?.success && data?.data?.adminuser) {
				toast.success('Invitation Accepted, Welcome Onboard, Please Log in.');
				navigate('/sign-in');
			} else if (data?.data?.error) {
				toast.error(data?.data?.error?.message || 'An error occurred');
				console.log('In-BoundError:', data?.data?.error);
			}
		},
		onError: (error) => {
			console.log('In-BoundError222:', error);
			handleApiError(error);
		}
	});
}
