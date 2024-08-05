import cron from "node-cron";

// Mock functions - Replace these with actual implementations
function getUserPushToken(userId) {
  return "mocked_push_token";
}

function sendPushNotification(tokens, title, body, data) {
  // Implement the actual logic to send push notifications to Expo clients here
}

// Function to calculate the departure time
function calculateDepartureTime(bookingTime) {
  const departureTime = new Date(bookingTime);
  departureTime.setMinutes(departureTime.getMinutes() - 10); // Subtract 10 minutes
  return departureTime;
}

// Function to send push notification
function sendNotification(userId, departureTime) {
  const userPushToken = getUserPushToken(userId);
  if (userPushToken) {
    sendPushNotification(
      [userPushToken],
      "Trip Reminder",
      "Your trip is departing soon!",
      { departureTime }
    );
  } else {

  }
}

// Function to schedule push notification
function schedulePushNotification(userId, bookingTime) {
  const departureTime = calculateDepartureTime(bookingTime);

  // Schedule task to send push notification 10 minutes before departure time
  cron.schedule(departureTime, () => {
    sendNotification(userId, departureTime);
  });
}

// Example usage:
// Assume bookingTime is the time when the trip is booked
const bookingTime = new Date(); // Current time
const userId = "exampleUserId";
schedulePushNotification(userId, bookingTime);
