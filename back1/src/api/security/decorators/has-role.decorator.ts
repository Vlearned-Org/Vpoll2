import { SetMetadata } from "@nestjs/common";
import { RoleEnum } from "@vpoll-shared/enum";

export const HasRole = (
  role: RoleEnum | RoleEnum[],
  comparisonOperator: "AND" | "OR" = "OR"
) => SetMetadata("roleConfig", { role, comparisonOperator });
