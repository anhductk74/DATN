from flask import Flask, request, jsonify
from flask_cors import CORS
import os, datetime, json, requests, uuid, base64, shutil
import mysql.connector
from dotenv import load_dotenv
from urllib.parse import urlparse

# ==========================================================
# ⚙️ CẤU HÌNH CƠ BẢN
# ==========================================================
load_dotenv()
app = Flask(__name__)
CORS(app)

URL_IMAGE = "https://res.cloudinary.com"
IMAGES_DIR = "api_gemini/images/"
if not os.path.exists(IMAGES_DIR):
    os.makedirs(IMAGES_DIR)

# ==========================================================
# 🧩 CACHE DỮ LIỆU
# ==========================================================
product_cache = {'result': None, 'columns': None, 'last_update': None}


# ==========================================================
# 📦 LẤY DANH SÁCH SẢN PHẨM
# ==========================================================
def get_products():
    now = datetime.datetime.now()
    if product_cache['result'] and product_cache['last_update']:
        delta = now - product_cache['last_update']
        if delta.total_seconds() < 900:
            return product_cache['result'], product_cache['columns']

    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
        )
        cursor = conn.cursor()
        query = '''
            SELECT 
                p.id AS product_id,
                p.name AS product_name,
                p.description,
                p.brand,
                p.status,
                c.name AS category_name,
                s.name AS shop_name,
                s.id AS shop_id,
                c.id AS category_id,
                GROUP_CONCAT(DISTINCT pi.image_url SEPARATOR ',') AS images,
                MIN(v.price) AS min_price,
                MAX(v.price) AS max_price,
                COUNT(DISTINCT r.id) AS review_count,
                ROUND(AVG(r.rating), 1) AS average_rating
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN shops s ON p.shop_id = s.id
            LEFT JOIN product_variants v ON p.id = v.product_id
            LEFT JOIN reviews r ON p.id = r.product_id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.is_deleted = 0
            GROUP BY p.id
            HAVING min_price IS NOT NULL
            ORDER BY average_rating DESC;
        '''
        cursor.execute(query)
        result = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        cursor.close()
        conn.close()
        product_cache.update({'result': result, 'columns': columns, 'last_update': now})
        return result, columns
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        return [], None


# ==========================================================
# 📥 XỬ LÝ ẢNH
# ==========================================================
def download_media_file(url, filename):
    try:
        filepath = os.path.join(IMAGES_DIR, filename)
        response = requests.get(url, stream=True)
        response.raise_for_status()
        with open(filepath, 'wb') as f:
            shutil.copyfileobj(response.raw, f)
        return filepath
    except Exception as e:
        print(f"[ERROR] Download {url}: {e}")
        return None


def cleanup_media_files(filepaths):
    for f in filepaths:
        try:
            if os.path.exists(f):
                os.remove(f)
        except:
            pass


# ==========================================================
# 📜 PROMPT DUYỆT SẢN PHẨM (TRẢ JSON ĐÚNG DTO)
# ==========================================================
def load_approval_prompt():
    paths = ["promt_approval.md", "./promt_approval.md", "api_gemini/promt_approval.md"]
    for p in paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                content = f.read()
                if content.strip():
                    content += """

## ⚠️ RETURN JSON FORMAT ONLY (MATCH SPRING BOOT DTOs):
{
  "categoryId": "uuid",
  "shopId": "uuid",
  "name": "string",
  "description": "string",
  "brand": "string",
  "status": "ACTIVE",
  "variants": [
    {
      "sku": "string",
      "price": 0.0,
      "stock": 0,
      "weight": 0.0,
      "dimensions": "string",
      "attributes": [
        { "attributeName": "string", "attributeValue": "string" }
      ]
    }
  ]
}
Return strictly this JSON only, no markdown or explanation.
"""
                    return content
    return None


# ==========================================================
# ✅ DUYỆT SẢN PHẨM BẰNG GEMINI
# ==========================================================
def approve_product_with_gemini(product_data, prompt):
    media_urls = [f"{URL_IMAGE}{url}" for url in product_data.get("images", []) if url]
    downloaded = []
    for i, url in enumerate(media_urls):
        parsed = urlparse(url)
        filename = os.path.basename(parsed.path) or f"product_{product_data.get('id', 'unknown')}_{i}.jpg"
        path = download_media_file(url, filename)
        if path:
            downloaded.append(path)

    product_info = f"""
Product approval request:
- Name: {product_data.get('name', '')}
- Brand: {product_data.get('brand', '')}
- CategoryId: {product_data.get('categoryId', '')}
- ShopId: {product_data.get('shopId', '')}
- Description: {product_data.get('description', '')[:500]}
- Price range: {product_data.get('priceMin', 0)} - {product_data.get('priceMax', 0)} VND
Images:
{chr(10).join(['- ' + os.path.basename(f) for f in downloaded])}
"""

    full_prompt = f"{prompt}\n\n{product_info}\n\nEvaluate and return JSON strictly matching CreateProductDto."

    API_KEY = os.getenv("API_KEY")
    URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

    parts = [{"text": full_prompt}]
    for path in downloaded:
        try:
            with open(path, "rb") as f:
                parts.append({
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": base64.b64encode(f.read()).decode("utf-8")
                    }
                })
        except:
            pass

    payload = {"contents": [{"parts": parts}]}
    headers = {"Content-Type": "application/json"}

    try:
        resp = requests.post(URL, headers=headers, data=json.dumps(payload), timeout=20)
        resp.raise_for_status()
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        text = text.split('```json')[-1].split('```')[0].strip() if '```' in text else text
        start, end = text.find('{'), text.rfind('}') + 1
        parsed = json.loads(text[start:end])
        return parsed
    except Exception as e:
        print("[ERROR]", e)
        return {"error": f"AI parse error: {str(e)}"}
    finally:
        cleanup_media_files(downloaded)


# ==========================================================
# 🧠 API DUYỆT SẢN PHẨM
# ==========================================================
@app.route("/ai_approval", methods=["POST"])
def ai_approval():
    """
    Input JSON:
    {
        "categoryId": "uuid",
        "shopId": "uuid",
        "name": "string",
        "brand": "string",
        "description": "string",
        "priceMin": 100000,
        "priceMax": 200000,
        "images": ["/image/upload/abc.jpg"]
    }
    """
    try:
        product_data = request.get_json()
        required = ["categoryId", "shopId", "name", "brand", "description", "images"]
        missing = [f for f in required if f not in product_data]
        if missing:
            return jsonify({"error": f"Missing: {', '.join(missing)}"}), 400

        prompt = load_approval_prompt()
        if not prompt:
            return jsonify({"error": "Missing promt_approval.md"}), 500

        result = approve_product_with_gemini(product_data, prompt)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================================
# 🤖 AI TRỢ LÝ MUA SẮM (SMART-MALL CHATBOT)
# ==========================================================
@app.route('/ai_chatbot', methods=['POST'])
def ai_chatbot():
    data = request.get_json()
    history = data.get("history", [])

    result, columns = get_products()
    if not result or not columns:
        return jsonify({"reply": "⚠️ Cannot fetch product data from database."}), 500

    # 🧩 Dạng hiển thị markdown card
    products_text = ""
    for row in result:
        info = {col: str(val) if val not in [None, 'None'] else '' for col, val in zip(columns, row)}
        product_id = info.get('product_id', '')
        if isinstance(row[0], bytes) and len(row[0]) == 16:
            product_id = str(uuid.UUID(bytes=row[0]))

        image_url = ""
        if info.get("images"):
            image_list = info["images"].split(",")
            image_url = image_list[0].strip() if image_list else ""
        if image_url and not image_url.startswith("https://res.cloudinary.com"):
            image_url = f"https://res.cloudinary.com/{image_url}"

        link = f"http://localhost:3000/product/{product_id}"

        products_text += (
            f"🛍 **{info.get('product_name', 'Unnamed Product')}**\n"
        )
        if image_url:
            products_text += f"![Product Image]({image_url})\n"
        products_text += (
            f"💰 **Price:** {info.get('min_price', '0')} - {info.get('max_price', '0')} VNĐ\n"
            f"🏷 Brand: {info.get('brand', 'Unknown')}\n"
            f"⭐ Rating: {info.get('average_rating', '0')} ({info.get('review_count', '0')} reviews)\n"
            f"🏪 Shop: {info.get('shop_name', 'N/A')}\n"
            f"🔗 [View Product]({link})\n\n"
        )

    if not history or 'Smart-mall Shopping Assistant' not in str(history[0]):
        initial_prompt = (
            "You are **Smart-mall Shopping Assistant**, an AI helping customers discover products.\n"
            "- Respond in English.\n"
            "- Recommend items and describe them clearly.\n"
            "- Always display results in Markdown card format (with image, price, and link).\n"
            "- If data is missing, say: 'Sorry, no matching product found.'\n\n"
            f"Here is the current catalog:\n\n{products_text}"
        )
        history = [{'role': 'user', 'text': initial_prompt}] + history

    API_KEY = os.getenv("API_KEY")
    MODEL = "gemini-2.0-flash"
    URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

    parts = []
    for turn in history:
        if turn['role'] == 'user':
            parts.append({"text": f"User: {turn['text']}"})
        else:
            parts.append({"text": turn['text']})

    payload = {"contents": [{"parts": parts}]}
    headers = {"Content-Type": "application/json"}

    try:
        resp = requests.post(URL, headers=headers, data=json.dumps(payload), timeout=15)
        resp.raise_for_status()
        result = resp.json()
        reply = result["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        reply = f"Error calling Gemini API: {str(e)}"

    return jsonify({"reply": reply})


# ==========================================================
# 🚀 CHẠY SERVER
# ==========================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os, datetime, json, requests, uuid
# import mysql.connector
# from dotenv import load_dotenv

# # Load .env
# load_dotenv()

# app = Flask(__name__)
# CORS(app)

# # Cache
# product_cache = {
#     'result': None,
#     'columns': None,
#     'last_update': None
# }

# # --------------------------------------
# # 🧩 LẤY DỮ LIỆU SẢN PHẨM
# # --------------------------------------
# def get_products():
#     now = datetime.datetime.now()
#     if product_cache['result'] and product_cache['last_update']:
#         delta = now - product_cache['last_update']
#         if delta.total_seconds() < 900:
#             return product_cache['result'], product_cache['columns']

#     host = os.getenv("DB_HOST")
#     port = os.getenv("DB_PORT")
#     database = os.getenv("DB_NAME")
#     user = os.getenv("DB_USER")
#     password = os.getenv("DB_PASSWORD")

#     # ✅ Có thể bật/tắt JOIN product_images tùy DB của bạn
#     query = '''
#         SELECT 
#             p.id AS product_id,
#             p.name AS product_name,
#             p.description,
#             p.brand,
#             p.status,
#             p.is_deleted,
#             c.name AS category_name,
#             s.name AS shop_name,
#             s.avatar AS shop_avatar,
#             s.phone_number AS shop_phone,
#             GROUP_CONCAT(DISTINCT pi.image_url SEPARATOR ',') AS images,
#             MIN(v.price) AS min_price,
#             MAX(v.price) AS max_price,
#             COUNT(DISTINCT r.id) AS review_count,
#             ROUND(AVG(r.rating), 1) AS average_rating
#         FROM products p
#         LEFT JOIN categories c ON p.category_id = c.id
#         LEFT JOIN shops s ON p.shop_id = s.id
#         LEFT JOIN product_variants v ON p.id = v.product_id
#         LEFT JOIN reviews r ON p.id = r.product_id
#         LEFT JOIN product_images pi ON p.id = pi.product_id  -- Nếu có bảng ảnh
#         WHERE p.is_deleted = 0
#         GROUP BY p.id
#         HAVING min_price IS NOT NULL
#         ORDER BY average_rating DESC;
#     '''

#     try:
#         conn = mysql.connector.connect(
#             host=host, user=user, port=port,
#             password=password, database=database
#         )
#         cursor = conn.cursor()
#         cursor.execute(query)
#         result = cursor.fetchall()
#         columns = [desc[0] for desc in cursor.description]
#         cursor.close()
#         conn.close()

#         product_cache['result'] = result
#         product_cache['columns'] = columns
#         product_cache['last_update'] = now

#         return result, columns
#     except Exception as e:
#         print(f"[ERROR] Database connection failed: {e}")
#         return [], None


# # --------------------------------------
# # 🤖 CHATBOT - SMART-MALL SHOPPING ASSISTANT
# # --------------------------------------
# @app.route('/ai_chatbot', methods=['POST'])
# def ai_chatbot():
#     data = request.get_json()
#     history = data.get("history", [])

#     result, columns = get_products()
#     if not result or not columns:
#         return jsonify({"reply": "⚠️ Cannot fetch product data from database."}), 500

#     # ✅ Dữ liệu hiển thị dưới dạng từng card Markdown
#     products_text = ""
#     for row in result:
#         info = {col: str(val) if val not in [None, 'None'] else '' for col, val in zip(columns, row)}

#         # Xử lý UUID hoặc ID bytes
#         product_id = info.get('product_id', '')
#         if isinstance(row[0], bytes) and len(row[0]) == 16:
#             product_id = str(uuid.UUID(bytes=row[0]))

#         # Lấy ảnh Cloudinary
#         image_url = ""
#         if info.get("images"):
#             image_list = info["images"].split(",")
#             image_url = image_list[0].strip() if image_list else ""
#         if image_url and not image_url.startswith("https://res.cloudinary.com"):
#             image_url = f"https://res.cloudinary.com/{image_url}"

#         # Link sản phẩm
#         link = f"http://localhost:3000/product/{product_id}"

#         # Card hiển thị đẹp
#         products_text += (
#             f"🛍 **{info.get('product_name', 'Unnamed Product')}**\n"
#         )
#         if image_url:
#             products_text += f"![Product Image]({image_url})\n"
#         products_text += (
#             f"💰 **Price:** {info.get('min_price', '0')} - {info.get('max_price', '0')} VNĐ\n"
#             f"🏷 Brand: {info.get('brand', 'Unknown')}\n"
#             f"⭐ Rating: {info.get('average_rating', '0')} ({info.get('review_count', '0')} reviews)\n"
#             f"🏪 Shop: {info.get('shop_name', 'N/A')}\n"
#             f"🔗 [View Product]({link})\n\n"
#         )

#     # Prompt khởi tạo nếu là lần đầu
#     if not history or 'Smart-mall Shopping Assistant' not in str(history[0]):
#         initial_prompt = (
#             "You are **Smart-mall Shopping Assistant**, an AI helping customers discover products.\n"
#             "- Respond in English.\n"
#             "- Recommend items and describe them clearly.\n"
#             "- Always display results in Markdown card format (with image, price, and link).\n"
#             "- If data is missing, say: 'Sorry, no matching product found.'\n\n"
#             f"Here is the current catalog:\n\n{products_text}"
#         )
#         history = [{'role': 'user', 'text': initial_prompt}] + history

#     # Gửi request đến Gemini API
#     API_KEY = os.getenv("API_KEY")
#     MODEL = "gemini-2.0-flash"
#     URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

#     parts = []
#     for turn in history:
#         if turn['role'] == 'user':
#             parts.append({"text": f"User: {turn['text']}"})
#         else:
#             parts.append({"text": turn['text']})

#     payload = {"contents": [{"parts": parts}]}
#     headers = {"Content-Type": "application/json"}

#     try:
#         resp = requests.post(URL, headers=headers, data=json.dumps(payload), timeout=15)
#         resp.raise_for_status()
#         result = resp.json()
#         reply = result["candidates"][0]["content"]["parts"][0]["text"]
#     except Exception as e:
#         reply = f"Error calling Gemini API: {str(e)}"

#     return jsonify({"reply": reply})


# # --------------------------------------
# # 🚀 CHẠY FLASK SERVER
# # --------------------------------------
# if __name__ == '__main__':
#     app.run(host="0.0.0.0", port=5001, debug=True)
