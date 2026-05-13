import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/foundation.dart';

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});

class ApiService {
  late final Dio _dio;
  String? _accessToken;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://auction.autom8tr.com/api',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        if (_accessToken == null && !options.path.contains('/auth/login')) {
          await _login();
        }
        if (_accessToken != null) {
          options.headers['Authorization'] = 'Bearer $_accessToken';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        if (e.response?.statusCode == 401 && !e.requestOptions.path.contains('/auth/login')) {
          // Token might have expired, try to login again
          try {
            await _login();
            if (_accessToken != null) {
              final opts = e.requestOptions;
              opts.headers['Authorization'] = 'Bearer $_accessToken';
              final response = await _dio.fetch(opts);
              return handler.resolve(response);
            }
          } catch (loginError) {
             debugPrint('Auto-login failed: $loginError');
          }
        }
        return handler.next(e);
      }
    ));
  }

  Future<void> _login() async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: FormData.fromMap({
          'username': 'NorthFace32',
          'password': 'NorthFace32',
        }),
      );
      _accessToken = response.data['access_token'];
      debugPrint('Successfully authenticated with backend');
    } catch (e) {
      debugPrint('Login failed: $e');
      rethrow;
    }
  }

  Future<List<dynamic>> getItems() async {
    final response = await _dio.get('/items/');
    return response.data as List<dynamic>;
  }

  Future<List<dynamic>> getWatchlist() async {
    final response = await _dio.get('/items/watchlist');
    return response.data as List<dynamic>;
  }

  Future<void> toggleWatchStatus(int itemId, bool isWatched) async {
    await _dio.post('/items/$itemId/watch', data: {'is_watched': isWatched});
  }

  Future<List<dynamic>> getInventory() async {
    final response = await _dio.get('/inventory/');
    return response.data as List<dynamic>;
  }

  Future<void> saveCredentials(String auctionHouse, Map<String, dynamic> cookies, String? userAgent) async {
    await _dio.post('/credentials/', data: {
      'auction_house': auctionHouse,
      'cookies': cookies,
      'user_agent': userAgent,
    });
  }
}
