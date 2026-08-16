import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { useState } from "react";
// import { Link } from "react-router-dom";
// import { changeLanguage, selectCurrentLanguage, selectLanguages } from "app/store/i18nSlice";
// import { useAppDispatch, useAppSelector } from "app/store/hooks";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";

/**
 * The language switcher.
 */
function CivicHubSwitcher() {
  // const currentLanguage = useAppSelector(selectCurrentLanguage);
  // const languages = useAppSelector(selectLanguages);
  const [menu, setMenu] = useState(null);
  // const dispatch = useAppDispatch();
  const langMenuClick = (event) => {
    setMenu(event.currentTarget);
  };
  const langMenuClose = () => {
    setMenu(null);
  };

  // function handleLanguageChange(lng) {
  //   dispatch(changeLanguage(lng.id));
  //   langMenuClose();
  // }

  return (
    <>
      <Button className="h-40 w-64" onClick={langMenuClick}>
        {/* <img
          className="mx-4 min-w-20"
          src={`assets/images/flags/${currentLanguage.flag}.svg`}
          alt={currentLanguage.title}
        /> */}

        <Typography className="mx-4 font-semibold text-sm uppercase" color="text.secondary">
          civic
        </Typography>
      </Button>

      <Popover
        open={Boolean(menu)}
        anchorEl={menu}
        onClose={langMenuClose}
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
        <MenuItem component={NavLinkAdapter} to="/civictax">
          <ListItemIcon className="min-w-40">
            <FuseSvgIcon>heroicons-outline:book-open</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText primary="Civic Tax" />
        </MenuItem>

        <MenuItem component={NavLinkAdapter} to="/security/map">
          <ListItemIcon className="min-w-40">
            <FuseSvgIcon>heroicons-outline:home</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText primary="Security Map" />
        </MenuItem>

        <MenuItem component={NavLinkAdapter} to="/community">
          <ListItemIcon className="min-w-40">
            <FuseSvgIcon>heroicons-outline:briefcase</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText primary="Community Feeds" />
        </MenuItem>

        <MenuItem component={NavLinkAdapter} to="/youth-v2">
          <ListItemIcon className="min-w-40">
            <FuseSvgIcon>heroicons-outline:briefcase</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText primary="Youth Programs" />
        </MenuItem>

        <MenuItem component={NavLinkAdapter} to="/healthcare">
          <ListItemIcon className="min-w-40">
            <FuseSvgIcon>heroicons-outline:briefcase</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText primary="Healthcare" />
        </MenuItem>

        <MenuItem component={NavLinkAdapter} to="/governance">
          <ListItemIcon className="min-w-40">
            <FuseSvgIcon>heroicons-outline:briefcase</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText primary="Governance" />
        </MenuItem>
        

        
      </Popover>
    </>
  );
}

export default CivicHubSwitcher;
