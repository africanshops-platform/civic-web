import { Controller, useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import _ from "@lodash";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
// import { z } from "zod";
import { useShopForgotPassWithOtp } from "app/configs/data/server-calls/useUsers/useUsersQuery";
import { CircularProgress } from "@mui/material";
/**
 * Form Validation Schema
 */
// const schema = z.object({
// 	email: z.string().email('You must enter a valid email').nonempty('You must enter an email')
// });
const defaultValues = {
  email: "",
};

/**
 * ModernReversedForgotPasswordPage Component
 * Professional forgot password page with orange gradient branding
 */
function ModernReversedForgotPasswordPage() {
  const { mutate: userForgotPass, isLoading } = useShopForgotPassWithOtp();

  const { control, formState, handleSubmit, reset, getValues } = useForm({
    mode: "onChange",
    defaultValues,
  });
  const { isValid, dirtyFields, errors } = formState;

  function onSubmit() {
    userForgotPass(getValues());
  }

  return (
    <div className="flex min-w-0 flex-auto flex-col items-center sm:justify-center md:p-32">
      <Paper className="flex min-h-full w-full overflow-hidden rounded-0 sm:min-h-auto sm:w-auto sm:rounded-2xl sm:shadow md:w-full md:max-w-6xl">
        {/* Right Side - Illustration */}
        <Box
          className="relative hidden h-full flex-auto items-center justify-center overflow-hidden p-64 md:flex lg:px-112"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          }}
        >
          {/* Decorative SVG Background */}
          <svg
            className="pointer-events-none absolute inset-0"
            viewBox="0 0 960 540"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g className="opacity-20" fill="none" stroke="white" strokeWidth="100">
              <circle r="234" cx="196" cy="23" />
              <circle r="234" cx="790" cy="491" />
            </g>
          </svg>
          <Box
            component="svg"
            className="absolute -right-64 -top-64 opacity-20"
            viewBox="0 0 220 192"
            width="220px"
            height="192px"
            fill="none"
          >
            <defs>
              <pattern
                id="forgot-password-pattern"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="4" height="4" fill="white" />
              </pattern>
            </defs>
            <rect width="220" height="192" fill="url(#forgot-password-pattern)" />
          </Box>

          <div className="relative z-10 w-full max-w-2xl">
            <div className="text-7xl font-bold leading-none text-white">
              <div>Password</div>
              <div>Recovery</div>
            </div>
            <div className="mt-24 text-lg leading-6 tracking-tight text-white/90">
              Don't worry! It happens. Enter your email address and we'll send you a link to reset
              your password.
            </div>

            {/* Visual Lock Illustration */}
            <div className="mt-32 flex items-center justify-center">
              <div
                className="relative p-32 rounded-2xl"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <svg
                  className="w-96 h-96 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-32">
              <Typography className="text-white/80 text-sm text-center">
                Reset links are valid for 1 hour. Check your spam folder if you don't see the email.
              </Typography>
            </div>
          </div>
        </Box>

        {/* Left Side - Form */}
        <div className="w-full px-16 py-32 ltr:border-l-1 rtl:border-r-1 sm:w-auto sm:p-48 md:p-64">
          <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
            {/* Logo with Orange Gradient Background */}
            <div
              className="flex h-56 w-56 items-center justify-center rounded-xl mb-32"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                boxShadow: "0 4px 20px rgba(234, 88, 12, 0.3)",
              }}
            >
              <img className="w-40" src="assets/images/afslogo/afslogo.png" alt="logo" />
            </div>

            <Typography className="text-4xl font-extrabold leading-tight tracking-tight">
              Forgot Password?
            </Typography>
            <div className="mt-8">
              <Typography className="text-gray-600">
                No worries! Enter your email and we'll send you reset instructions.
              </Typography>
            </div>

            <form
              name="registerForm"
              noValidate
              className="mt-32 flex w-full flex-col justify-center"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="mb-24"
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    error={!!errors.email}
                    helperText={errors?.email?.message}
                    variant="outlined"
                    required
                    fullWidth
                    autoFocus
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#ea580c",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#ea580c",
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#ea580c",
                      },
                    }}
                  />
                )}
              />

              <Button
                variant="contained"
                className="mt-4 w-full"
                aria-label="Send reset link"
                disabled={_.isEmpty(dirtyFields) || !isValid || isLoading}
                type="submit"
                size="large"
                sx={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: "white",
                  fontWeight: 600,
                  height: "48px",
                  fontSize: "1rem",
                  "&:hover": {
                    background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                  },
                  "&:disabled": {
                    background: "#e5e7eb",
                    color: "#9ca3af",
                  },
                }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-8">
                    <CircularProgress size={20} sx={{ color: "white" }} />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <div className="mt-32 flex items-center justify-center">
                <Typography variant="body2" className="text-gray-600">
                  Remember your password?
                </Typography>
                <Link
                  className="ml-8 font-semibold text-sm"
                  to="/sign-in"
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </Paper>
    </div>
  );
}

export default ModernReversedForgotPasswordPage;
