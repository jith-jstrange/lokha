import '../models/post_model.dart';
import '../models/tag_model.dart';
import '../services/ghost_api_service.dart';

class GhostRepository {
  final GhostApiService _apiService;
  List<PostModel> _cachedPosts = [];

  GhostRepository({GhostApiService? apiService})
      : _apiService = apiService ?? GhostApiService();

  List<PostModel> get cachedPosts => _cachedPosts;

  Future<List<PostModel>> getPosts({String? tag, bool forceRefresh = false}) async {
    if (_cachedPosts.isNotEmpty && !forceRefresh && (tag == null || tag == 'all')) {
      return _cachedPosts;
    }

    final posts = await _apiService.fetchPosts(tag: tag);
    if (tag == null || tag == 'all') {
      _cachedPosts = posts;
    }
    return posts;
  }

  Future<PostModel> getPostBySlug(String slug) async {
    // Check cache first
    final cached = _cachedPosts.where((p) => p.slug == slug);
    if (cached.isNotEmpty && cached.first.html != null) {
      return cached.first;
    }
    return await _apiService.fetchPostBySlug(slug);
  }

  Future<List<TagModel>> getTags() async {
    return await _apiService.fetchTags();
  }

  Future<List<PostModel>> getPages() async {
    return await _apiService.fetchPages();
  }
}
