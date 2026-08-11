import 'package:flutter/material.dart';
import '../../data/models/post_model.dart';
import '../../data/repositories/ghost_repository.dart';
import '../../domain/models/format_type.dart';

class FeedViewModel extends ChangeNotifier {
  final GhostRepository _repository;

  List<PostModel> _allPosts = [];
  List<PostModel> _filteredPosts = [];
  FormatType _selectedFormat = FormatType.general;
  bool _isLoading = false;
  String? _errorMessage;

  List<PostModel> get posts => _selectedFormat == FormatType.general
      ? _allPosts
      : _filteredPosts;

  FormatType get selectedFormat => _selectedFormat;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  FeedViewModel({required GhostRepository repository})
      : _repository = repository {
    loadPosts();
  }

  Future<void> loadPosts({bool forceRefresh = false}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _allPosts = await _repository.getPosts(forceRefresh: forceRefresh);
      _applyFilter();
    } catch (e) {
      _errorMessage = 'Could not load dispatches: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectFormat(FormatType format) {
    _selectedFormat = format;
    _applyFilter();
    notifyListeners();
  }

  void _applyFilter() {
    if (_selectedFormat == FormatType.general) {
      _filteredPosts = _allPosts;
    } else {
      _filteredPosts = _allPosts.where((p) => p.formatType == _selectedFormat).toList();
    }
  }
}
