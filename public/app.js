const APP = {
  deferredInstall: null,
  init() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', {
          updateViaCache: 'none',
          scope: '/',
        })
        .then((rg) => {
          console.warn('then register', rg);

        })
        .catch((err) => {
          console.warn('Failed to register', err.message);
        });
    }
  },
};
document.addEventListener('DOMContentLoaded', APP.init);