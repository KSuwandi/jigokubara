import { PERMISSIONS } from "./roles";

export const hasPermission = (
  role,
  permission
) => {
  return (
    PERMISSIONS[
      permission
    ]?.includes(role) || false
  );
};