import { Box, Typography } from "@mui/material";
import * as styles from "../style";
import { useRouter } from "next/navigation";

interface DashboardCardProps {
  title: string;
  total: number;
  needVerification: number;
  description: string;
  icon: React.ReactNode;
  link: string;
  bgcolor: string;
  compact: boolean;
  active?: boolean;
}

export default function DashboardCard({
  title,
  total,
  needVerification,
  description,
  icon,
  link,
  bgcolor,
  compact = false,
  active = false,
}: DashboardCardProps) {
  const router = useRouter();
  return (
    <Box
      onClick={() => router.push(link)}
      sx={[
        styles.cardContainer,
        ...(compact ? [styles.compactCard] : []),
        ...(active ? [styles.activeCard] : []),
        ...(compact && !active ? [styles.inactiveCard] : []),
      ]}
      bgcolor={bgcolor}
      color="white"
    >
      <Box sx={styles.cardRow}>
        {icon}
        <Typography variant="body1">{title}</Typography>
      </Box>
      {!compact && (
        <Box sx={styles.cardRow}>
          <Typography>
            Total {title}: {total}
          </Typography>
          <Typography>Need Verification: {needVerification}</Typography>
        </Box>
      )}
      {!compact && <Typography>{description}</Typography>}
    </Box>
  );
}
