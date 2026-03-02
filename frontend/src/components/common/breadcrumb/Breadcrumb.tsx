"use client";

import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import NextLink from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <Breadcrumbs
      separator={<NavigateNext fontSize="small" />}
      sx={{ mb: 2 }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast || !item.href) {
          return (
            <Typography
              key={item.label}
              color="text.primary"
              fontWeight={600}
            >
              {item.label}
            </Typography>
          );
        }

        return (
          <MuiLink
            key={item.label}
            component={NextLink}
            href={item.href}
            underline="hover"
            color="primary"
            fontWeight={500}
          >
            {item.label}
          </MuiLink>
        );
      })}
    </Breadcrumbs>
  );
}
