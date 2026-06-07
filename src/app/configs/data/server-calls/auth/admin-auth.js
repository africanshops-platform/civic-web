import { useMutation } from 'react-query';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import Cookie from 'js-cookie';
import { getSessionRedirectUrl, resetSessionRedirectUrl } from '@fuse/core/FuseAuthorization/sessionRedirectUrl';
import { toast } from 'react-toastify';
import { clientSigin } from '../../client/RepositoryClient';
import config from '../../../../auth/services/jwt/jwtAuthConfig';
import { handleApiError } from 'app/configs/data/utils/handleApiError';

export function useShopAdminLogin() {
	return useMutation(clientSigin, {
		onSuccess: (data) => {
			console.log('LoginData', data);

			if (data?.data?.user && data?.data?.userAccessToken) {
				const transFormedUser = {
					id: data?.data?.user?.id,
					name: data?.data?.user?.name,
					email: data?.data?.user?.email,
					role: 'user',
					avatar: data?.data?.user?.avatar
				};

				if (data?.data?.userAccessToken) {
					localStorage.setItem(config.tokenStorageKey, data?.data?.userAccessToken);
					axios.defaults.headers.common.accessToken = `${data?.data?.userAccessToken}`;
				}

				if (isTokenValid(data?.data?.userAccessToken)) {
					localStorage.setItem(config.isAuthenticatedStatus, true);
				} else {
					localStorage.setItem(config.isAuthenticatedStatus, false);
				}

				if (transFormedUser) {
					setUserCredentialsStorage(transFormedUser);
				}
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

const isTokenValid = (accessToken) => {
	if (accessToken) {
		try {
			const decoded = jwtDecode(accessToken);
			const currentTime = Date.now() / 1000;
			return decoded.exp > currentTime;
		} catch (error) {
			return false;
		}
	}

	return false;
};

const setUserCredentialsStorage = (userCredentials) => {
	const setUserCookie = Cookie.set(config.adminCredentials, JSON.stringify({ userCredentials }));

	if (setUserCookie) {
		const redirectUrl = getSessionRedirectUrl();

		if (redirectUrl) {
			resetSessionRedirectUrl();
			window.location.href = redirectUrl;
		} else {
			window.location.reload();
		}
	}
};
