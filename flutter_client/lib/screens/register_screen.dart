import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final username = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  final confirmPassword = TextEditingController();

  bool loading = false;
  String? error;

  Future<void> registerUser() async {
    setState(() => error = null);

    if (username.text.isEmpty ||
        email.text.isEmpty ||
        password.text.isEmpty) {
      setState(() => error = "All fields required.");
      return;
    }

    if (password.text != confirmPassword.text) {
      setState(() => error = "Passwords do not match.");
      return;
    }

    setState(() => loading = true);

    try {
      await AuthService.register(
          username.text, email.text, password.text);

      if (!mounted) return;

      Navigator.pushReplacementNamed(context, '/login');
    } catch (e) {
      setState(() => error = e.toString().replaceFirst("Exception: ", ""));
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Container(
          width: 400,
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text("Create Account", style: TextStyle(fontSize: 28)),
              const SizedBox(height: 30),

              TextField(
                controller: username,
                decoration: const InputDecoration(labelText: "Username"),
              ),

              const SizedBox(height: 20),

              TextField(
                controller: email,
                decoration: const InputDecoration(labelText: "Email"),
              ),

              const SizedBox(height: 20),

              TextField(
                controller: password,
                obscureText: true,
                decoration: const InputDecoration(labelText: "Password"),
              ),

              const SizedBox(height: 20),

              TextField(
                controller: confirmPassword,
                obscureText: true,
                decoration:
                    const InputDecoration(labelText: "Confirm Password"),
              ),

              const SizedBox(height: 20),

              if (error != null)
                Text(error!, style: const TextStyle(color: Colors.red)),

              const SizedBox(height: 20),

              ElevatedButton(
                onPressed: loading ? null : registerUser,
                child: Text(loading ? "Registering..." : "Register"),
              ),

              TextButton(
                onPressed: () =>
                    Navigator.pushReplacementNamed(context, '/login'),
                child: const Text("Login here"),
              )
            ],
          ),
        ),
      ),
    );
  }
}
