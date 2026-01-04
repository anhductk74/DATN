# Payment Result Controller - Hiển thị kết quả và redirect về app

## Tạo Controller mới

```java
package com.example.smart_mall_spring.Controllers;

import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
@Slf4j
public class PaymentResultController {

    @GetMapping("/payment-result")
    public void showPaymentResult(
            @RequestParam boolean success,
            @RequestParam String transactionCode,
            @RequestParam String message,
            HttpServletResponse response
    ) throws IOException {
        
        // Tạo deep link để mở app
        String deepLink = String.format(
                "smartmallshipper://payment-return?success=%s&transactionCode=%s&message=%s",
                success,
                transactionCode,
                URLEncoder.encode(message, StandardCharsets.UTF_8)
        );

        // Trả về HTML có script redirect về deep link
        String html = buildHtml(success, message, deepLink);
        
        response.setContentType("text/html; charset=UTF-8");
        response.getWriter().write(html);
    }

    private String buildHtml(boolean success, String message, String deepLink) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Kết quả thanh toán</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                    }
                    .container {
                        background: white;
                        border-radius: 20px;
                        padding: 40px;
                        max-width: 400px;
                        width: 100%%;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                        text-align: center;
                        animation: slideUp 0.5s ease-out;
                    }
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .icon {
                        width: 80px;
                        height: 80px;
                        margin: 0 auto 20px;
                        border-radius: 50%%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 40px;
                        animation: scaleIn 0.5s ease-out 0.2s both;
                    }
                    @keyframes scaleIn {
                        from {
                            transform: scale(0);
                        }
                        to {
                            transform: scale(1);
                        }
                    }
                    .icon.success {
                        background: #d4edda;
                        color: #28a745;
                    }
                    .icon.error {
                        background: #f8d7da;
                        color: #dc3545;
                    }
                    h2 {
                        font-size: 24px;
                        margin-bottom: 10px;
                        color: #333;
                    }
                    p {
                        color: #666;
                        font-size: 16px;
                        margin-bottom: 30px;
                        line-height: 1.5;
                    }
                    .btn {
                        display: inline-block;
                        background: #1976D2;
                        color: white;
                        padding: 14px 30px;
                        border-radius: 10px;
                        text-decoration: none;
                        font-weight: 600;
                        font-size: 16px;
                        transition: all 0.3s ease;
                        border: none;
                        cursor: pointer;
                    }
                    .btn:hover {
                        background: #1565C0;
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(25, 118, 210, 0.3);
                    }
                    .countdown {
                        margin-top: 20px;
                        font-size: 14px;
                        color: #999;
                    }
                    .spinner {
                        width: 30px;
                        height: 30px;
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #1976D2;
                        border-radius: 50%%;
                        animation: spin 1s linear infinite;
                        margin: 20px auto;
                    }
                    @keyframes spin {
                        0%% { transform: rotate(0deg); }
                        100%% { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon %s">
                        %s
                    </div>
                    <h2>%s</h2>
                    <p>%s</p>
                    <div class="spinner"></div>
                    <p class="countdown">Đang tự động mở ứng dụng...</p>
                    <button class="btn" onclick="openApp()">
                        Mở ứng dụng thủ công
                    </button>
                </div>

                <script>
                    const deepLink = '%s';
                    let countdown = 2;

                    function openApp() {
                        window.location.href = deepLink;
                        
                        // Fallback: Nếu không mở được app sau 3 giây
                        setTimeout(function() {
                            alert('Nếu ứng dụng không tự động mở, vui lòng mở lại SmartMall Shipper để xem kết quả thanh toán');
                        }, 3000);
                    }

                    // Tự động mở app sau 2 giây
                    const timer = setInterval(function() {
                        countdown--;
                        if (countdown <= 0) {
                            clearInterval(timer);
                            openApp();
                        }
                    }, 1000);
                </script>
            </body>
            </html>
            """,
            success ? "success" : "error",
            success ? "✓" : "✗",
            success ? "Thanh toán thành công!" : "Thanh toán thất bại",
            message,
            deepLink
        );
    }
}
```

## Tóm tắt flow hoàn chỉnh:

1. **User thanh toán** → VNPay redirect về `/mobile-redirect`
2. **VnPayController.mobileRedirect()** → Xử lý payment → Redirect về `/payment-result`
3. **PaymentResultController.showPaymentResult()** → Hiển thị HTML đẹp → Tự động redirect về deep link sau 2 giây
4. **Safari mở deep link** → App nhận → Hiển thị Alert kết quả

Tạo file `PaymentResultController.java` với code trên là xong!
