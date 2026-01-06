import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import 'login_screen.dart';
import 'remote_desktop_screen.dart';
import 'dart:async';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _apiService = ApiService();
  Map<String, dynamic>? _status;
  Map<String, dynamic> _commands = {};
  bool _isLoading = true;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _fetchData();
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) => _fetchData());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchData() async {
    final status = await _apiService.getStatus();
    final commands = await _apiService.fetchCommands();
    
    if (mounted) {
      setState(() {
        _status = status;
        _commands = commands;
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

  Future<void> _openRemoteDesktop() async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    scaffoldMessenger.showSnackBar(
      const SnackBar(content: Text('Starting Desktop Environment...')),
    );
    
    await _apiService.executeAction('start_desktop');
    
    String ip = 'localhost';
    try {
      final uri = Uri.parse(_apiService.baseUrl);
      ip = uri.host;
    } catch (e) {
      print("Error parsing IP: $e");
    }

    if (mounted) {
       Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => RemoteDesktopScreen(ipAddress: ip),
        ),
      );
    }
  }

  Future<void> _showAddCommandDialog() async {
    final nameController = TextEditingController();
    final commandController = TextEditingController();

    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[850],
        title: Text('New Action', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              style: TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Action Name (e.g. Ping Google)',
                labelStyle: TextStyle(color: Colors.grey),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.grey)),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              controller: commandController,
              style: TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Command (e.g. ping -c 3 google.com)',
                labelStyle: TextStyle(color: Colors.grey),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.grey)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isNotEmpty && commandController.text.isNotEmpty) {
                final success = await _apiService.addCommand(
                  nameController.text, 
                  commandController.text
                );
                if (success) {
                   _fetchData(); // Refresh list
                   if (context.mounted) Navigator.pop(context);
                } else {
                  // Show error? 
                }
              }
            },
            child: Text('Create'),
          ),
        ],
      ),
    );
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
    // Convert commands map to list for display
    final commandList = _commands.entries.toList();

    return Scaffold(
      backgroundColor: Colors.grey[900],
      appBar: AppBar(
        title: Text('Dashboard', style: GoogleFonts.outfit()),
        backgroundColor: Colors.grey[900],
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchData,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddCommandDialog,
        backgroundColor: Colors.blueAccent,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                   if (_status == null)
                     const Padding(
                       padding: EdgeInsets.only(bottom: 20),
                       child: Center(child: Text('Offline', style: TextStyle(color: Colors.red))),
                     ),
                  // Status Grid
                  if (_status != null)
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
                  
                  // Dynamic List
                  if (_commands.isEmpty)
                     const Center(child: Text("No actions available", style: TextStyle(color: Colors.grey))),

                  ...commandList.map((entry) {
                      final key = entry.key;
                      // Special handling for remote desktop button style if desired, 
                      // or just standard list tiles.
                      // Identify Remote Desktop by key if needed
                      if (key == 'start_desktop' || key == 'remote_desktop') {
                           return Padding(
                             padding: const EdgeInsets.only(bottom: 8.0),
                             child: ListTile(
                              tileColor: Colors.grey[800],
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              leading: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: Colors.red.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                                child: const Icon(Icons.desktop_windows, color: Colors.red),
                              ),
                              title: const Text('Remote Desktop', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              subtitle: const Text('Connect to Ubuntu GUI', style: TextStyle(color: Colors.grey)),
                              onTap: () => _openRemoteDesktop(),
                             ),
                           );
                      }

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: ListTile(
                          tileColor: Colors.grey[800],
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: Colors.blue.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                            child: const Icon(Icons.code, color: Colors.blue),
                          ),
                          title: Text(key.replaceAll('_', ' ').toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          subtitle: Text('Run $key', style: const TextStyle(color: Colors.grey)),
                          onTap: () => _executeAction(key, key),
                        ),
                      );
                  }).toList(),
                ],
              ),
            ),
    );
  }
}
