import UrlParser from '../routes/url-parser.js';
import routes from '../routes/routes.js';
import Navbar from '../components/navbar.js';

const App = {
  previousPage: null,
  lastRoute: null,

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
  },
};

export default App;