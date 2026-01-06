import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _urlController = TextEditingController();
  final _apiService = ApiService();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _autoConnect();
  }

  Future<void> _autoConnect() async {
    setState(() => _isLoading = true);
    final url = await _apiService.fetchConnectionUrl();
    if (url != null && mounted) {
      _urlController.text = url;
      _login(url); // Auto-login
    } else {
        if (mounted) {
             setState(() {
                _urlController.text = "https://"; // Fallback
                _isLoading = false;
             });
        }
    }
  }

  Future<void> _login(String urlOverride) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    String url = urlOverride.trim();
    if (url.isEmpty) {
        url = _urlController.text.trim();
    }
    
    // Auto-fix URL format
    if (!url.startsWith('http')) {
      url = 'https://$url';
    }
    if (url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
    }
    
    _apiService.setBaseUrl(url);

    // No actual login needed on backend now
    // Just verify connection by getting status
    final status = await _apiService.getStatus();

    setState(() {
      _isLoading = false;
    });

    if (status != null) {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const DashboardScreen()),
        );
      }
    } else {
      setState(() {
        _errorMessage = "Could not connect to Cloud OS. Check URL.";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[900],
      body: Center(
        child: SingleChildScrollView( 
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Icon(
                Icons.cloud_circle,
                size: 80,
                color: Colors.blueAccent,
              ),
              const SizedBox(height: 16),
              Text(
                'CloudOS Controller',
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
               const SizedBox(height: 48),
              if (_errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.redAccent),
                    textAlign: TextAlign.center,
                  ),
                ),
              // URL Input
               TextField(
                controller: _urlController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Cloud OS URL (from GitHub)',
                  hintText: 'https://....trycloudflare.com',
                  hintStyle: TextStyle(color: Colors.grey[600]),
                  labelStyle: const TextStyle(color: Colors.grey),
                  filled: true,
                  fillColor: Colors.grey[800],
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  prefixIcon: const Icon(Icons.link, color: Colors.blue),
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF3B82F6),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: _isLoading ? null : () => _login(_urlController.text),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : Text(
                          'Connect to Cloud',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
