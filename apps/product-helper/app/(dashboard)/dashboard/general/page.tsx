'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Zap } from 'lucide-react';
import { updateAccount } from '@/app/(login)/actions';
import { customerPortalAction } from '@/lib/payments/actions';
import { User, TeamDataWithMembers } from '@/lib/db/schema';
import useSWR from 'swr';
import { Suspense } from 'react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = {
  name?: string;
  error?: string;
  success?: string;
};

type AccountFormProps = {
  state: ActionState;
  nameValue?: string;
  emailValue?: string;
};

function AccountForm({
  state,
  nameValue = '',
  emailValue = ''
}: AccountFormProps) {
  return (
    <>
      <div>
        <Label htmlFor="name" className="mb-2">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your name"
          defaultValue={state.name || nameValue}
          required
        />
      </div>
      <div>
        <Label htmlFor="email" className="mb-2">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          defaultValue={emailValue}
          required
        />
      </div>
    </>
  );
}

function UsagePlanCard() {
  const { data: team } = useSWR<TeamDataWithMembers>('/api/team', fetcher);

  if (!team) return null;

  const isPaid = team.subscriptionStatus === 'active' || team.subscriptionStatus === 'trialing';
  const usagePercent = team.creditLimit > 0
    ? Math.min(100, (team.creditsUsed / team.creditLimit) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Usage & Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground">Plan</Label>
          <span className="text-sm font-medium">
            {isPaid ? (team.planName || 'Pro') : 'Free'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Credits used</Label>
            <span className="text-sm font-medium">
              {isPaid
                ? 'Unlimited'
                : `${team.creditsUsed.toLocaleString()} / ${team.creditLimit.toLocaleString()}`}
            </span>
          </div>
          {!isPaid && (
            <div className="w-full h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          )}
        </div>

        {isPaid ? (
          <form action={customerPortalAction}>
            <Button type="submit" variant="outline" className="w-full">
              Manage Subscription
            </Button>
          </form>
        ) : (
          <Button asChild className="w-full">
            <Link href="/pricing">Upgrade</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function AccountFormWithData({ state }: { state: ActionState }) {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  return (
    <AccountForm
      state={state}
      nameValue={user?.name ?? ''}
      emailValue={user?.email ?? ''}
    />
  );
}

export default function GeneralPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    {}
  );

  return (
    <section className="flex-1 p-4 lg:p-8 space-y-6">
      <h1 className="text-lg lg:text-2xl font-medium text-foreground mb-6">
        General Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={formAction}>
            <Suspense fallback={<AccountForm state={state} />}>
              <AccountFormWithData state={state} />
            </Suspense>
            {state.error && (
              <p className="text-destructive text-sm">{state.error}</p>
            )}
            {state.success && (
              <p className="text-green-600 dark:text-green-400 text-sm">{state.success}</p>
            )}
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Suspense fallback={null}>
        <UsagePlanCard />
      </Suspense>
    </section>
  );
}
