import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const SKILLS_DIR = path.join(__dirname, '..');

const EXPECTED_SKILLS = [
  'nextjs-best-practices.md',
  'langchain-patterns.md',
  'testing-strategies.md',
  'database-patterns.md',
  'api-design.md',
  'README.md',
];

const REQUIRED_SECTIONS = {
  'nextjs-best-practices.md': [
    '# Next.js Best Practices',
    '## Server vs Client Components',
    '## Data Fetching',
  ],
  'langchain-patterns.md': [
    '# LangChain & LangGraph Patterns',
    '## LangGraph State Management',
    '## Node Implementation',
  ],
  'testing-strategies.md': [
    '# Testing Strategies',
    '## Unit Testing',
    '## Component Testing',
  ],
  'database-patterns.md': [
    '# Database Patterns',
    '## Schema Definition',
    '## Queries',
  ],
  'api-design.md': [
    '# API Design Patterns',
    '## Route Handler Structure',
    '## Request Validation',
  ],
};

describe('Skills Library', () => {
  describe('File Existence', () => {
    it.each(EXPECTED_SKILLS)('should have %s file', (filename) => {
      const filepath = path.join(SKILLS_DIR, filename);
      expect(fs.existsSync(filepath)).toBe(true);
    });
  });

  describe('File Content', () => {
    it.each(EXPECTED_SKILLS)('%s should not be empty', (filename) => {
      const filepath = path.join(SKILLS_DIR, filename);
      const content = fs.readFileSync(filepath, 'utf-8');
      expect(content.length).toBeGreaterThan(100);
    });

    it.each(EXPECTED_SKILLS)('%s should be valid markdown', (filename) => {
      const filepath = path.join(SKILLS_DIR, filename);
      const content = fs.readFileSync(filepath, 'utf-8');

      // Should start with a heading
      expect(content).toMatch(/^#\s+\w+/);

      // Should not have broken code blocks
      const codeBlockStarts = (content.match(/```/g) || []).length;
      expect(codeBlockStarts % 2).toBe(0);
    });
  });

  describe('Required Sections', () => {
    Object.entries(REQUIRED_SECTIONS).forEach(([filename, sections]) => {
      describe(filename, () => {
        const filepath = path.join(SKILLS_DIR, filename);
        const content = fs.existsSync(filepath)
          ? fs.readFileSync(filepath, 'utf-8')
          : '';

        it.each(sections)('should contain section: %s', (section) => {
          expect(content).toContain(section);
        });
      });
    });
  });

  describe('Code Examples', () => {
    const skillFiles = EXPECTED_SKILLS.filter(f => f !== 'README.md');

    it.each(skillFiles)('%s should contain code examples', (filename) => {
      const filepath = path.join(SKILLS_DIR, filename);
      const content = fs.readFileSync(filepath, 'utf-8');

      // Should have at least 3 code blocks
      const codeBlocks = (content.match(/```\w+/g) || []).length;
      expect(codeBlocks).toBeGreaterThanOrEqual(3);
    });

    it.each(skillFiles)('%s should have TypeScript examples', (filename) => {
      const filepath = path.join(SKILLS_DIR, filename);
      const content = fs.readFileSync(filepath, 'utf-8');

      // Should have TypeScript or TSX code blocks
      expect(content).toMatch(/```(typescript|tsx)/);
    });
  });

  describe('README Index', () => {
    it('should list all skill files', () => {
      const readmePath = path.join(SKILLS_DIR, 'README.md');
      const readme = fs.readFileSync(readmePath, 'utf-8');

      const skillFiles = EXPECTED_SKILLS.filter(f => f !== 'README.md');
      skillFiles.forEach(filename => {
        expect(readme).toContain(filename);
      });
    });

    it('should have available skills table', () => {
      const readmePath = path.join(SKILLS_DIR, 'README.md');
      const readme = fs.readFileSync(readmePath, 'utf-8');

      expect(readme).toContain('## Available Skills');
      expect(readme).toContain('| Skill | Description |');
    });
  });
});
