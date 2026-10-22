import { Controller, useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import _ from "@lodash";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { get_SHOP_FORGOTPASS_TOKEN } from "app/configs/utils/authUtils";
import { useResetShopPassFromOtp } from "app/configs/data/server-calls/useUsers/useUsersQuery";
import { toast } from "react-toastify";
import { LockReset } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
/**
 * Form Validation Schema
 */
const schema = z
  .object({
    password: z
      .string()
      .nonempty("Please enter your password.")
      .min(8, "Password is too short - should be 8 chars minimum."),
    confirmpasword: z.string().nonempty("Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmpasword, {
    message: "Passwords must match",
    path: ["confirmpasword"],
  });
const defaultValues = {
  confirmpasword: "",
  password: "",
  activationCode: "",
  activationToken: "",
};

/**
 * ModernReversedResetPasswordPage Component
 * Professional reset password page with orange gradient branding
 */
function ModernReversedResetPasswordPage() {
  const { mutate: shopResetPass, isLoading } = useResetShopPassFromOtp();
  const { control, formState, handleSubmit, reset, getValues, setValue } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });
  const { isValid, dirtyFields, errors } = formState;

  const activationTokenToCheck = get_SHOP_FORGOTPASS_TOKEN();
  function onSubmit() {
    const activationTokenToCheck = get_SHOP_FORGOTPASS_TOKEN();
    if (!activationTokenToCheck) {
      toast.error("Activation token is missing. Please try again.");
      return;
    }

    setValue("activationToken", activationTokenToCheck);
    const payload = {
      ...getValues(),
      token: activationTokenToCheck,
    };
    shopResetPass(payload);
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
                id="reset-password-pattern"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="4" height="4" fill="white" />
              </pattern>
            </defs>
            <rect width="220" height="192" fill="url(#reset-password-pattern)" />
          </Box>

          <div className="relative z-10 w-full max-w-2xl">
            <div className="text-7xl font-bold leading-none text-white">
              <div>Create New</div>
              <div>Password</div>
            </div>
            <div className="mt-24 text-lg leading-6 tracking-tight text-white/90">
              Your new password must be different from previously used passwords. Make it strong and
              secure!
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
                <LockReset sx={{ fontSize: "6rem", color: "white" }} />
              </div>
            </div>

            <div className="mt-32">
              <Typography className="text-white/80 text-sm text-center">
                Password must be at least 8 characters long and include a mix of letters, numbers,
                and symbols.
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
                background: "#000000",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
              }}
            >
              <img className="w-40" src="assets/images/afslogo/civic-logo-white.png" alt="logo" />
            </div>

            <Typography className="text-4xl font-extrabold leading-tight tracking-tight">
              Reset Your Password
            </Typography>
            <div className="mt-8">
              <Typography className="text-gray-600">
                Enter the OTP code sent to your email, then create your new password.
              </Typography>
            </div>

            <form
              name="registerForm"
              noValidate
              className="mt-32 flex w-full flex-col justify-center"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Controller
                name="activationCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="mb-24"
                    label="OTP Code"
                    type="text"
                    placeholder="Enter the OTP code from your email"
                    error={!!errors.activationCode}
                    helperText={errors?.activationCode?.message}
                    variant="outlined"
                    required
                    fullWidth
                    autoFocus
                    inputProps={{
                      style: {
                        fontSize: "1.125rem",
                        letterSpacing: "0.2rem",
                        textAlign: "center",
                        fontWeight: "600",
                      },
                    }}
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

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="mb-24"
                    label="New Password"
                    type="password"
                    placeholder="Enter your new password"
                    error={!!errors.password}
                    helperText={errors?.password?.message}
                    variant="outlined"
                    required
                    fullWidth
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

              <Controller
                name="confirmpasword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="mb-24"
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm your new password"
                    error={!!errors.confirmpasword}
                    helperText={errors?.confirmpasword?.message}
                    variant="outlined"
                    required
                    fullWidth
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
                aria-label="Reset password"
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
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  "Reset Password"
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

export default ModernReversedResetPasswordPage;
