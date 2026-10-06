import { useEffect } from "react";
import { useTenantBranchContext } from "./useTenantBranchContext";
import { useTenantAppConfig } from "./useTenantAppConfig";

/**
 * usePWAManifest
 * Dynamically binds the PWA installation manifest, document title, and
 * iOS Home Screen shortcut name to the active branch name.
 */
export const usePWAManifest = () => {
  const { tenantSlug, branchCode, branchName } = useTenantBranchContext();
  const { branding } = useTenantAppConfig();

  useEffect(() => {
    const finalBranchName = branchName || branding.businessName || "The Baithak Cafe";

    // 1. Update document title to branch name
    document.title = `${finalBranchName} — Order Food Online | Dine-in & Delivery`;

    // 2. Update iOS apple-mobile-web-app-title
    let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (!appleTitle) {
      appleTitle = document.createElement("meta");
      appleTitle.setAttribute("name", "apple-mobile-web-app-title");
      document.head.appendChild(appleTitle);
    }
    appleTitle.setAttribute("content", finalBranchName);

    // 3. Update theme-color meta tag if branding primaryColor exists
    if (branding.primaryColor) {
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute("content", branding.primaryColor);
      }
    }

    // 4. Construct dynamic Web App Manifest object for branch
    const startUrl = `/t/${tenantSlug}/b/${branchCode}`;
    const manifestData = {
      short_name: finalBranchName,
      name: `${finalBranchName} — Digital Dining & Ordering`,
      description: `Order food online from ${finalBranchName} for dine-in table ordering, takeaway, or home delivery.`,
      icons: [
        {
          src: branding.logoUrl || "/favicon.svg",
          type: "image/svg+xml",
          sizes: "512x512 192x192 64x64 32x32",
          purpose: "any maskable",
        },
      ],
      start_url: startUrl,
      scope: `/t/${tenantSlug}/b/${branchCode}`,
      background_color: "#faf6f1",
      theme_color: branding.primaryColor || "#ea580c",
      display: "standalone",
      orientation: "portrait",
      categories: ["food", "dining", "ordering", "lifestyle"],
    };

    // 5. Update or inject dynamic manifest Blob URL
    const manifestBlob = new Blob([JSON.stringify(manifestData)], {
      type: "application/manifest+json",
    });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestLink) {
      manifestLink.setAttribute("href", manifestUrl);
    } else {
      manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      manifestLink.href = manifestUrl;
      document.head.appendChild(manifestLink);
    }

    return () => {
      URL.revokeObjectURL(manifestUrl);
    };
  }, [tenantSlug, branchCode, branchName, branding]);
};

export default usePWAManifest;
