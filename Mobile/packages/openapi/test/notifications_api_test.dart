import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for NotificationsApi
void main() {
  final instance = Openapi().getNotificationsApi();

  group(NotificationsApi, () {
    // delete notification
    //
    //Future notificationControllerDeleteNotification(String id) async
    test('test notificationControllerDeleteNotification', () async {
      // TODO
    });

    // delete all read receipts
    //
    //Future notificationControllerDeleteReadNotifications() async
    test('test notificationControllerDeleteReadNotifications', () async {
      // TODO
    });

    // get successful list
    //
    // get list of successful notifications
    //
    //Future notificationControllerGetNotifications({ num page, num limit, bool unreadOnly }) async
    test('test notificationControllerGetNotifications', () async {
      // TODO
    });

    // count unread notifications
    //
    //Future notificationControllerGetUnreadCount() async
    test('test notificationControllerGetUnreadCount', () async {
      // TODO
    });

    // mark all read
    //
    //Future notificationControllerMarkAllAsRead() async
    test('test notificationControllerMarkAllAsRead', () async {
      // TODO
    });

    // mark as read
    //
    //Future notificationControllerMarkAsRead(String id) async
    test('test notificationControllerMarkAsRead', () async {
      // TODO
    });

  });
}
