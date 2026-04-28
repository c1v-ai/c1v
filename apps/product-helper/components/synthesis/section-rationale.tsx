/**
 * SectionRationale — derivation chain (D-01..D-NN). One paragraph per
 * decision with chosen option, rationale, and the linked DN node + NFRs.
 *
 * EC-V21-E.11: each decision row carries a `<WhyThisValueButton />` that
 * opens the provenance side-panel (matched rule + math trace + KB
 * references + override history + override CTA).
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import type { DecisionEntry, DerivationChainEntry } from './types';
import { WhyThisValueButton } from './why-this-value-button';

interface SectionRationaleProps {
  decisions: DecisionEntry[];
  derivationChain: DerivationChainEntry[];
  /** Project id required by the provenance-button's API routes. */
  projectId: number;
}

export function SectionRationale({
  decisions,
  derivationChain,
  projectId,
}: SectionRationaleProps) {
  const chainByDecision = new Map(
    derivationChain.map((c) => [c.decision_id, c]),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Derivation Chain</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {decisions.map((d) => {
          const chain = chainByDecision.get(d.id);
          return (
            <article key={d.id} className="space-y-2">
              <header className="flex flex-wrap items-baseline gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {d.id} — {d.claim}
                </h3>
                {chain?.decision_network_node && (
                  <Badge variant="outline">{chain.decision_network_node}</Badge>
                )}
              </header>
              <p className="flex flex-wrap items-center gap-1.5 text-sm text-foreground">
                <span className="font-medium">Chosen:</span> {d.chosen_option}
                <WhyThisValueButton
                  projectId={projectId}
                  decisionId={d.id}
                  targetField={`architecture_recommendation/decisions[${d.id}].chosen_option`}
                  storyId={d.id}
                  engineVersion="v1"
                  ariaLabel={`Why this decision? (${d.id})`}
                />
              </p>
              <p className="text-sm text-muted-foreground">{d.rationale}</p>
              {chain?.nfrs_driving_choice && chain.nfrs_driving_choice.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {chain.nfrs_driving_choice.map((nfr) => (
                    <Badge key={nfr} variant="secondary">
                      {nfr}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Confidence: {(d.final_confidence * 100).toFixed(0)}%
              </p>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
