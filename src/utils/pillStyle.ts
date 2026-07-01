import { ThemeColors } from '@/theme/colors'

export const getMessageTypePillStyle = (
  type: string,
  colors: ThemeColors
): { backgroundColor: string; color: string } => {
  switch (type) {
    case 'Send':
    case 'Redelegate':
      return { backgroundColor: `${colors.primary}20`, color: colors.primary }
    case 'Delegate':
      return {
        backgroundColor: `${colors.status.info}20`,
        color: colors.status.info,
      }
    case 'IBC Transfer':
      return {
        backgroundColor: `${colors.status.warning}20`,
        color: colors.status.warning,
      }
    case 'Vote':
    case 'Withdraw Reward':
      return {
        backgroundColor: `${colors.status.success}20`,
        color: colors.status.success,
      }
    case 'Begin Unbonding':
      return {
        backgroundColor: colors.backgroundSecondary,
        color: colors.text.secondary,
      }
    default:
      return {
        backgroundColor: colors.backgroundSecondary,
        color: colors.text.secondary,
      }
  }
}

export const getResultPillStyle = (
  success: boolean,
  colors: ThemeColors
): { backgroundColor: string; color: string } => {
  return success
    ? {
        backgroundColor: `${colors.status.success}20`,
        color: colors.status.success,
      }
    : {
        backgroundColor: `${colors.status.error}20`,
        color: colors.status.error,
      }
}
