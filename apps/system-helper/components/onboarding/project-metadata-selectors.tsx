'use client';

import { useState } from 'react';
import {
  Cloud,
  Smartphone,
  ShoppingBag,
  Plug,
  CreditCard,
  Wrench,
  Globe,
  MoreHorizontal,
  Lightbulb,
  Layers,
  Rocket,
  TrendingUp,
  Building2,
  Star,
  ClipboardList,
  Code2,
  Palette,
  User,
  Wallet,
  Sprout,
  Target,
  Building,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// --- Option Data ---

interface ChipOption {
  value: string;
  label: string;
  icon: LucideIcon;
  detail?: string;
}

const PROJECT_TYPE_OPTIONS: ChipOption[] = [
  { value: 'saas', label: 'SaaS', icon: Cloud },
  { value: 'mobile-app', label: 'Mobile App', icon: Smartphone },
  { value: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { value: 'api-service', label: 'API Service', icon: Plug },
  { value: 'e-commerce', label: 'E-Commerce', icon: CreditCard },
  { value: 'internal-tool', label: 'Internal Tool', icon: Wrench },
  { value: 'open-source', label: 'Open Source', icon: Globe },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const PROJECT_STAGE_OPTIONS: ChipOption[] = [
  { value: 'idea', label: 'Idea', icon: Lightbulb },
  { value: 'prototype', label: 'Prototype', icon: Layers },
  { value: 'mvp', label: 'MVP', icon: Rocket },
  { value: 'growth', label: 'Growth', icon: TrendingUp },
  { value: 'mature', label: 'Mature', icon: Building2 },
];

const USER_ROLE_OPTIONS: ChipOption[] = [
  { value: 'founder', label: 'Founder', icon: Star },
  { value: 'product-manager', label: 'Product Manager', icon: ClipboardList },
  { value: 'developer', label: 'Developer', icon: Code2 },
  { value: 'designer', label: 'Designer', icon: Palette },
  { value: 'other', label: 'Other', icon: User },
];

const BUDGET_OPTIONS: ChipOption[] = [
  { value: 'bootstrap', label: 'Bootstrap', icon: Wallet, detail: '$0-10K' },
  { value: 'seed', label: 'Seed', icon: Sprout, detail: '$10K-100K' },
  { value: 'series-a', label: 'Series A', icon: Target, detail: '$100K-1M' },
  { value: 'enterprise', label: 'Enterprise', icon: Building, detail: '$1M+' },
  { value: 'undecided', label: 'Undecided', icon: HelpCircle },
];

// --- Sub-components ---

interface ChipGroupProps {
  label: string;
  options: ChipOption[];
  selected: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

function ChipGroup({ label, options, selected, onSelect, disabled = false }: ChipGroupProps) {
  return (
    <div>
      <p
        className="text-xs font-medium mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isSelected = selected === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(isSelected ? '' : option.value)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-primary)',
                borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isSelected) {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                }
              }}
              aria-pressed={isSelected}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{option.label}</span>
              {option.detail && (
                <span
                  className="opacity-70"
                  style={{ fontSize: '0.65rem' }}
                >
                  {option.detail}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Main Component ---

export interface ProjectMetadataSelectorsProps {
  projectType: string;
  projectStage: string;
  userRole: string;
  budget: string;
  onProjectTypeChange: (value: string) => void;
  onProjectStageChange: (value: string) => void;
  onUserRoleChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  disabled?: boolean;
}

export function ProjectMetadataSelectors({
  projectType,
  projectStage,
  userRole,
  budget,
  onProjectTypeChange,
  onProjectStageChange,
  onUserRoleChange,
  onBudgetChange,
  disabled = false,
}: ProjectMetadataSelectorsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasSelections = !!(projectType || projectStage || userRole || budget);
  const selectionCount = [projectType, projectStage, userRole, budget].filter(Boolean).length;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Toggle Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        disabled={disabled}
        aria-expanded={isExpanded}
        aria-controls="metadata-selectors-content"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Project details
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: hasSelections ? 'var(--accent)' : 'var(--bg-secondary)',
              color: hasSelections ? '#FFFFFF' : 'var(--text-muted)',
            }}
          >
            {hasSelections ? `${selectionCount}/4` : 'optional'}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div
          id="metadata-selectors-content"
          className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="pt-4">
            <ChipGroup
              label="What are you building?"
              options={PROJECT_TYPE_OPTIONS}
              selected={projectType}
              onSelect={onProjectTypeChange}
              disabled={disabled}
            />
          </div>

          <div className="pt-4">
            <ChipGroup
              label="Project stage"
              options={PROJECT_STAGE_OPTIONS}
              selected={projectStage}
              onSelect={onProjectStageChange}
              disabled={disabled}
            />
          </div>

          <div>
            <ChipGroup
              label="Your role"
              options={USER_ROLE_OPTIONS}
              selected={userRole}
              onSelect={onUserRoleChange}
              disabled={disabled}
            />
          </div>

          <div>
            <ChipGroup
              label="Budget range"
              options={BUDGET_OPTIONS}
              selected={budget}
              onSelect={onBudgetChange}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}
