import 'tag_model.dart';
import '../../domain/models/format_type.dart';

class PostModel {
  final String id;
  final String uuid;
  final String title;
  final String slug;
  final String? html;
  final String? excerpt;
  final String? featureImage;
  final String? featureImageCaption;
  final DateTime publishedAt;
  final int readingTime;
  final String? primaryTagName;
  final String? primaryTagSlug;
  final List<TagModel> tags;
  final List<AuthorModel> authors;
  final String visibility;

  const PostModel({
    required this.id,
    required this.uuid,
    required this.title,
    required this.slug,
    this.html,
    this.excerpt,
    this.featureImage,
    this.featureImageCaption,
    required this.publishedAt,
    required this.readingTime,
    this.primaryTagName,
    this.primaryTagSlug,
    this.tags = const [],
    this.authors = const [],
    this.visibility = 'public',
  });

  FormatType get formatType {
    if (primaryTagSlug != null) {
      return FormatTypeExtension.fromSlug(primaryTagSlug);
    }
    for (final tag in tags) {
      final f = FormatTypeExtension.fromSlug(tag.slug);
      if (f != FormatType.general) return f;
    }
    return FormatType.general;
  }

  factory PostModel.fromJson(Map<String, dynamic> json) {
    final rawTags = json['tags'] as List<dynamic>? ?? [];
    final tagsList = rawTags
        .map((t) => TagModel.fromJson(t as Map<String, dynamic>))
        .toList();

    final rawAuthors = json['authors'] as List<dynamic>? ?? [];
    final authorsList = rawAuthors
        .map((a) => AuthorModel.fromJson(a as Map<String, dynamic>))
        .toList();

    final primaryTag = json['primary_tag'] as Map<String, dynamic>?;

    return PostModel(
      id: json['id'] as String? ?? '',
      uuid: json['uuid'] as String? ?? '',
      title: json['title'] as String? ?? 'Untitled Dispatch',
      slug: json['slug'] as String? ?? '',
      html: json['html'] as String?,
      excerpt: json['excerpt'] as String? ?? json['custom_excerpt'] as String?,
      featureImage: json['feature_image'] as String?,
      featureImageCaption: json['feature_image_caption'] as String?,
      publishedAt: DateTime.tryParse(json['published_at'] as String? ?? '') ??
          DateTime.now(),
      readingTime: (json['reading_time'] as num?)?.toInt() ?? 2,
      primaryTagName: primaryTag?['name'] as String?,
      primaryTagSlug: primaryTag?['slug'] as String?,
      tags: tagsList,
      authors: authorsList,
      visibility: json['visibility'] as String? ?? 'public',
    );
  }
}
