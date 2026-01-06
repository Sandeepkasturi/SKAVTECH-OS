import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import 'login_screen.dart';
import 'dart:async';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _apiService = ApiService();
  Map<String, dynamic>? _status;
  bool _isLoading = true;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _fetchStatus();
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) => _fetchStatus());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchStatus() async {
    final status = await _apiService.getStatus();
    if (mounted) {
      if (status == null) {
        // If status is null (likely 401), we might want to redirect to login or show error
        // For now, just show error
      }
      setState(() {
        _status = status;
        _isLoading = false;
      });
    }
  }

  Future<void> _logout() async {
    await _apiService.logout();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  Future<void> _executeAction(String command, String label) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    
    // Show confirmation
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[850], // Dark mode
        title: Text('Confirm Action', style: TextStyle(color: Colors.white)),
        content: Text('Are you sure you want to $label?', style: TextStyle(color: Colors.grey[300])),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.redAccent),
            child: const Text('Execute'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    scaffoldMessenger.showSnackBar(
      const SnackBar(content: Text('Executing...')),
    );

    final result = await _apiService.executeAction(command);

    if (result['status'] == 'success') {
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Success: \n${result['stdout']}'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Failed: ${result['error']}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Widget _buildStatusCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const Spacer(),
          Text(
            value,
            style: GoogleFonts.outfit(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            title,
            style: GoogleFonts.outfit(
              color: Colors.grey[400],
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[900],
      appBar: AppBar(
        title: Text('Dashboard', style: GoogleFonts.outfit()),
        backgroundColor: Colors.grey[900],
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchStatus,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _status == null
              ? Center(child: Text('Offline / Connection Error', style: TextStyle(color: Colors.white)))
              : RefreshIndicator(
                  onRefresh: _fetchStatus,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Status Grid
                      GridView.count(
                        shrinkWrap: true,
                        crossAxisCount: 2,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 1.3,
                        physics: const NeverScrollableScrollPhysics(),
                        children: [
                          _buildStatusCard('CPU Usage', _status!['cpu_usage'] ?? 'N/A', Icons.memory, Colors.blue),
                          _buildStatusCard('RAM Usage', _status!['ram_usage'] ?? 'N/A', Icons.storage, Colors.orange),
                          _buildStatusCard('Disk Usage', _status!['disk_usage'] ?? 'N/A', Icons.disc_full, Colors.purple),
                          _buildStatusCard('OS Status', 'Active', Icons.check_circle, Colors.green),
                        ],
                      ),
                      const SizedBox(height: 32),
                      Text(
                        'Actions',
                        style: GoogleFonts.outfit(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Action Buttons
                      ListTile(
                        tileColor: Colors.grey[800],
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.blue.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                          child: const Icon(Icons.refresh, color: Colors.blue),
                        ),
                        title: const Text('Restart Nginx', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        subtitle: const Text('Restart the web server', style: TextStyle(color: Colors.grey)),
                        onTap: () => _executeAction('restart_nginx', 'Restart Nginx'),
                      ),
                      const SizedBox(height: 8),
                      ListTile(
                        tileColor: Colors.grey[800],
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.purple.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                          child: const Icon(Icons.description, color: Colors.purple),
                        ),
                        title: const Text('Get System Logs', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        subtitle: const Text('Tail last 50 lines of syslog', style: TextStyle(color: Colors.grey)),
                        onTap: () => _executeAction('get_logs', 'fetch logs'),
                      ),
                      const SizedBox(height: 8),
                      ListTile(
                        tileColor: Colors.grey[800],
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.green.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                          child: const Icon(Icons.info_outline, color: Colors.green),
                        ),
                        title: const Text('Check User', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        subtitle: const Text('Run whoami', style: TextStyle(color: Colors.grey)),
                        onTap: () => _executeAction('whoami', 'check user'),
                      ),
                    ],
                  ),
                ),
    );
  }
}
