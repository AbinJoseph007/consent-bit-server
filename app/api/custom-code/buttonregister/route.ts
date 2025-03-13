import { NextRequest, NextResponse } from "next/server";
import { WebflowClient } from "webflow-api";
import { ScriptController } from "../../../lib/controllers/scriptControllers";
import jwt from "../../../lib/utils/jwt";

export async function POST(request: NextRequest) {
  try {

    // Debug authentication
    const accessToken = "434922a4b34a98f4487566a3fb5039a5179ac56ba1ae5167bdef0517e7b88e85";
    console.log("our access token", accessToken);


    // Get siteId from URL parameters
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId is required" },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Webflow client and register script
    const webflow = new WebflowClient({ accessToken });
    const scriptController = new ScriptController(webflow);
    const result = await scriptController.registerHostedScripts(siteId); // Using existing method

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        error: "Failed to register analytical script",
        details: err.message
      },
      { status: 500 }
    );
  }
}