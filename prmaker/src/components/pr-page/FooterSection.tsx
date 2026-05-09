import React from "react";
interface FooterSectionProps {
  talentName: string;
  poweredByText?: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  talentName, poweredByText = "",
}) => {
  return (
    <footer
      id="footer"
      data-section="alt"
      style={{ color: "var(--cs-text-light)", borderTopColor: "var(--cs-border)" }}
      className="py-8 border-t text-center text-sm"
    >
      <p className="mb-1">{talentName}</p>
      {poweredByText ? <p className="text-xs opacity-60">{poweredByText}</p> : null}
    </footer>
  );
};
