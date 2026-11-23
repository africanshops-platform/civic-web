import { useMutation } from 'react-query';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import Cookie from 'js-cookie';
import { getSessionRedirectUrl, resetSessionRedirectUrl } from '@fuse/core/FuseAuthorization/sessionRedirectUrl';
import { toast } from 'react-toastify';
import { handleApiError } from 'app/configs/data/utils/handleApiError';
import { clientSigin, clientVerify2faLogin } from '../../client/RepositoryClient';
import { isTwoFactorChallenge } from '../../../../auth/services/jwt/twoFactorLogin';
import config from '../../../../auth/services/jwt/jwtAuthConfig';



/** Stores the session from a sign-in reply (password only, or password plus authenticator code: the reply has one shape). */
function completeSignIn(data) {
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
}

export function useShopAdminLogin() {
	return useMutation(clientSigin, {
		onSuccess: (data) => {
			// Authenticator on: no session yet, only a temporary token. The sign-in form shows the code step; this is not an error.
			if (isTwoFactorChallenge(data?.data)) return;
			completeSignIn(data);
		},
		onError: (error) => {
			console.log('LoginError22Block', error);
			handleApiError(error);
		}
	});
}

/** The code step of sign-in: only a correct code (or an unused backup code) creates the session. Errors are shown by the code step itself. */
export function useVerify2faLogin() {
	return useMutation(clientVerify2faLogin, {
		onSuccess: (data) => completeSignIn(data)
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
