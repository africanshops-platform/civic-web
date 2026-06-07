import { verifyPaystackPaymentFromFintechService } from 'app/configs/data/client/RepositoryAuthClient';
import { handleApiError } from 'app/configs/data/utils/handleApiError';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

/** **1) Verify payments made to company paystack from web and mobile platforms */

export function useVerifyPaystackPaymentMutation() {
	const navigate = useNavigate();
	return useMutation(
		(postPayload) => verifyPaystackPaymentFromFintechService(postPayload),
		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(`${data?.data?.message ? data?.data?.message : 'reservation added successfully!'}`);
					navigate(`/bookings/${data?.data?.payload?.id}/payment-success`);
				}
			},
			onError: (error) => {
				handleApiError(error);
			}
		}
	);
}
