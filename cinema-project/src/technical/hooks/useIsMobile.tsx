import { useState, useEffect } from "react";

interface MobileDetectResult {
  isMobile: boolean;
  isTouch: boolean;
}

const useIsMobile = (): MobileDetectResult => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    // Fonction pour vérifier si l'appareil est mobile via User Agent
    const checkMobileDevice = (): boolean => {
      const userAgent =
        typeof window.navigator === "undefined" ? "" : navigator.userAgent;

      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

      return mobileRegex.test(userAgent);
    };

    // Fonction pour vérifier la largeur de l'écran
    const checkMobileWidth = (): boolean => {
      return window.innerWidth <= 768;
    };

    // Fonction pour vérifier si l'appareil supporte le touch
    const checkTouchDevice = (): boolean => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    // Fonction qui combine toutes les vérifications
    const updateMobileStatus = () => {
      const isMobileDevice = checkMobileDevice();
      const isMobileWidth = checkMobileWidth();
      setIsMobile(isMobileDevice || isMobileWidth);
      setIsTouch(checkTouchDevice());
    };

    // Vérification initiale
    updateMobileStatus();

    // Mise à jour lors du redimensionnement de la fenêtre
    window.addEventListener("resize", updateMobileStatus);

    // Nettoyage
    return () => {
      window.removeEventListener("resize", updateMobileStatus);
    };
  }, []);

  return { isMobile, isTouch };
};

export default useIsMobile;
