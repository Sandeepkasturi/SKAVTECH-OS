import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart' as mobile;
import 'package:webview_windows/webview_windows.dart' as desktop;
import 'package:google_fonts/google_fonts.dart';
import 'dart:io';

class RemoteDesktopScreen extends StatefulWidget {
  final String ipAddress;
  final String port;

  const RemoteDesktopScreen({
    super.key,
    required this.ipAddress, // e.g. "192.168.1.5"
    this.port = "6080",
  });

  @override
  State<RemoteDesktopScreen> createState() => _RemoteDesktopScreenState();
}

class _RemoteDesktopScreenState extends State<RemoteDesktopScreen> {
  // Mobile Controller
  mobile.WebViewController? _mobileController;
  
  // Windows Controller
  desktop.WebviewController? _desktopController;
  
  bool _isLoading = true;
  bool _isWindows = false;

  @override
  void initState() {
    super.initState();
    _isWindows = Platform.isWindows;
    _initWebView();
  }

  Future<void> _initWebView() async {
    final urlStr = 'http://${widget.ipAddress}:${widget.port}/vnc_lite.html';
    
    if (_isWindows) {
      // Windows Initialization
      _desktopController = desktop.WebviewController();
      
      try {
        await _desktopController!.initialize();
        _desktopController!.url.listen((url) {
          // Page load listener if needed
        });
        await _desktopController!.loadUrl(urlStr);
        if (mounted) setState(() => _isLoading = false);
      } catch (e) {
        print("Error initializing Windows WebView: $e");
      }
    } else {
      // Mobile Initialization
      _mobileController = mobile.WebViewController()
        ..setJavaScriptMode(mobile.JavaScriptMode.unrestricted)
        ..setBackgroundColor(const Color(0x00000000))
        ..setNavigationDelegate(
          mobile.NavigationDelegate(
            onPageFinished: (String url) {
               if (mounted) setState(() => _isLoading = false);
            },
          ),
        )
        ..loadRequest(Uri.parse(urlStr));
    }
  }
  
  @override
  void dispose() {
    _desktopController?.dispose();
    super.dispose();
  }

  void _reload() {
    if (_isWindows) {
      _desktopController?.reload();
    } else {
      _mobileController?.reload();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Remote Desktop', style: GoogleFonts.outfit()),
        backgroundColor: Colors.grey[900],
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _reload(),
          )
        ],
      ),
      body: Stack(
        children: [
          if (_isWindows)
             _desktopController != null && _desktopController!.value.isInitialized
                ? desktop.Webview(_desktopController!)
                : const Center(child: Text("Initializing Windows WebView...", style: TextStyle(color: Colors.white)))
          else
            if (_mobileController != null)
              mobile.WebViewWidget(controller: _mobileController!),

          if (_isLoading)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
