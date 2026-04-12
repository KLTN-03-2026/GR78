import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  late IO.Socket socket;

  void initSocket() {
    try {
      socket = IO.io(
        'https://postmaxillary-variably-justa.ngrok-free.dev/notifications',
        <String, dynamic>{
          'transports': ['websocket'],
          'autoConnect': false, // Không tự động connect
        },
      );
    } catch (e) {
      throw Exception('Lỗi khi khởi tạo socket: $e');
    }

    socket.on('connect', (_) {
      print('Connected: ${socket.id}');
    });

    socket.on('message', (data) {
      print('New message: $data');
    });

    socket.on('disconnect', (_) {
      print('Disconnected');
    });

    socket.connect();
  }

  void disconnect() {
    socket.disconnect();
  }
}
