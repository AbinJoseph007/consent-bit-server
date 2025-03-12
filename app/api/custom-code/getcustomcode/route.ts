import { NextRequest, NextResponse } from "next/server";
import { WebflowClient } from "webflow-api";
import { ScriptController } from "../../../lib/controllers/scriptControllers";
import jwt from "../../../lib/utils/jwt";

// Get Site Custom Code
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const accessToken = await jwt.getAccessToken(request);
    console.log("our access token", accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Site ID from query params
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("siteId");
    console.log("our site id from custom code", siteId);

    if (!siteId) {
      return NextResponse.json(
        { error: "Site ID is required" },
        { status: 400 }
      );
    }

    // Initialize Webflow client and script controller
    const webflow = new WebflowClient({ accessToken });
    console.log("site webflow", webflow);

    const scriptController = new ScriptController(webflow);
    console.log("site scriptcontroller", scriptController);

    // Fetch custom code for the site
    const response = await fetch(
      `https://api.webflow.com/v2/sites/${siteId}/registered_scripts`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Accept-Version": "1.0.0",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("the response", response);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Webflow API error:", errorData);
      return NextResponse.json(
        { error: `Failed to fetch site custom code: ${errorData.message}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("Custom Code Response:", result);

    // ✅ CORRECT: Return a valid NextResponse
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Error fetching site custom code:", error);
    return NextResponse.json(
      { error: "Failed to fetch site custom code" },
      { status: 500 }
    );
  }
}
