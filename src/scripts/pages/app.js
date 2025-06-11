import UrlParser from '../routes/url-parser.js';
import routes from '../routes/routes.js';
import Navbar from '../components/navbar.js';
import { isServiceWorkerAvailable } from '../utils';
import { generateSubscribeButtonTemplate, generateUnsubscribeButtonTemplate } from '../templates';
import { subscribe, isCurrentPushSubscriptionAvailable, unsubscribe } from '../utils/notification-helper';

const App = {
  previousPage: null,
  lastRoute: null,

  // Ensure push-notification-tools is rendered before calling setupPushNotification
  async setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    if (!pushNotificationTools) {
      console.error('Element push-notification-tools not found in DOM');
      return;
    }

    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document.getElementById('unsubscribe-button').addEventListener('click', () => {
        unsubscribe().finally(() => {
          this.setupPushNotification();
        });
      });

      return;
    }

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    document.getElementById('subscribe-button').addEventListener('click', () => {
      subscribe().finally(() => {
        this.setupPushNotification();
      });
    });
  },

  async renderPage() {
    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);
    const url = UrlParser.parseActiveUrl();
    const content = document.querySelector("#main-content");
    const navbar = document.querySelector("#navbar");

    const routeKey = UrlParser.parseActiveUrlWithCombiner();
    if (routeKey === this.lastRoute) {
      return;
    }
    this.lastRoute = routeKey;

    const protectedRoutes = ["/home", "/add", "/about", "/detail/:id"];
    const isProtectedRoute = protectedRoutes.includes(routeKey);
    const isAuthPage = url.resource === "login" || url.resource === "register";

    if (isAuthPage && token) {
      console.log("Redirecting to /home: Already logged in, token exists");
      window.location.hash = '#/home';
      return;
    }

    if (isProtectedRoute && !token) {
      console.log("Redirecting to login: No token for protected route", routeKey);
      window.location.hash = "#/login";
      return;
    }

    let page = routes[routeKey];
    if (!page) {
      page = routes['*'];
    }

    if (this.previousPage?.beforeLeave) {
      if (typeof this.previousPage.beforeLeave === 'function') {
        await this.previousPage.beforeLeave();
      }
    }

    if (!isAuthPage && navbar) {
      await Navbar.render();
    } else {
      navbar.innerHTML = "";
    }

    content.innerHTML = "";
    try {
      await page.init();
      if (page.afterRender) {
        await page.afterRender();
      }
      console.log("After render executed for route:", routeKey);
    } catch (error) {
      console.error("Render error for route:", routeKey, ":", error);
      content.innerHTML = "<p>Error rendering page</p>";
    }

    this.previousPage = page;

    if (isServiceWorkerAvailable()) {
      this.setupPushNotification();
    }
  },
};

// Ensure setupPushNotification is called after DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  App.setupPushNotification();
});

export default App;