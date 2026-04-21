class PostRequest {
  final String title;
  final String description;
  final List<String> imageUrls;
  final String location;
  final DateTime desiredTime;
  final int budget;

  PostRequest({
    required this.title,
    required this.description,
    required this.imageUrls,
    required this.location,
    required this.desiredTime,
    required this.budget,
  });

  Map<String, dynamic> toJson() => {
    'title': title,
    'description': description,
    'imageUrls': imageUrls,
    'location': location,
    'desiredTime': desiredTime.toIso8601String(),
    'budget': budget,
  };
}
