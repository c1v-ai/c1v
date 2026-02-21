'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import { resetPassword } from '../actions';
import { ActionState } from '@/lib/auth/middleware';

export function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    resetPassword,
    { error: '' }
  );

  // No token in URL - show error
  if (!token) {
    return (
      <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <CircleIcon className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Invalid reset link
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Button asChild className="w-full">
            <Link href="/forgot-password">
              Request a new reset link
            </Link>
          </Button>
          <div className="mt-4">
            <Link
              href="/sign-in"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border border-border rounded-xl shadow-sm p-8">
          {state?.success ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-sm text-foreground mb-6">{state.success}</p>
              <Button asChild className="w-full">
                <Link href="/sign-in">
                  Sign in
                </Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-6" action={formAction}>
              <input type="hidden" name="token" value={token} />

              <div>
                <Label
                  htmlFor="newPassword"
                  className="text-foreground text-sm font-medium"
                >
                  New Password
                </Label>
                <div className="mt-1">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={100}
                    className="w-full"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-foreground text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <div className="mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={100}
                    className="w-full"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              {state?.error && (
                <div className="text-destructive text-sm">{state.error}</div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={pending}
                >
                  {pending ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Reset password
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {!state?.success && (
            <div className="mt-6 text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
