class ApiConstants {
  // Ghost CMS Headless Content API
  static const String ghostBaseUrl = 'https://lokha.today/ghost/api/content';
  static const String ghostContentApiKey = 'b764222d2681a6642d593b1c32';
  
  // Ghost Site URL & Webhooks
  static const String siteUrl = 'https://lokha.today';
  static const String mcpWorkerUrl = 'https://lokha-mcp.lokha.workers.dev';

  // Creem.io Merchant of Record Checkout URLs
  static const String creemMonthlyCheckoutUrl = 'https://creem.io/product/prod_1zIxHl2CZ7Efx4ZE3lBCNP';
  static const String creemYearlyCheckoutUrl = 'https://creem.io/product/prod_1QoaqCLA6UqaNTBH76XzqZ';

  // Editorial Formats
  static const List<String> formatTags = [
    'diary',
    'comic',
    'newspaper',
    'magazine',
    'scrapbook',
  ];
}
