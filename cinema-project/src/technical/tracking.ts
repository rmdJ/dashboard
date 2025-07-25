import mixpanel from "mixpanel-browser";

export const getPlatform = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "iOS";
  } else if (/android/.test(userAgent)) {
    return "Android";
  } else if (/macintosh|mac os x/.test(userAgent)) {
    // Pour distinguer iPad sous iOS 13+ qui s'identifie comme macOS
    if (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
      return "iOS";
    }
    return "macOS";
  } else if (/windows/.test(userAgent)) {
    return "Windows";
  } else if (/linux/.test(userAgent)) {
    return "Linux";
  }

  return "Unknown";
};

export const getBrowser = () => {
  const ua = navigator.userAgent;
  let browser = "Unknown";

  // Detection du navigateur
  if (ua.includes("Chrome")) {
    browser = "Chrome";
  } else if (ua.includes("Firefox")) {
    browser = "Firefox";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browser = "Safari";
  } else if (ua.includes("Edge")) {
    browser = "Edge";
  } else if (ua.includes("Opera") || ua.includes("OPR")) {
    browser = "Opera";
  }

  return browser;
};

export const initAnalytics = () => {
  if (import.meta.env.PROD) {
    mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN, {
      debug: false,
      track_pageview: true,
      persistence: "localStorage",
    });

    mixpanel.register({
      Platform: getPlatform(),
      "Device Type": /mobile|tablet/i.test(navigator.userAgent)
        ? "Mobile"
        : "Desktop",
      Browser: getBrowser(),
      "Screen Size": `${window.screen.width}x${window.screen.height}`,
      Viewport: `${window.innerWidth}x${window.innerHeight}`,
    });
  }
};

export const trackEvent = (
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, any>,
) => {
  if (import.meta.env.PROD) {
    mixpanel.track(eventName, properties);
  }
};
