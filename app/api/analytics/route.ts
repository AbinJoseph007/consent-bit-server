import puppeteer from 'puppeteer';
import { NextRequest, NextResponse } from "next/server";


interface ScriptData {
  src: string | null;
  content: string | null;
  type: string | null;
  async: boolean;
  defer: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Get authentication
    const accessToken = "434922a4b34a98f4487566a3fb5039a5179ac56ba1ae5167bdef0517e7b88e85";
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get siteUrl from query parameters
    const searchParams = request.nextUrl.searchParams;
    const siteUrl = searchParams.get('siteUrl');

    if (!siteUrl) {
      return NextResponse.json(
        { error: "Missing or invalid siteUrl parameter" },
        { status: 400 }
      );
    }

    // Launch browser and scrape scripts
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.goto(siteUrl, { waitUntil: 'networkidle2' });
      
      const scripts = await page.evaluate(() => {
        return Array.from(document.scripts).map(script => ({
          src: script.src || null,
          content: script.textContent || script.innerHTML || null,
          type: script.type || null,
          async: script.async,
          defer: script.defer
        }));
      });

      // Enhanced analytics script detection
      const analyticsScripts = scripts.filter(script => {
        const src = script.src?.toLowerCase() || '';
        const content = script.content?.toLowerCase() || '';
        
        return (
          // Google Analytics
          src.includes('google-analytics') ||
          src.includes('googletagmanager') ||
          src.includes('gtag') ||
          content.includes('gtag') ||
          content.includes('dataLayer') ||
          content.includes('google-analytics') ||
          
          // Facebook Pixel
          src.includes('facebook') ||
          src.includes('fbq') ||
          content.includes('fbq') ||
          content.includes('facebook') ||
          
          // Hotjar
          src.includes('hotjar') ||
          content.includes('hotjar') ||
          
          // Other common analytics
          src.includes('mixpanel') ||
          src.includes('segment') ||
          src.includes('amplitude') ||
          src.includes('heap') ||
          src.includes('intercom') ||
          src.includes('drift') ||
          src.includes('crisp') ||
          src.includes('zendesk')
        );
      });

      // Log the results for debugging
      console.log('Found scripts:', scripts.length);
      console.log('Analytics scripts:', analyticsScripts.length);
      analyticsScripts.forEach(script => {
        console.log('Script:', {
          src: script.src,
          contentLength: script.content?.length,
          type: script.type
        });
      });

      return NextResponse.json({ analyticsScripts });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch analytics scripts" },
      { status: 500 }
    );
  }
}