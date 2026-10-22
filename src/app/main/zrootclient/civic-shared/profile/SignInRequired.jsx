import { Link, useLocation } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { setSessionRedirectUrl } from '@fuse/core/FuseAuthorization/sessionRedirectUrl';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';

/**
 * Account pages fire signed-in requests the moment they mount. For a visitor who is not signed in the first 401 logs out and reloads
 * the page, which fires the request again: an endless reload that ends on a blank screen. Show a sign-in prompt instead and never
 * mount the page (and so never send the request) until the visitor is signed in.
 */
export default function SignInRequired({ message, children }) {
	const { isAuthenticated } = useCivicWebAuth();
	const location = useLocation();

	if (isAuthenticated) return children;

	return (
		<Box className="p-48 text-center">
			<Typography>{message}</Typography>
			<Button
				component={Link}
				to="/sign-in"
				onClick={() => setSessionRedirectUrl(location.pathname + location.search)}
			>
				Sign in
			</Button>
		</Box>
	);
}
