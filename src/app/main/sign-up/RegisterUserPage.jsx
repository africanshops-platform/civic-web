// import Typography from "@mui/material/Typography";
// import { motion } from "framer-motion";
// import Box from "@mui/material/Box";
// import { lighten, ThemeProvider } from "@mui/material/styles";
// import { selectMainThemeDark } from '@fuse/core/FuseSettings/fuseSettingsSlice';
// import { OutlinedInput } from "@mui/material";
// import InputAdornment from "@mui/material/InputAdornment";
// import Card from "@mui/material/Card";
// import { Link } from "react-router-dom";
// import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
// import { useAppSelector } from "app/store/hooks";
import UserModernReversedSignUpPage from "./UserModernReversedSignUpPage";

/**
 * The help center home.
 */

function RegisterUserPage() {
	// const mainThemeDark = useAppSelector(selectMainThemeDark);

	return (
		<div className="flex flex-col flex-auto min-w-0">
			<UserModernReversedSignUpPage />
		</div>
	);
}

export default RegisterUserPage;
