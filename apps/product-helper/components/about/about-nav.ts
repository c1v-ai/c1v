import type { LucideIcon } from 'lucide-react';
import { BookOpenText } from 'lucide-react';

export interface AboutNavEntry {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const aboutNavEntries: AboutNavEntry[] = [
  {
    href: '/about/methodology',
    label: 'Methodology',
    icon: BookOpenText,
    description:
      'Three-pass systems-engineering ordering — FMEA instrumental, not terminal.',
  },
];
