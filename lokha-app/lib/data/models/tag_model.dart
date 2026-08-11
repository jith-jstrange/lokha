class AuthorModel {
  final String id;
  final String name;
  final String? slug;
  final String? profileImage;
  final String? bio;
  final String? location;

  const AuthorModel({
    required this.id,
    required this.name,
    this.slug,
    this.profileImage,
    this.bio,
    this.location,
  });

  factory AuthorModel.fromJson(Map<String, dynamic> json) {
    return AuthorModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Lokha Author',
      slug: json['slug'] as String?,
      profileImage: json['profile_image'] as String?,
      bio: json['bio'] as String?,
      location: json['location'] as String?,
    );
  }
}

class TagModel {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? featureImage;

  const TagModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.featureImage,
  });

  factory TagModel.fromJson(Map<String, dynamic> json) {
    return TagModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String?,
      featureImage: json['feature_image'] as String?,
    );
  }
}
