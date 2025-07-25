import { useEffect } from "react";

const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    // Stocker la position initiale du scroll
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (isLocked) {
      // Appliquer le lock
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = "100%";
      document.body.dataset.scrollPosition = String(scrollPosition);
    } else {
      // Restaurer le scroll
      document.body.style.overflow = originalStyle;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      // Récupérer et restaurer la position du scroll
      const previousScroll = document.body.dataset.scrollPosition;
      if (previousScroll) {
        window.scrollTo(0, parseInt(previousScroll));
        delete document.body.dataset.scrollPosition;
      }
    }

    return () => {
      // Cleanup
      document.body.style.overflow = originalStyle;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      // Restaurer le scroll si nécessaire lors du démontage
      const previousScroll = document.body.dataset.scrollPosition;
      if (previousScroll) {
        window.scrollTo(0, parseInt(previousScroll));
        delete document.body.dataset.scrollPosition;
      }
    };
  }, [isLocked]);
};

export default useScrollLock;
