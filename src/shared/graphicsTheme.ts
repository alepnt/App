export const graphicsTheme = {
  background: {
    primary: '#FFFFFF',
    secondary: '#6D28D9'
  },
  text: {
    onPrimary: '#000000',
    onSecondary: '#FFFFFF'
  }
} as const;

export type ThemeBackground = keyof typeof graphicsTheme.background;

export const textColorByBackground: Record<ThemeBackground, string> = {
  primary: graphicsTheme.text.onPrimary,
  secondary: graphicsTheme.text.onSecondary
};
