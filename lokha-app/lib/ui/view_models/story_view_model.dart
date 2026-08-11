import 'package:flutter/material.dart';
import '../../data/models/post_model.dart';
import '../../data/repositories/ghost_repository.dart';

class StoryViewModel extends ChangeNotifier {
  final GhostRepository _repository;
  PostModel? _post;
  bool _isLoading = false;
  String? _errorMessage;
  double _readingProgress = 0.0;

  PostModel? get post => _post;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  double get readingProgress => _readingProgress;

  StoryViewModel({required GhostRepository repository, PostModel? initialPost})
      : _repository = repository,
        _post = initialPost;

  Future<void> loadPost(String slug) async {
    if (_post != null && _post!.html != null && _post!.slug == slug) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _post = await _repository.getPostBySlug(slug);
    } catch (e) {
      _errorMessage = 'Could not load dispatch: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void updateReadingProgress(double progress) {
    _readingProgress = progress.clamp(0.0, 1.0);
    notifyListeners();
  }
}
