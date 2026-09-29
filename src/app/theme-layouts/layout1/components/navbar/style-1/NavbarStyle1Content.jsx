import FuseScrollbars from "@fuse/core/FuseScrollbars";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import { memo } from "react";
import NavbarToggleButton from "app/theme-layouts/shared-components/navbar/NavbarToggleButton";
import Logo from "../../../../shared-components/Logo";
import UserNavbarHeader from "../../../../shared-components/UserNavbarHeader";

const Root = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  "& ::-webkit-scrollbar-thumb": {
    boxShadow: `inset 0 0 0 20px ${theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.24)" : "rgba(255, 255, 255, 0.24)"}`,
  },
  "& ::-webkit-scrollbar-thumb:active": {
    boxShadow: `inset 0 0 0 20px ${theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.37)" : "rgba(255, 255, 255, 0.37)"}`,
  },
}));
const StyledContent = styled(FuseScrollbars)(() => ({
  overscrollBehavior: "contain",
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  backgroundRepeat: "no-repeat",
  backgroundSize: "100% 40px, 100% 10px",
  backgroundAttachment: "local, scroll",
}));

/**
 * The navbar style 1 content.
 *
 * NOTE: this used to branch on a merchant "shop plan" (RETAIL, REALESTATES,
 * FOODVENDORS, etc.) to pick which sidebar nav to render. civic-web has no
 * shop-plan concept, so that branching could never resolve and the sidebar
 * nav is intentionally left empty here. Building a real civic-appropriate
 * sidebar nav is a separate feature task, not part of this cleanup.
 */
function NavbarStyle1Content(props) {
  const { className = "" } = props;

  return (
    <Root className={clsx("flex h-full flex-auto flex-col overflow-hidden", className)}>
      <div className="flex h-48 shrink-0 flex-row items-center px-20 md:h-72">
        <div className="mx-4 flex flex-1">
          <Logo />
        </div>

        <NavbarToggleButton className="h-40 w-40 p-0" />
      </div>

      <StyledContent
        className="flex min-h-0 flex-1 flex-col"
        option={{ suppressScrollX: true, wheelPropagation: false }}
      >
        <UserNavbarHeader />

        <div className="flex-0 flex items-center justify-center py-48 opacity-20">
          <img
            className="w-full max-w-64"
            // src="assets/images/logo/logo.svg"
            // src="assets/images/afslogo/afLogo.svg"
            src="assets/images/afslogo/afslogo.png"
            alt="footer logo"
            width={45}
            height={45}
          />
        </div>
      </StyledContent>
    </Root>
  );
}

export default memo(NavbarStyle1Content);
