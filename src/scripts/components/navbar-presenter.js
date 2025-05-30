import UserModel from "../data/user-model";
import NavbarView from "./navbar-view";

const NavbarPresenter = {
  async init(containerId = "navbar") {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = NavbarView.render();
      NavbarView.showLogoutButton(!!UserModel.getToken());
      const logoutBtn = document.getElementById("logoutButton");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          UserModel.removeAuth();
          window.location.href = "#/login";
        });
      }
    }
  }
};

export default NavbarPresenter;
