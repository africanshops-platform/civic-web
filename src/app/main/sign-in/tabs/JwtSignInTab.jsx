// import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import JwtSignInForm from "../../../auth/services/jwt/components/JwtSignInForm";

function jwtSignInTab() {
  
  return (
    <div className="w-full">
      <JwtSignInForm />

      <div className="mt-32 flex items-center">
        <div className="mt-px flex-auto border-t" />
        <Typography className="mx-8" color="text.secondary">
          Powered By ScanAfrique
        </Typography>
        <div className="mt-px flex-auto border-t" />
      </div>
    </div>
  );
}

export default jwtSignInTab;
