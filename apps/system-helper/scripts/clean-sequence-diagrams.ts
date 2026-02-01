/**
 * Migration Script: Clean Invalid Sequence Diagram Syntax
 * 
 * Purpose: One-time cleanup of existing sequence diagrams in the database
 * that contain invalid classDef/class statements.
 * 
 * Run with: npx tsx scripts/clean-sequence-diagrams.ts
 * 
 * This script:
 * 1. Finds all artifacts with sequence diagrams containing invalid syntax
 * 2. Cleans the syntax using cleanSequenceDiagramSyntax()
 * 3. Updates the records in the database
 * 4. Reports the results
 */

import { db } from '../lib/db/drizzle';
import { artifacts } from '../lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { cleanSequenceDiagramSyntax, isSequenceDiagram, hasInvalidSequenceSyntax } from '../lib/diagrams/generators';

interface ArtifactContent {
  mermaid?: string;
}

async function cleanSequenceDiagrams() {
  console.log('🔍 Scanning for sequence diagrams with invalid syntax...\n');

  // Fetch all artifacts that might be sequence diagrams
  const allArtifacts = await db
    .select({
      id: artifacts.id,
      projectId: artifacts.projectId,
      type: artifacts.type,
      content: artifacts.content,
    })
    .from(artifacts);

  console.log(`📊 Found ${allArtifacts.length} total artifacts\n`);

  const needsCleaning: Array<{
    id: number;
    projectId: number;
    type: string;
    originalSyntax: string;
    cleanedSyntax: string;
  }> = [];

  // Check each artifact
  for (const artifact of allArtifacts) {
    const content = artifact.content as ArtifactContent | null;
    const mermaidSyntax = content?.mermaid;

    if (!mermaidSyntax) continue;

    // Check if it's a sequence diagram with invalid syntax
    if (isSequenceDiagram(mermaidSyntax) && hasInvalidSequenceSyntax(mermaidSyntax)) {
      const cleanedSyntax = cleanSequenceDiagramSyntax(mermaidSyntax);
      
      needsCleaning.push({
        id: artifact.id,
        projectId: artifact.projectId,
        type: artifact.type,
        originalSyntax: mermaidSyntax,
        cleanedSyntax,
      });
    }
  }

  if (needsCleaning.length === 0) {
    console.log('✅ No sequence diagrams with invalid syntax found. Database is clean!\n');
    return;
  }

  console.log(`⚠️  Found ${needsCleaning.length} sequence diagram(s) with invalid syntax:\n`);

  // Preview changes
  for (const item of needsCleaning) {
    console.log(`  - Artifact #${item.id} (Project #${item.projectId}, Type: ${item.type})`);
    console.log(`    Original length: ${item.originalSyntax.length} chars`);
    console.log(`    Cleaned length: ${item.cleanedSyntax.length} chars`);
    console.log(`    Removed: ${item.originalSyntax.length - item.cleanedSyntax.length} chars\n`);
  }

  // Confirm before proceeding
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question('Do you want to proceed with cleaning? (yes/no): ', resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Aborted. No changes made.\n');
    return;
  }

  console.log('\n🔧 Cleaning diagrams...\n');

  // Perform updates
  let successCount = 0;
  let errorCount = 0;

  for (const item of needsCleaning) {
    try {
      await db
        .update(artifacts)
        .set({
          content: { mermaid: item.cleanedSyntax },
          updatedAt: new Date(),
        })
        .where(eq(artifacts.id, item.id));

      console.log(`  ✓ Artifact #${item.id} cleaned successfully`);
      successCount++;
    } catch (error) {
      console.error(`  ✗ Error cleaning artifact #${item.id}:`, error);
      errorCount++;
    }
  }

  console.log('\n📋 Summary:');
  console.log(`  - Total artifacts scanned: ${allArtifacts.length}`);
  console.log(`  - Diagrams needing cleanup: ${needsCleaning.length}`);
  console.log(`  - Successfully cleaned: ${successCount}`);
  console.log(`  - Errors: ${errorCount}`);
  console.log('\n✅ Migration complete!\n');
}

// Run the migration
cleanSequenceDiagrams()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
