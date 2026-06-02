const CACHE = 'vanba-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Commandes Vanbaelinghem', {
      body: data.body || '',
      icon: './icon.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'rappel',
      requireInteraction: true
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});

// Vérification à 18h30 via un timer interne (pour notifications locales)
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SCHEDULE_CHECK'){
    scheduleRappel(e.data.missingMags, e.data.role, e.data.magasin);
  }
});

function scheduleRappel(missingMags, role, magasin){
  const now = new Date();
  const target = new Date();
  target.setHours(18, 30, 0, 0);

  // Si 18h30 est déjà passé aujourd'hui, programmer pour demain
  if(now >= target) target.setDate(target.getDate() + 1);

  const delay = target.getTime() - now.getTime();

  setTimeout(() => {
    if(role === 'atelier' && missingMags.length > 0){
      self.registration.showNotification('⚠️ Commandes manquantes', {
        body: 'Pas de commande de : ' + missingMags.join(', '),
        icon: './icon.png',
        tag: 'atelier-rappel',
        requireInteraction: true
      });
    } else if(role === 'magasin' && missingMags.includes(magasin)){
      self.registration.showNotification('⚠️ Rappel commande', {
        body: 'Vous n\'avez pas encore envoyé votre commande pour demain !',
        icon: './icon.png',
        tag: 'magasin-rappel',
        requireInteraction: true
      });
    }
  }, delay);
}
