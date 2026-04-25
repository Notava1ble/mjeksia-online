import type { AnySettingDef, SettingsSchema } from "./settingTypes";

// ── Flat registry (single source of truth for types) ────────────────────

export const settingsDefs = {
  user_color_scheme: {
    type: "select",
    label: "Theme",
    options: [
      { value: "Zen", label: "Zen" },
      { value: "Amber", label: "Amber" },
      { value: "Minimal", label: "Minimal" },
      { value: "Dracula", label: "Dracula" },
      { value: "Cyberpunk", label: "Cyberpunk" },
      { value: "Catppuccin", label: "Catppuccin" },
      { value: "Leadgen", label: "Leadgen" },
      { value: "Brutalist", label: "Brutalist" },
    ],
    default: "Zen",
  },
  user_appearance: {
    type: "select",
    label: "Appearance",
    options: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "system", label: "System" },
    ],
    default: "system",
  },
  hide_arena_explanation: {
    type: "toggle",
    label: "Hide Explanations",
    description: "Do not show explanations after guessing.",
    default: false,
  },
  test_question_amount: {
    type: "select",
    label: "Numri i pyetjeve",
    options: [
      { value: "10", label: "10 pyetje" },
      { value: "25", label: "25 pyetje" },
      { value: "50", label: "50 pyetje" },
    ],
    default: "50",
  },
  test_time: {
    type: "select",
    label: "Koha e testit",
    options: [
      { value: "10", label: "10 min" },
      { value: "25", label: "25 min" },
      { value: "50", label: "50 min" },
    ],
    default: "50",
  },
  focus_test_question_amount: {
    type: "select",
    label: "Numri i pyetjeve",
    options: [
      { value: "10", label: "10 pyetje" },
      { value: "25", label: "25 pyetje" },
      { value: "50", label: "50 pyetje" },
    ],
    default: "50",
  },
  focus_test_time: {
    type: "select",
    label: "Koha e testit",
    options: [
      { value: "10", label: "10 min" },
      { value: "25", label: "25 min" },
      { value: "50", label: "50 min" },
    ],
    default: "50",
  },
  always_show_image_placeholder: {
    type: "toggle",
    label: "Always Show Image Placeholder",
    description: "Always show the image placeholder even if there is no image.",
    default: false,
  },
  show_reasoning_instead_of_explanation: {
    type: "toggle",
    label: "Show advanced reasoning",
    description: "Show advanced reasoning instead of explanation.",
    default: true,
  },
} as const satisfies Record<string, AnySettingDef>;

// ── Derived types ───────────────────────────────────────────────────────

type SettingsDefs = typeof settingsDefs;

export type SettingsKey = keyof SettingsDefs;

export type SettingValue<K extends SettingsKey> = SettingsDefs[K] extends {
  type: "select";
  options: readonly { value: infer V }[];
}
  ? V & string
  : SettingsDefs[K] extends { type: "toggle" }
    ? boolean
    : never;

// ── Nested schema (UI layout only) ─────────────────────────────────────

export const settingsSchema: SettingsSchema = {
  Appearance: {
    title: "Appearance",
    icon: "color-palette-outline",
    subsections: {
      UI: {
        title: "User Interface",
        settings: {
          user_color_scheme: settingsDefs.user_color_scheme,
          user_appearance: settingsDefs.user_appearance,
        },
      },
    },
  },
  TestPreferences: {
    title: "Test Preferences",
    icon: "document-text-outline",
    subsections: {
      Arena: {
        title: "Questions",
        settings: {
          hide_arena_explanation: settingsDefs.hide_arena_explanation,
          always_show_image_placeholder:
            settingsDefs.always_show_image_placeholder,
          show_reasoning_instead_of_explanation:
            settingsDefs.show_reasoning_instead_of_explanation,
        },
      },
      ModelTesti: {
        title: "Model Testi",
        settings: {
          test_question_amount: settingsDefs.test_question_amount,
          test_time: settingsDefs.test_time,
        },
      },
      FocusTest: {
        title: "Teste te fokusuara",
        settings: {
          focus_test_question_amount: settingsDefs.focus_test_question_amount,
          focus_test_time: settingsDefs.focus_test_time,
        },
      },
    },
  },
};
