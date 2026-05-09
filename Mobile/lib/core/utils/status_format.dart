import 'package:mobile_app_doan/core/widgets/app_status_badge.dart';

/// Bản dịch + tone nhất quán cho mọi loại status do backend trả về
/// (đơn hàng, báo giá, gói dịch vụ, chứng chỉ, yêu cầu riêng, đơn chờ).
///
/// Mọi page nên dùng [statusLabel] / [statusTone] thay vì tự build chip.
({String label, AppStatusTone tone}) statusInfo(String? raw) {
  final s = (raw ?? '').toLowerCase().trim();
  switch (s) {
    case 'pending':
    case 'awaiting':
    case 'awaiting_confirmation':
    case 'order_requested':
      return (label: 'Đang chờ', tone: AppStatusTone.warning);

    case 'in_progress':
    case 'inprogress':
    case 'doing':
    case 'processing':
      return (label: 'Đang thực hiện', tone: AppStatusTone.info);

    case 'completed':
    case 'done':
    case 'finished':
      return (label: 'Hoàn thành', tone: AppStatusTone.success);

    case 'accepted':
    case 'accepted_for_chat':
    case 'verified':
    case 'active':
    case 'confirmed':
    case 'paid':
      return (label: _vnAccepted(s), tone: AppStatusTone.success);

    case 'revising':
      return (label: 'Đang chào lại', tone: AppStatusTone.info);

    case 'cancelled':
    case 'canceled':
      return (label: 'Đã hủy', tone: AppStatusTone.danger);

    case 'rejected':
    case 'declined':
      return (label: 'Từ chối', tone: AppStatusTone.danger);

    case 'refunded':
      return (label: 'Đã hoàn tiền', tone: AppStatusTone.danger);

    case 'expired':
      return (label: 'Hết hạn', tone: AppStatusTone.danger);

    case 'open':
      return (label: 'Đang mở', tone: AppStatusTone.info);

    case 'closed':
      return (label: 'Đã đóng', tone: AppStatusTone.neutral);

    case '':
      return (label: '—', tone: AppStatusTone.neutral);

    default:
      return (label: (raw != null && raw.isNotEmpty) ? raw : s, tone: AppStatusTone.neutral);
  }
}

String _vnAccepted(String s) {
  switch (s) {
    case 'verified':
      return 'Đã duyệt';
    case 'active':
      return 'Đang hoạt động';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'paid':
      return 'Đã thanh toán';
    case 'accepted_for_chat':
      return 'Đã nhận';
    default:
      return 'Đã chấp nhận';
  }
}
