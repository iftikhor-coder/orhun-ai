import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const origin = url.origin;

  const pathSegments = url.pathname.split('/').filter(Boolean);
  const locale = pathSegments[0] || 'en';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Read profile (auto-created by trigger). Check onboarding flag.
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, onboarding_completed')
        .eq('id', data.user.id)
        .maybeSingle();

      // If trigger didn't fire (very rare), create profile
      if (!profile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          credits_remaining: 4,
          onboarding_completed: false,
        });
        return NextResponse.redirect(`${origin}/${locale}/onboarding/dob`);
      }

      // Onboarding completed → home
      if (profile.onboarding_completed === true) {
        return NextResponse.redirect(`${origin}/${locale}/home`);
      }

      // Otherwise → onboarding
      return NextResponse.redirect(`${origin}/${locale}/onboarding/dob`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
}
