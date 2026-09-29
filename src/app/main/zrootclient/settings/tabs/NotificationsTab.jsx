import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import FormHelperText from "@mui/material/FormHelperText";
import _ from "@lodash";
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  useGetNotificationPreferences,
  useUpdateNotificationPreferences,
} from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useNotificationPreferencesRepo";

const defaultValues = {
  communication: false,
  security: false,
  meetups: false,
  comments: false,
  mention: false,
  follow: false,
  inquiry: false,
};
/**
 * Form Validation Schema
 */
const schema = z.object({
  communication: z.boolean(),
  security: z.boolean(),
  meetups: z.boolean(),
  comments: z.boolean(),
  mention: z.boolean(),
  follow: z.boolean(),
  inquiry: z.boolean(),
});

function NotificationsTab() {
  const { data: notificationSettings, isError } = useGetNotificationPreferences();
  const updateNotificationSettings = useUpdateNotificationPreferences();
  const { control, reset, handleSubmit, formState } = useForm({
    defaultValues,
    mode: "all",
    resolver: zodResolver(schema),
  });
  const { isValid, dirtyFields } = formState;

  useEffect(() => {
    if (notificationSettings) reset(notificationSettings);
  }, [notificationSettings, reset]);

  /**
   * Form Submit
   */
  function onSubmit(formData) {
    updateNotificationSettings.mutate(formData, {
      onSuccess: () => {
        toast.success("Notification preferences saved.");
        reset(formData);
      },
      onError: () => toast.error("Couldn't save your preferences. Please try again."),
    });
  }

  if (isError) {
    return (
      <div className="w-full max-w-3xl">
        <Typography color="error">
          Couldn&apos;t load your notification preferences. Please refresh and try again.
        </Typography>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography className="w-full text-xl">Alerts</Typography>
        <div className="mt-8 grid w-full grid-cols-1 gap-6">
          <div className="flex items-center justify-between">
            <Controller
              name="communication"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="flex flex-col w-full">
                  <FormControlLabel
                    classes={{
                      root: "m-0",
                      label: "flex flex-1",
                    }}
                    labelPlacement="start"
                    label="Communication"
                    control={
                      <Switch
                        onChange={(ev) => {
                          onChange(ev.target.checked);
                        }}
                        checked={value}
                        name="askPasswordChange"
                      />
                    }
                  />
                  <FormHelperText>Get news, announcements, and product updates.</FormHelperText>
                </div>
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <Controller
              name="security"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="flex flex-col w-full">
                  <FormControlLabel
                    classes={{
                      root: "m-0",
                      label: "flex flex-1",
                    }}
                    labelPlacement="start"
                    label="Security"
                    control={
                      <Switch
                        onChange={(ev) => {
                          onChange(ev.target.checked);
                        }}
                        checked={value}
                        name="security"
                      />
                    }
                  />
                  <FormHelperText>
                    Get important notifications about your account security.
                  </FormHelperText>
                </div>
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <Controller
              name="meetups"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="flex flex-col w-full">
                  <FormControlLabel
                    classes={{
                      root: "m-0",
                      label: "flex flex-1",
                    }}
                    labelPlacement="start"
                    label="Meetups"
                    control={
                      <Switch
                        onChange={(ev) => {
                          onChange(ev.target.checked);
                        }}
                        checked={value}
                        name="meetups"
                      />
                    }
                  />
                  <FormHelperText>
                    Get an email when a Meetup is posted close to my location.
                  </FormHelperText>
                </div>
              )}
            />
          </div>
        </div>
        <div className="my-40 border-t" />
        <Typography className="w-full text-xl">Account Activity</Typography>
        <Typography className="mt-24 w-full font-medium">Email me when:</Typography>
        <div className="mt-12 grid w-full grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <Controller
              name="comments"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="flex flex-col w-full">
                  <FormControlLabel
                    classes={{
                      root: "m-0",
                      label: "flex flex-1",
                    }}
                    labelPlacement="start"
                    label="Someone comments on one of my items"
                    control={
                      <Switch
                        onChange={(ev) => {
                          onChange(ev.target.checked);
                        }}
                        checked={value}
                        name="comments"
                      />
                    }
                  />
                </div>
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <Controller
              name="mention"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="flex flex-col w-full">
                  <FormControlLabel
                    classes={{
                      root: "m-0",
                      label: "flex flex-1",
                    }}
                    labelPlacement="start"
                    label="Someone mentions me"
                    control={
                      <Switch
                        onChange={(ev) => {
                          onChange(ev.target.checked);
                        }}
                        checked={value}
                        name="mention"
                      />
                    }
                  />
                </div>
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <Controller
              name="follow"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="flex flex-col w-full">
                  <FormControlLabel
                    classes={{
                      root: "m-0",
                      label: "flex flex-1",
                    }}
                    labelPlacement="start"
                    label="Someone follows me"
                    control={
                      <Switch
                        onChange={(ev) => {
                          onChange(ev.target.checked);
                        }}
                        checked={value}
                        name="follow"
                      />
                    }
                  />
                </div>
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <Controller
              name="inquiry"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="flex flex-col w-full">
                  <FormControlLabel
                    classes={{
                      root: "m-0",
                      label: "flex flex-1",
                    }}
                    labelPlacement="start"
                    label="Someone replies to my job posting"
                    control={
                      <Switch
                        onChange={(ev) => {
                          onChange(ev.target.checked);
                        }}
                        checked={value}
                        name="comments"
                      />
                    }
                  />
                </div>
              )}
            />
          </div>
        </div>
        <Divider className="mb-40 mt-44 border-t" />
        <div className="flex items-center justify-end space-x-16">
          <Button
            variant="outlined"
            disabled={_.isEmpty(dirtyFields)}
            onClick={() => reset(notificationSettings)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={_.isEmpty(dirtyFields) || !isValid || updateNotificationSettings.isLoading}
            type="submit"
          >
            {updateNotificationSettings.isLoading ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NotificationsTab;
