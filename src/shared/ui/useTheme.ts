import { useUserPreferencesStore } from '../../features/user-preferences';
import { getColors, palette, radii, spacing, typography } from '../config/theme';

export function useTheme() {
  const theme = useUserPreferencesStore((s) => s.theme);
  const colors = getColors(theme);
  return { colors, palette, radii, spacing, typography, theme };
}
