import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'data/services/ghost_api_service.dart';
import 'data/services/audio_narrator_service.dart';
import 'data/repositories/ghost_repository.dart';
import 'ui/view_models/feed_view_model.dart';
import 'ui/view_models/reading_settings_view_model.dart';
import 'ui/screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  final ghostApiService = GhostApiService();
  final ghostRepository = GhostRepository(apiService: ghostApiService);

  runApp(
    MultiProvider(
      providers: [
        Provider<GhostRepository>.value(value: ghostRepository),
        ChangeNotifierProvider(create: (_) => ReadingSettingsViewModel()),
        ChangeNotifierProvider(create: (_) => AudioNarratorService()),
        ChangeNotifierProvider(
          create: (_) => FeedViewModel(repository: ghostRepository),
        ),
      ],
      child: const LokhaApp(),
    ),
  );
}

class LokhaApp extends StatelessWidget {
  const LokhaApp({super.key});

  @override
  Widget build(BuildContext context) {
    final settingsVM = context.watch<ReadingSettingsViewModel>();
    final theme = AppTheme.getTheme(
      settingsVM.themeMode,
      settingsVM.fontFamily,
    );

    return MaterialApp(
      title: 'Lokha.Today',
      debugShowCheckedModeBanner: false,
      theme: theme,
      home: const HomeScreen(),
    );
  }
}
