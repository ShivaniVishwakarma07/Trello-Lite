import { useNotifications } from "../context/NotificationContext";

const NotificationPanel = () => {
  const { notifications, clearNotifications } = useNotifications();

  return (
    <section className="notification-panel">
      <div className="notification-header">
        <div>
          <p className="section-label">ACTIVITY</p>
          <h2>Notifications</h2>
        </div>

        {notifications.length > 0 && (
          <button type="button" onClick={clearNotifications}>
            Clear
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="empty-notifications">No new notifications</p>
      ) : (
        <div className="notification-list">
          {notifications.map((notification, index) => (
            <div
              className="notification-item"
              key={`${notification.createdAt || "notification"}-${index}`}
            >
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default NotificationPanel;
