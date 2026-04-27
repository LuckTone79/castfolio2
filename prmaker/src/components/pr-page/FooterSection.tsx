import React from "react";
import { ThemeConfig } from "@/types/theme";

interface FooterSectionProps {
  theme: ThemeConfig;
  talentName: string;
  poweredByText?: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  theme, talentName, poweredByText = "Powered by Castfolio",
}) => {
  return (
    <footer
      id="footer"
      style={{ backgroundColor: theme.colors.primary, color: theme.colors.textLight, borderTopColor: theme.colors.border }}
      className="py-8 border-t text-center text-sm"
    >
      <p className="mb-1">{talentName}</p>
      <p className="text-xs opacity-60">{poweredByText}</p>
    </footer>
  );
};
