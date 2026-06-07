import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
	adminSignIn,
	resetshopPasswordWithcode,
	shopForgotPasswordInit
} from '../client/clientToApiRoutes';
import {
	remove_SHOP_FORGOTPASS_TOKEN,
	setAuthCredentials,
	setAuthTokens,
	setShopForgotPasswordPAYLOAD
} from '../../utils/authUtils';
import { handleApiError } from 'app/configs/data/utils/handleApiError';

export function useAdminLogin() {
	return useMutation(adminSignIn, {
		onSuccess: (data) => {
			console.log('LoginError22', data?.data);

			if (data?.data?.data && data?.data?._nnip_shop_ASHP_ALOG) {
				setAuthCredentials(data?.data?.data);
				setAuthTokens(data?.data?._nnip_shop_ASHP_ALOG);
				toast.success('logged in successfully');
				window.location.replace('/admin');
			} else if (data) {
				console.log('LoginError22_', data.data);
				Array.isArray(data?.data?.message)
					? data?.data?.message?.map((m) => toast.error(m.message))
					: toast.error(data?.data?.message);
			} else {
				toast.info('something unexpected happened');
			}
		},
		onError: (error) => {
			console.log('LoginError22Block', error);
			handleApiError(error);
		}
	});
}

export function useShopForgotPass() {
	const navigate = useNavigate();
	return useMutation(shopForgotPasswordInit, {
		onSuccess: (data) => {
			if (data?.data?.forgotpass_activation_token && data?.data?.message) {
				setShopForgotPasswordPAYLOAD(data?.data?.forgotpass_activation_token);
				toast.success(data?.data?.message);
				navigate('/reset-password');
			} else if (data?.data?.infomessage) {
				console.log('LoginError22', data);
				toast.error(data?.data?.infomessage);
			} else {
				toast.info('something unexpected happened');
			}
		},
		onError: (error) => {
			console.log('LoginError22', error);
			handleApiError(error);
		}
	});
}

export function useResetShopPass() {
	const history = useNavigate();
	return useMutation(resetshopPasswordWithcode, {
		onSuccess: (data) => {
			console.log('RESET', data);

			if (data?.data?.message & data?.data?.user) {
				console.log('SuccessDATaA_____', data);
				remove_SHOP_FORGOTPASS_TOKEN();
				toast.success(data?.data?.message);
			} else if (data?.data?.infomessage) {
				console.log('LoginError22', data?.data?.message);
				toast.error(data?.data?.infomessage);
			} else {
				toast.info('something unexpected happened');
			}
		},
		onError: (error) => {
			console.log('LoginError22__', error);
			handleApiError(error);
		}
	});
}
