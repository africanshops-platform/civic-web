import _ from "@lodash";
import clsx from "clsx";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

import useAuth from "src/app/auth/useAuth";
import { darken } from "@mui/material/styles";
import Divider from "@mui/material/Divider";

/**
 * The user menu.
 */

function UserMenu({ user }) {
  const { signOut } = useAuth();
  const [userMenu, setUserMenu] = useState(null);
  const userMenuClick = (event) => {
    setUserMenu(event.currentTarget);
  };
  const userMenuClose = () => {
    setUserMenu(null);
  };

  return (
    <>
      <Button
        className="min-h-40 min-w-40 p-0 md:px-16 md:py-6"
        onClick={userMenuClick}
        color="inherit"
      >
        <div className="mx-4 hidden flex-col items-end md:flex">
          <Typography component="span" className="flex font-semibold">
            {user.name ? user.name : user.data.displayName}
          </Typography>
          <Typography
            className=" rounded-full font-semibold py-4 px-4  text-11 capitalize"
            color="text.secondary"
          >
            {user.role?.toString()}
            {(!user.role || (Array.isArray(user.role) && user.role.length === 0)) && "Guest"}
          </Typography>
        </div>

        {user.data.photoURL ? (
          <Avatar
            sx={{
              background: (theme) => theme.palette.background.default,
              color: (theme) => theme.palette.text.secondary,
            }}
            className="md:mx-4"
            alt="user photo"
            src={user.data.photoURL}
          />
        ) : (
          <Avatar
            sx={{
              background: (theme) => darken(theme.palette.background.default, 0.05),
              color: (theme) => theme.palette.text.secondary,
            }}
            className="md:mx-4"
          >
            {user?.name ? user?.name?.[0] : user?.data?.displayName?.[0]}
          </Avatar>
        )}
      </Button>

      <Popover
        open={Boolean(userMenu)}
        anchorEl={userMenu}
        onClose={userMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        classes={{
          paper: "py-8",
        }}
      >
        {!user.role || user.role.length === 0 ? (
          <>
            <MenuItem component={Link} to="/sign-in" role="button">
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:lock-closed</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Sign In" />
            </MenuItem>
            <MenuItem component={Link} to="/sign-up" role="button">
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:user-add </FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Sign up" />
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem component={Link} to="/user/profile" onClick={userMenuClose} role="button">
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:user-circle</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </MenuItem>
            <MenuItem
              component={Link}
              to="/merchants/mailbox"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:mail-open</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Inbox" />
            </MenuItem>
            <Divider variant="middle" />

            {/* ── Civic verticals (the civic user's own dashboards — same set as the landing page) ── */}
            <div className="px-16 pt-8 pb-4">
              <Typography className="text-10 font-semibold uppercase tracking-widest" color="text.disabled">
                Civic
              </Typography>
            </div>

            <MenuItem
              component={Link}
              to="/civictax"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:receipt-tax</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Civic Subscriptions" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/security/map"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:shield-check</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Security Map" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/youth-v2"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:badge-check</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Youth Programmes" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/community"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:speakerphone</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Community" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/healthcare"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:heart</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Healthcare" />
            </MenuItem>

            <Divider variant="middle" />

            {/* Every fintech page is reachable from the finance dashboard itself, so the menu carries one entry. */}
            <MenuItem
              component={Link}
              to="/africanshops/finance-v2/overview"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:cash</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Wallet" />
            </MenuItem>

            <Divider variant="middle" />


            <MenuItem
              component={Link}
              to="/africanshops/settings"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:cog</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/account/kyc"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:identification</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Identity & KYC" />
            </MenuItem>

            <Divider variant="middle" />
            <MenuItem
              onClick={() => {
                signOut();
              }}
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:logout</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Sign out" />
            </MenuItem>
          </>
        )}
      </Popover>
    </>
  );
}

export default UserMenu;
