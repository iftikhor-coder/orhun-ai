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
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', data.user.id)
        .single();
      
      // Redirect based on onboarding state
      if (!profile || !profile.username) {
        return NextResponse.redirect(`${origin}/${locale}/onboarding/dob`);
      }
      return NextResponse.redirect(`${origin}/${locale}/home`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
}
