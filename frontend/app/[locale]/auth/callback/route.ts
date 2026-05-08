import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const origin = url.origin;
  
  // URL'dan locale ni olish (masalan /en/auth/callback → "en")
  const pathSegments = url.pathname.split('/').filter(Boolean);
  const locale = pathSegments[0] || 'en';
  
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Muvaffaqiyatli — home sahifaga yo'naltiramiz
      return NextResponse.redirect(`${origin}/${locale}/home`);
    }
  }

  // Xato bo'lsa — login'ga qaytaramiz
  return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
}