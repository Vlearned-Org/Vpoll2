export interface ImportBuildResult<T> {
  status: "error" | "success";
  data: {
    rows: Array<T>;
    columns?: Array<{ label: string; key: string }>;
    infos?: Array<{ code?: string; row?: number }>;
  };
  errors: Array<{
    code?: string;
    col?: number;
    row?: number;
    data?: any;
  }>;
}
