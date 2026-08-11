import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/api_constants.dart';
import '../models/post_model.dart';
import '../models/tag_model.dart';

class GhostApiService {
  final http.Client _client;

  GhostApiService({http.Client? client}) : _client = client ?? http.Client();

  // 1. Fetch Posts with optional tag filter
  Future<List<PostModel>> fetchPosts({
    String? tag,
    int page = 1,
    int limit = 15,
  }) async {
    final queryParams = {
      'key': ApiConstants.ghostContentApiKey,
      'include': 'tags,authors',
      'limit': limit.toString(),
      'page': page.toString(),
    };

    if (tag != null && tag.isNotEmpty && tag != 'all') {
      queryParams['filter'] = 'tag:$tag';
    }

    final uri = Uri.parse('${ApiConstants.ghostBaseUrl}/posts/').replace(
      queryParameters: queryParams,
    );

    final response = await _client.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body) as Map<String, dynamic>;
      final postsJson = data['posts'] as List<dynamic>? ?? [];
      return postsJson
          .map((p) => PostModel.fromJson(p as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception('Failed to load posts: ${response.statusCode}');
    }
  }

  // 2. Fetch Single Post by Slug
  Future<PostModel> fetchPostBySlug(String slug) async {
    final uri = Uri.parse('${ApiConstants.ghostBaseUrl}/posts/slug/$slug/').replace(
      queryParameters: {
        'key': ApiConstants.ghostContentApiKey,
        'include': 'tags,authors',
      },
    );

    final response = await _client.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body) as Map<String, dynamic>;
      final postsJson = data['posts'] as List<dynamic>? ?? [];
      if (postsJson.isNotEmpty) {
        return PostModel.fromJson(postsJson.first as Map<String, dynamic>);
      }
      throw Exception('Post not found');
    } else {
      throw Exception('Failed to load post: ${response.statusCode}');
    }
  }

  // 3. Fetch Tags
  Future<List<TagModel>> fetchTags() async {
    final uri = Uri.parse('${ApiConstants.ghostBaseUrl}/tags/').replace(
      queryParameters: {
        'key': ApiConstants.ghostContentApiKey,
        'limit': 'all',
      },
    );

    final response = await _client.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body) as Map<String, dynamic>;
      final tagsJson = data['tags'] as List<dynamic>? ?? [];
      return tagsJson
          .map((t) => TagModel.fromJson(t as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception('Failed to load tags: ${response.statusCode}');
    }
  }

  // 4. Fetch Pages (e.g. Legal, About)
  Future<List<PostModel>> fetchPages() async {
    final uri = Uri.parse('${ApiConstants.ghostBaseUrl}/pages/').replace(
      queryParameters: {
        'key': ApiConstants.ghostContentApiKey,
        'limit': 'all',
      },
    );

    final response = await _client.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body) as Map<String, dynamic>;
      final pagesJson = data['pages'] as List<dynamic>? ?? [];
      return pagesJson
          .map((p) => PostModel.fromJson(p as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception('Failed to load pages: ${response.statusCode}');
    }
  }
}
