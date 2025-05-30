import NotificationPage from './notification-page.js';

const NotificationPresenter = {
  async init() {
    const container = document.querySelector('#main-content');
    NotificationPage.render(container);
  },
  saveNotification(data) {
    NotificationPage.saveNotification(data);
  }
};

export default NotificationPresenter;
