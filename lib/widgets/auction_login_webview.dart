import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class AuctionLoginWebView extends StatefulWidget {
  final String targetUrl;
  final void Function(Map<String, String> cookies, String userAgent) onCookiesExtracted;

  const AuctionLoginWebView({
    Key? key,
    required this.targetUrl,
    required this.onCookiesExtracted,
  }) : super(key: key);

  @override
  State<AuctionLoginWebView> createState() => _AuctionLoginWebViewState();
}

class _AuctionLoginWebViewState extends State<AuctionLoginWebView> {
  final GlobalKey webViewKey = GlobalKey();
  InAppWebViewController? webViewController;
  CookieManager cookieManager = CookieManager.instance();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Auction Login'),
      ),
      body: InAppWebView(
        key: webViewKey,
        initialUrlRequest: URLRequest(url: WebUri(widget.targetUrl)),
        initialSettings: InAppWebViewSettings(
          javaScriptEnabled: true,
          useShouldOverrideUrlLoading: true,
          mediaPlaybackRequiresUserGesture: false,
        ),
        onWebViewCreated: (controller) {
          webViewController = controller;
        },
        onLoadStop: (controller, url) async {
          if (url != null) {
            final cookies = await cookieManager.getCookies(url: url);
            final userAgent = await controller.evaluateJavascript(source: 'navigator.userAgent') as String? ?? '';
            
            final Map<String, String> cookieMap = {};
            for (var cookie in cookies) {
              cookieMap[cookie.name] = cookie.value.toString();
            }

            debugPrint('Extracted Cookies: $cookieMap');
            debugPrint('Extracted User-Agent: $userAgent');

            widget.onCookiesExtracted(cookieMap, userAgent);
          }
        },
      ),
    );
  }
}
