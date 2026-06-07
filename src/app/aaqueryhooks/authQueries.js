import { useMutation } from 'react-query';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { userForgotPassword, userResetPasswordWithCode } from './routestoserver';
import { resetForgotPassToken, setUserForgotPassCreedStorage } from './utils/opsUtils';
import { handleApiError } from 'app/configs/data/utils/handleApiError';

export function useStudentForgotPass() {
	const navigate = useNavigate();

	return useMutation(userForgotPassword, {
		onSuccess: (data) => {
			// console.log("Forgot-Pass__DATA-000", data?.data)

			if (data?.data?.success) {
				setUserForgotPassCreedStorage(data?.data?.forgotpass_activation_token);
				toast.success(data?.data?.message);

				navigate('/reset-password');
			} else if (data?.data?.error) {
				toast.error(
					data?.data?.error?.response && error?.response?.data?.message
						? error?.response?.data?.message
						: error?.message
				);
				// window.alert(data?.data?.error?.message)
			} else {
				// toast.info('something unexpected happened')
				toast.info('something unexpected happened');
			}
		},
		onError: (error) => {
			handleApiError(error);
		}
	});
}

export function useStudentResetPass() {
	const navigate = useNavigate();

	return useMutation(userResetPasswordWithCode, {
		onSuccess: (data) => {
			if (data?.data?.success) {
				//   console.log("Reset-Pass__DATA--22", data?.data)
				toast.success(data?.data?.message);
				resetForgotPassToken();
				navigate('/sign-in');
			} else if (data?.data?.error) {
				toast.error(
					data?.data?.error?.response && error?.response?.data?.message
						? error?.response?.data?.message
						: error?.message
				);
				// window.alert(data?.data?.error?.message)
			} else {
				// toast.info('something unexpected happened')
				toast.info('something unexpected happened');
			}
		},
		onError: (error) => {
			handleApiError(error);
		}
	});
}
