import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final tokenController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  bool loading = false;
  String? error;
  String? success;

  InputDecoration inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(
        fontSize: 14,
        color: Color(0xFF999999),
      ),
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      filled: true,
      fillColor: Colors.white,
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: const BorderSide(color: Color(0xFFCCCCCC), width: 1),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: const BorderSide(color: Color(0xFFCCCCCC), width: 1),
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: const BorderSide(color: Color(0xFFCCCCCC), width: 1),
      ),
    );
  }

  Widget fieldLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Colors.black,
        ),
      ),
    );
  }

  Future<void> submit() async {
    FocusScope.of(context).unfocus();

    setState(() {
      error = null;
      success = null;
    });

    final tokenValue = tokenController.text.trim();
    final password = passwordController.text;
    final confirm = confirmPasswordController.text;

    if (tokenValue.isEmpty || password.isEmpty || confirm.isEmpty) {
      setState(() {
        error = 'All fields are required.';
      });
      return;
    }

    if (password != confirm) {
      setState(() {
        error = 'Passwords do not match.';
      });
      return;
    }

    setState(() {
      loading = true;
    });

    try {
      final message = await AuthService.resetPassword(tokenValue, password);
      if (!mounted) return;

      setState(() {
        success = message;
      });
    } catch (e) {
      setState(() {
        error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (!mounted) return;
      setState(() {
        loading = false;
      });
    }
  }

  @override
  void dispose() {
    tokenController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SingleChildScrollView(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 400),
            margin: const EdgeInsets.symmetric(horizontal: 24),
            padding: const EdgeInsets.all(40),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                const Text(
                  'Reset Password',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                ),
                const SizedBox(height: 14),
                const Text(
                  'Paste your reset token and choose a new password.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF666666),
                  ),
                ),
                const SizedBox(height: 30),
                fieldLabel('Reset Token'),
                TextField(
                  controller: tokenController,
                  decoration: inputDecoration('Paste reset token'),
                ),
                const SizedBox(height: 20),
                fieldLabel('New Password'),
                TextField(
                  controller: passwordController,
                  obscureText: true,
                  decoration: inputDecoration('Enter new password'),
                ),
                const SizedBox(height: 20),
                fieldLabel('Confirm Password'),
                TextField(
                  controller: confirmPasswordController,
                  obscureText: true,
                  decoration: inputDecoration('Confirm new password'),
                ),
                const SizedBox(height: 24),
                if (error != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(
                      error!,
                      style: const TextStyle(color: Colors.red, fontSize: 14),
                    ),
                  ),
                if (success != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(
                      success!,
                      style: const TextStyle(
                        color: Colors.green,
                        fontSize: 14,
                      ),
                    ),
                  ),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: loading ? null : submit,
                    style: ElevatedButton.styleFrom(
                      elevation: 0,
                      backgroundColor: const Color(0xFF007BFF),
                      foregroundColor: Colors.white,
                      disabledBackgroundColor:
                          const Color(0xFF007BFF).withAlpha(179),
                      disabledForegroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      textStyle: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    child: Text(loading ? 'Resetting...' : 'Reset Password'),
                  ),
                ),
                const SizedBox(height: 20),
                Center(
                  child: RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF666666),
                      ),
                      children: [
                        const TextSpan(text: 'Back to '),
                        TextSpan(
                          text: 'login',
                          style: const TextStyle(
                            color: Color(0xFF007BFF),
                            fontWeight: FontWeight.w500,
                          ),
                          recognizer: TapGestureRecognizer()
                            ..onTap = () {
                              Navigator.pushReplacementNamed(context, '/login');
                            },
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
