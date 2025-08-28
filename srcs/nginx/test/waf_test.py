#!/usr/bin/env python3

import requests
import urllib3
from urllib.parse import urlencode
import time

# Disable SSL warnings for self-signed certificates
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class WAFTester:
    def __init__(self, base_url="https://localhost"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.verify = False  # Ignore SSL certificate verification
        
    def test_request(self, endpoint="/test", params=None, description=""):
        """Test a single request and return results"""
        try:
            url = f"{self.base_url}{endpoint}"
            response = self.session.get(url, params=params, timeout=10)
            
            status = "✅ ALLOWED" if response.status_code == 200 else f"🚫 BLOCKED ({response.status_code})"
            print(f"{description:<30} | {status}")
            
            return response.status_code, response.text[:100]
            
        except requests.exceptions.RequestException as e:
            print(f"{description:<30} | ❌ ERROR: {e}")
            return None, str(e)
    
    def run_security_tests(self):
        """Run comprehensive security tests"""
        print("=" * 70)
        print("🛡️  ModSecurity WAF Security Tests")
        print("=" * 70)
        
        # Test normal requests first
        print("\n📋 Normal Requests (should be allowed):")
        self.test_request("/health", description="Health Check")
        self.test_request("/test", {"param": "normal_value"}, "Normal Parameter")
        
        print("\n🎯 SQL Injection Tests (should be blocked):")
        sql_payloads = [
            "1' OR 1=1",
            "1' UNION SELECT * FROM users--",
            "admin'--",
            "1; DROP TABLE users--",
            "' OR 'a'='a",
            "1' OR '1'='1'#",
            "UNION SELECT password FROM users",
            "1' AND SLEEP(5)--"
        ]
        
        for payload in sql_payloads:
            self.test_request("/test", {"param": payload}, f"SQL: {payload[:20]}...")
        
        print("\n🚨 XSS Tests (should be blocked):")
        xss_payloads = [
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert(1)>",
            "javascript:alert('xss')",
            "<svg onload=alert(1)>",
            "'><script>alert('xss')</script>",
            "<iframe src='javascript:alert(`xss`)'></iframe>",
            "<body onload=alert('xss')>"
        ]
        
        for payload in xss_payloads:
            self.test_request("/test", {"param": payload}, f"XSS: {payload[:20]}...")
            
        print("\n🔍 Path Traversal Tests (should be blocked):")
        traversal_payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "....//....//....//etc/passwd",
            "..%2f..%2f..%2fetc%2fpasswd"
        ]
        
        for payload in traversal_payloads:
            self.test_request("/test", {"param": payload}, f"Path: {payload[:20]}...")
            
        print("\n🌐 HTTP Method Tests:")
        methods_to_test = ["POST", "PUT", "DELETE"]
        for method in methods_to_test:
            try:
                response = self.session.request(method, f"{self.base_url}/test", 
                                              data={"param": "test"}, verify=False, timeout=10)
                status = "✅ ALLOWED" if response.status_code == 200 else f"🚫 BLOCKED/ERROR ({response.status_code})"
                print(f"{method + ' Method':<30} | {status}")
            except Exception as e:
                print(f"{method + ' Method':<30} | ❌ ERROR: {str(e)[:30]}...")

    def test_custom_rules(self):
        """Test your specific custom rules"""
        print("\n🎯 Testing Custom Rules:")
        print("-" * 50)
        
        # Test your custom SQL injection rule
        custom_sql = "SELECT user FROM database"
        self.test_request("/test", {"param": custom_sql}, "Custom SQL Rule")
        
        # Test your custom XSS rule  
        custom_xss = "<script src='evil.js'></script>"
        self.test_request("/test", {"param": custom_xss}, "Custom XSS Rule")

def main():
    print("🚀 Starting WAF Security Tests...")
    
    # Initialize tester
    tester = WAFTester("https://localhost")
    
    # Run all tests
    tester.run_security_tests()
    tester.test_custom_rules()
    
    print("\n" + "=" * 70)
    print("✅ Test completed! Check the results above.")
    print("🚫 BLOCKED responses indicate WAF is working correctly!")
    print("✅ ALLOWED responses for normal requests indicate proper functionality!")
    print("=" * 70)

if __name__ == "__main__":
    main()