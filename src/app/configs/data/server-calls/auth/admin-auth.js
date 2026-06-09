import { useMutation } from 'react-query';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import Cookie from 'js-cookie';
import { getSessionRedirectUrl, resetSessionRedirectUrl } from '@fuse/core/FuseAuthorization/sessionRedirectUrl';
import { toast } from 'react-toastify';
import { handleApiError } from 'app/configs/data/utils/handleApiError';
import { clientSigin } from '../../client/RepositoryClient';
import config from '../../../../auth/services/jwt/jwtAuthConfig';



export function useShopAdminLogin() {
	return useMutation(clientSigin, {
		onSuccess: (data) => {
			const user = data?.data?.user;
			const accessToken = data?.data?.userAccessToken;

			if (user && accessToken) {
				const userId = user?.id ?? user?._id;
				const transFormedUser = {
					id: userId,
					name: user?.name,
					email: user?.email,
					role: 'user',
					avatar: user?.avatar
				};

				localStorage.setItem(config.tokenStorageKey, accessToken);
				axios.defaults.headers.common.accessToken = `${accessToken}`;
				localStorage.setItem(config.isAuthenticatedStatus, isTokenValid(accessToken));

				const refreshToken = data?.data?.userRefreshToken;
				const sessionId = data?.data?.sessionId;
				if (refreshToken) localStorage.setItem(config.refreshTokenStorageKey, refreshToken);
				if (sessionId) localStorage.setItem(config.sessionIdStorageKey, sessionId);

				setUserCredentialsStorage(transFormedUser);
			} else if (data) {
				handleApiError({ response: data });
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
	Cookie.set(config.adminCredentials, JSON.stringify({ userCredentials }));

	const redirectUrl = getSessionRedirectUrl();

	if (redirectUrl) {
		resetSessionRedirectUrl();
		window.location.href = redirectUrl;
	} else {
		window.location.reload();
	}
};
