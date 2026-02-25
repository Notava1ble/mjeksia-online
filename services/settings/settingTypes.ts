// ── Base types ──────────────────────────────────────────────────────────

export type BaseSettingDef = {
  label: string;
  scope?: "dev";
  description?: string;
};

export type SelectSettingDef = BaseSettingDef & {
  type: "select";
  options: Record<string, string>;
  default: string;
};

export type ToggleSettingDef = BaseSettingDef & {
  type: "toggle";
  default: boolean;
};

export type AnySettingDef = SelectSettingDef | ToggleSettingDef;

// ── Schema shape types ─────────────────────────────────────────────────

export type Subsections = Record<
  string,
  {
    title: string;
    settings: Record<string, AnySettingDef>;
  }
>;

export type SettingsSchema = Record<
  string,
  {
    title: string;
    icon: string;
    subsections: Subsections;
  }
>;
