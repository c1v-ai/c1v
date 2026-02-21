'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { requestPasswordReset } from '../actions';
import { ActionState } from '@/lib/auth/middleware';

export function ForgotPassword() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    requestPasswordReset,
    { error: '' }
  );

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your email address and we will send you a link to reset your password.
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
              <Link
                href="/sign-in"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-6" action={formAction}>
              <div>
                <Label
                  htmlFor="email"
                  className="text-foreground text-sm font-medium"
                >
                  Email
                </Label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={255}
                    className="w-full"
                    placeholder="Enter your email"
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
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </div>
            </form>
          )}

          {!state?.success && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    Remember your password?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/sign-in"
                  className="w-full flex justify-center py-2 px-4 border border-border rounded-xl text-sm font-medium text-foreground bg-card hover:bg-muted transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
