import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../widgets/auction_login_webview.dart';
import '../../../services/api_client.dart';

class StoreScreen extends ConsumerWidget {
  const StoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final apiService = ref.read(apiServiceProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Store Dashboard'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.storefront, size: 80, color: Colors.black54),
              const SizedBox(height: 16),
              const Text(
                'Auction Connections',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Connect your auction house accounts to sync your active bids and extract session cookies for the backend scraper.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.black54),
              ),
              const SizedBox(height: 48),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.link),
                label: const Text('Connect Public Surplus'),
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => AuctionLoginWebView(
                        targetUrl: 'https://www.publicsurplus.com/sms/login/login',
                        onCookiesExtracted: (cookies, userAgent) async {
                          try {
                            await apiService.saveCredentials('public_surplus', cookies, userAgent);
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Credentials securely saved to backend!')),
                              );
                              Navigator.of(context).pop(); // Close webview
                            }
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Failed to save credentials: $e')),
                              );
                            }
                          }
                        },
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
