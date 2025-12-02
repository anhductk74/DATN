from flask import Flask, request, jsonify
from flask_cors import CORS
import os, datetime, json, requests, uuid, base64, shutil
import pymysql
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
        conn = pymysql.connect(
            host=os.getenv("DB_HOST"),
            port=int(os.getenv("DB_PORT", 3306)),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            charset='utf8mb4'
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
    try:
        data = request.get_json()
        history = data.get("history", [])

        result, columns = get_products()
        if not result or not columns:
            return jsonify({
                "success": False,
                "message": "Cannot fetch product data from database.",
                "reply": "⚠️ Không thể lấy dữ liệu sản phẩm từ database.",
                "products": []
            }), 500

        # Helper functions cho safe conversion
        def safe_float(val, default=0.0):
            try:
                return float(val) if val and val != '' else default
            except (ValueError, TypeError):
                return default
        
        def safe_int(val, default=0):
            try:
                return int(val) if val and val != '' else default
            except (ValueError, TypeError):
                return default

        # 🧩 Chuẩn bị dữ liệu sản phẩm
        products_list = []
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

            product_obj = {
                "id": str(product_id),
                "name": info.get('product_name', 'Unnamed Product'),
                "image": image_url if image_url else "",
                "minPrice": safe_float(info.get('min_price')),
                "maxPrice": safe_float(info.get('max_price')),
                "brand": info.get('brand') or 'Unknown',
                "rating": safe_float(info.get('average_rating')),
                "reviewCount": safe_int(info.get('review_count')),
                "shopName": info.get('shop_name') or 'N/A',
                "link": f"http://localhost:3000/product/{product_id}",
                "category": info.get('category_name', '')
            }
            products_list.append(product_obj)

            # Compact text cho AI
            products_text += f"{product_obj['name']} | {product_obj['brand']} | {product_obj['category']} | {product_obj['minPrice']}-{product_obj['maxPrice']} VNĐ\n"

        # System prompt với instruction rõ ràng
        if not history or 'Smart-mall Shopping Assistant' not in str(history[0]):
            initial_prompt = (
                "Bạn là **Trợ lý mua sắm Smart-mall**.\n\n"
                "**NHIỆM VỤ:**\n"
                "1. Khi khách hỏi về sản phẩm (ví dụ: 'tìm tai nghe', 'điện thoại giá rẻ', 'laptop'), bạn phải:\n"
                "   - Phân tích yêu cầu (loại sản phẩm, giá, thương hiệu)\n"
                "   - Tìm 3-5 sản phẩm PHÙ HỢP NHẤT từ danh mục\n"
                "   - Trả lời bằng tiếng Việt, giới thiệu ngắn gọn\n"
                "   - KẾT THÚC bằng dòng: PRODUCTS:[id1,id2,id3]\n\n"
                "2. Với câu chào hỏi thông thường ('xin chào', 'cảm ơn'), trả lời thân thiện KHÔNG cần gợi ý sản phẩm.\n\n"
                "3. Nếu không tìm thấy sản phẩm phù hợp, nói: 'Xin lỗi, hiện không có sản phẩm phù hợp.'\n\n"
                f"**DANH MUC SẢN PHẨM:**\n{products_text}\n"
                "**LƯU Ý:** Luôn ưu tiên sản phẩm có rating cao, giá phù hợp với yêu cầu."
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
            
            # 🔍 Extract recommended product IDs - Hỗ trợ nhiều format
            recommended_products = []
            if "PRODUCTS:" in reply or "RECOMMEND_PRODUCTS:" in reply:
                import re
                # Tìm pattern PRODUCTS:[id1,id2,id3] hoặc RECOMMEND_PRODUCTS: [id1, id2, id3]
                patterns = [
                    r'PRODUCTS:\s*\[(.*?)\]',
                    r'RECOMMEND_PRODUCTS:\s*\[(.*?)\]',
                    r'PRODUCTS:\s*([a-f0-9\-,\s]+)',
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, reply, re.IGNORECASE)
                    if match:
                        ids_str = match.group(1)
                        # Parse IDs (hỗ trợ cả có/không có dấu ngoặc vuông)
                        product_ids = [pid.strip().strip('"').strip("'") for pid in ids_str.split(',') if pid.strip()]
                        recommended_products = [p for p in products_list if p['id'] in product_ids]
                        # Remove the PRODUCTS/RECOMMEND_PRODUCTS line from reply
                        reply = re.sub(r'(PRODUCTS|RECOMMEND_PRODUCTS):\s*\[?[^\n]*\]?\n?', '', reply, flags=re.IGNORECASE).strip()
                        break
            
            # Nếu AI không trả về IDs nhưng có mention product names, tự động match
            if not recommended_products and len(reply) > 50:  # Có content dài → có thể đang recommend
                mentioned_products = []
                for product in products_list:
                    # Check if product name được mention trong reply
                    if product['name'].lower() in reply.lower():
                        mentioned_products.append(product)
                
                # Lấy tối đa 5 sản phẩm được mention
                if mentioned_products:
                    recommended_products = mentioned_products[:5]
            
            response_data = {
                "success": True,
                "reply": reply,
                "products": recommended_products,
                "timestamp": datetime.datetime.now().isoformat()
            }
            return jsonify(response_data), 200
            
        except Exception as e:
            print(f"[ERROR] Gemini API: {str(e)}")
            response_data = {
                "success": False,
                "reply": f"Lỗi kết nối AI: {str(e)}",
                "products": [],
                "error": str(e)
            }
            return jsonify(response_data), 500
            
    except Exception as e:
        print(f"[ERROR] ai_chatbot endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "reply": "Đã xảy ra lỗi khi xử lý yêu cầu.",
            "products": [],
            "error": str(e)
        }), 500


# ==========================================================
# 🎨 HELPER FUNCTIONS CHO FASHION API
# ==========================================================
def extract_garment_internal(garment_image_path, garment_type, garment_name, custom_prompt=None):
    """
    Internal helper: Extract specific garment from photo using Gemini
    Returns: path to extracted garment image
    """
    from google import genai
    from PIL import Image
    
    API_KEY = os.getenv("API_KEY")
    client = genai.Client(api_key=API_KEY)
    
    user_hint = ""
    if custom_prompt:
        user_hint = f"\nIMPORTANT USER HINT: The user has specifically described this item as: \"{custom_prompt}\". Prioritize this description when identifying the item."
    
    prompt = f"""
You are a professional fashion image editor.
Task: Isolate the "{garment_name}" ({garment_type}) from the provided image.
{user_hint}

CRITICAL INSTRUCTIONS:
1. Identify the "{garment_name}" in the image.
2. MULTIPLE ITEMS HANDLING: If the input image contains MULTIPLE distinct items of type "{garment_name}" (e.g., two different shirts side-by-side, or a rack of clothes), YOU MUST RANDOMLY SELECT ONLY ONE SINGLE ITEM to extract. Do not extract the group. Focus on just one specific item unless the user hint says otherwise.
3. Crop close to the item but keep the entire item visible.
4. Remove the background completely (transparent or solid white).
5. PRESERVE the original texture, patterns, and color nuances exactly. Do not hallucinate new patterns.
6. If the image contains a person wearing the item, extract ONLY the clothing item, removing the person's body parts (hands, neck, legs) where possible, creating a "ghost mannequin" look.
7. Output strictly the image of the isolated item.
"""
    
    try:
        image = Image.open(garment_image_path)
        
        response = client.models.generate_content(
            model='gemini-2.5-flash-image',
            contents=[prompt, image],
        )
        
        # Extract generated image
        for part in response.parts:
            if part.inline_data is not None:
                extracted_image = part.as_image()
                extracted_filename = f"extracted_{garment_type}_{uuid.uuid4().hex[:8]}.png"
                extracted_path = os.path.join(IMAGES_DIR, extracted_filename)
                extracted_image.save(extracted_path)
                return extracted_path
        
        raise Exception(f"No extracted image generated for {garment_type}")
        
    except Exception as e:
        print(f"[ERROR] Extract garment {garment_type}: {e}")
        raise


# ==========================================================
# 🧥 API TÁCH TRANG PHỤC (EXTRACT GARMENT)
# ==========================================================
@app.route('/ai_extract_garment', methods=['POST'])
def ai_extract_garment():
    """
    API để tách một món trang phục từ ảnh
    
    Input form-data:
    - garment_image: file (required) - Ảnh chứa trang phục cần tách
    - garment_type: string (required) - Loại trang phục: shirt, pants, shoes, hat, dress, jacket, skirt, accessories
    - custom_prompt: string (optional) - Mô tả chi tiết để hỗ trợ AI tách đúng món đồ
    
    Example custom_prompt:
    - "The red striped t-shirt on the left"
    - "The blue jeans with ripped knees"
    - "The white sneakers in the center"
    """
    try:
        from PIL import Image
        
        # Get garment image
        garment_file = request.files.get('garment_image')
        if not garment_file:
            return jsonify({"error": "Missing garment_image file"}), 400
        
        # Get garment type
        garment_type = request.form.get('garment_type')
        if not garment_type:
            return jsonify({"error": "Missing garment_type parameter"}), 400
        
        # Validate garment type
        outfit_types = {
            'shirt': 'áo',
            'pants': 'quần', 
            'shoes': 'giày',
            'hat': 'mũ',
            'accessories': 'phụ kiện',
            'dress': 'váy',
            'jacket': 'áo khoác',
            'towel': 'khăn',
            'skirt': 'chân váy'
        }
        
        if garment_type not in outfit_types:
            return jsonify({
                "error": f"Invalid garment_type. Must be one of: {', '.join(outfit_types.keys())}"
            }), 400
        
        # Get optional custom prompt
        custom_prompt = request.form.get('custom_prompt', None)
        
        # Save garment image
        saved_files = []
        garment_ext = os.path.splitext(garment_file.filename)[1] or '.png'
        garment_filename = f"input_{garment_type}_{uuid.uuid4().hex[:8]}{garment_ext}"
        garment_path = os.path.join(IMAGES_DIR, garment_filename)
        garment_file.save(garment_path)
        saved_files.append(garment_path)
        
        # Extract garment
        try:
            print(f"[INFO] Extracting {garment_type} from {garment_path}")
            if custom_prompt:
                print(f"[INFO] Custom prompt: {custom_prompt}")
            
            extracted_path = extract_garment_internal(
                garment_image_path=garment_path,
                garment_type=garment_type,
                garment_name=outfit_types[garment_type],
                custom_prompt=custom_prompt
            )
            
            print(f"[SUCCESS] Extracted {garment_type} -> {extracted_path}")
            
        except Exception as e:
            cleanup_media_files(saved_files)
            return jsonify({"error": f"Failed to extract garment: {str(e)}"}), 500
        
        # Cleanup input file
        cleanup_media_files(saved_files)
        
        # Return result
        result_data = {
            "success": True,
            "garment_type": garment_type,
            "extracted_image_path": extracted_path,
            "custom_prompt_used": custom_prompt if custom_prompt else None
        }
        
        # Convert image to base64 for response
        if os.path.exists(extracted_path):
            with open(extracted_path, "rb") as f:
                image_base64 = base64.b64encode(f.read()).decode("utf-8")
                result_data["image_base64"] = f"data:image/png;base64,{image_base64}"
        
        return jsonify(result_data), 200
        
    except Exception as e:
        print(f"[ERROR] ai_extract_garment: {str(e)}")
        return jsonify({"error": str(e)}), 500


def generate_outfit_mix(model_image_path, extracted_garments):
    """
    Step 2: Mix extracted garments onto model using Gemini
    Returns: path to final composed image
    """
    from google import genai
    from PIL import Image
    
    API_KEY = os.getenv("API_KEY")
    client = genai.Client(api_key=API_KEY)
    
    # Build garment descriptions
    garment_descriptions = "\n".join([
        f"- Item {i+1} ({g['type']}): {g['name']}" 
        for i, g in enumerate(extracted_garments)
    ])
    
    prompt = f"""
You are a world-class High Fashion Art Director and Digital Retoucher for luxury brands.

INPUTS:
- The FIRST image is the MODEL.
- The SUBSEQUENT images are the CLOTHING ITEMS (The Outfit):
{garment_descriptions}

GOAL:
Create a highly realistic, "shoppable" fashion image. The result must look like a high-budget marketing campaign that makes people want to buy the clothes immediately.

*** CRITICAL RULE: FACE & IDENTITY PRESERVATION ***
- **DO NOT CHANGE THE FACE:** The model's face, facial features, expression (thần thái), makeup, and hair style MUST remain 100% IDENTICAL to the original image.
- Treat the face area as a "protected mask". Do not redraw the eyes, nose, or mouth.
- You may only adjust the lighting on the face *slightly* to match the new environment, but the identity must be undeniable.

EXECUTION STEPS:
1. **Virtual Try-On**: Dress the model in the provided clothing items. Replace the original clothes completely.
2. **Fit & Physics**:
   - Ensure clothes fit naturally (tucks, drapes, folds).
   - Pants/Skirts should sit at the correct waistline.
   - Shoes must respect the perspective of the floor.
   - If there is a "hat", place it correctly on the head, adjusting hair if necessary.
3. **Commercial "Glow-Up" (Make it Sell)**:
   - **Lighting**: Upgrade the lighting. Use soft, high-end studio lighting that highlights the fabric textures.
   - **Color Grading**: Apply a subtle, professional color grade that makes the image pop (e.g., slightly warmer skin tones, deeper blacks, vibrant fabrics).
   - **Vibe**: The image should feel "expensive" and "polished". 
   - If the original background is messy, you may blur it slightly or clean it up to focus attention on the outfit, but keep the context if it fits the fashion vibe.

OUTPUT:
A photorealistic fashion photo. No AI artifacts. The model looks exactly like themselves, just dressed better and photographed perfectly.
"""
    
    try:
        # Load model image
        model_image = Image.open(model_image_path)
        
        # Load extracted garment images
        garment_images = [Image.open(g['extracted_path']) for g in extracted_garments]
        
        # Build contents: model first, then garments, then prompt
        contents = [model_image] + garment_images + [prompt]
        
        response = client.models.generate_content(
            model='gemini-2.5-flash-image',
            contents=contents,
        )
        
        # Extract final image
        for part in response.parts:
            if part.inline_data is not None:
                final_image = part.as_image()
                final_filename = f"final_mix_{uuid.uuid4().hex[:8]}.png"
                final_path = os.path.join(IMAGES_DIR, final_filename)
                final_image.save(final_path)
                return final_path
        
        raise Exception("No final mixed image generated")
        
    except Exception as e:
        print(f"[ERROR] Generate outfit mix: {e}")
        raise



# ==========================================================
# 👗 API GHÉP TRANG PHỤC VÀO NGƯỜI MẪU (MIX OUTFIT)
# ==========================================================
@app.route('/ai_mix_outfit', methods=['POST'])
def ai_mix_outfit():
    """
    API để ghép các trang phục đã tách vào người mẫu
    
    Input form-data:
    - model_image: file (required) - Ảnh người mẫu
    - extracted_garments: JSON string (required) - Danh sách các garment đã extract
      Format: [{"type": "shirt", "name": "áo", "image_base64": "data:image/png;base64,..."}, ...]
      
    Hoặc upload trực tiếp files:
    - model_image: file (required)
    - shirt_extracted: file (optional)
    - pants_extracted: file (optional)
    - shoes_extracted: file (optional)
    - hat_extracted: file (optional)
    - dress_extracted: file (optional)
    - jacket_extracted: file (optional)
    - skirt_extracted: file (optional)
    - accessories_extracted: file (optional)
    """
    try:
        from PIL import Image
        import io
        
        # Get model image
        model_file = request.files.get('model_image')
        if not model_file:
            return jsonify({"error": "Missing model_image file"}), 400
        
        # Save model image
        saved_files = []
        model_ext = os.path.splitext(model_file.filename)[1] or '.png'
        model_filename = f"model_{uuid.uuid4().hex[:8]}{model_ext}"
        model_path = os.path.join(IMAGES_DIR, model_filename)
        model_file.save(model_path)
        saved_files.append(model_path)
        
        # Get extracted garments - Method 1: JSON string
        extracted_garments = []
        garments_json = request.form.get('extracted_garments')
        
        outfit_types = {
            'shirt': 'áo',
            'pants': 'quần', 
            'shoes': 'giày',
            'hat': 'mũ',
            'accessories': 'phụ kiện',
            'dress': 'váy',
            'jacket': 'áo khoác',
            'skirt': 'chân váy'
        }
        
        if garments_json:
            # Parse JSON
            try:
                garments_data = json.loads(garments_json)
                for garment in garments_data:
                    # Decode base64 image
                    image_data = garment['image_base64']
                    if image_data.startswith('data:image'):
                        image_data = image_data.split(',')[1]
                    
                    image_bytes = base64.b64decode(image_data)
                    img = Image.open(io.BytesIO(image_bytes))
                    
                    # Save extracted image
                    extracted_filename = f"extracted_{garment['type']}_{uuid.uuid4().hex[:8]}.png"
                    extracted_path = os.path.join(IMAGES_DIR, extracted_filename)
                    img.save(extracted_path)
                    saved_files.append(extracted_path)
                    
                    extracted_garments.append({
                        'type': garment['type'],
                        'name': garment.get('name', outfit_types.get(garment['type'], garment['type'])),
                        'extracted_path': extracted_path
                    })
            except Exception as e:
                cleanup_media_files(saved_files)
                return jsonify({"error": f"Failed to parse extracted_garments JSON: {str(e)}"}), 400
        
        else:
            # Method 2: Direct file upload
            for key, vietnamese_name in outfit_types.items():
                file = request.files.get(f'{key}_extracted')
                if file:
                    extracted_ext = os.path.splitext(file.filename)[1] or '.png'
                    extracted_filename = f"extracted_{key}_{uuid.uuid4().hex[:8]}{extracted_ext}"
                    extracted_path = os.path.join(IMAGES_DIR, extracted_filename)
                    file.save(extracted_path)
                    saved_files.append(extracted_path)
                    
                    extracted_garments.append({
                        'type': key,
                        'name': vietnamese_name,
                        'extracted_path': extracted_path
                    })
        
        if not extracted_garments:
            cleanup_media_files(saved_files)
            return jsonify({
                "error": "No extracted garments provided. Use 'extracted_garments' JSON or upload files with '_extracted' suffix"
            }), 400
        
        # Generate outfit mix
        try:
            print(f"[INFO] Mixing {len(extracted_garments)} garments onto model")
            final_image_path = generate_outfit_mix(
                model_image_path=model_path,
                extracted_garments=extracted_garments
            )
            print(f"[SUCCESS] Final image generated -> {final_image_path}")
            
        except Exception as e:
            cleanup_media_files(saved_files)
            return jsonify({"error": f"Failed to mix outfit: {str(e)}"}), 500
        
        # Cleanup intermediate files (keep final image)
        cleanup_media_files(saved_files)
        
        # Return result
        result_data = {
            "success": True,
            "image_path": final_image_path,
            "applied_items": [{"type": g['type'], "name": g['name']} for g in extracted_garments]
        }
        
        # Convert image to base64 for response
        if os.path.exists(final_image_path):
            with open(final_image_path, "rb") as f:
                image_base64 = base64.b64encode(f.read()).decode("utf-8")
                result_data["image_base64"] = f"data:image/png;base64,{image_base64}"
        
        return jsonify(result_data), 200
        
    except Exception as e:
        print(f"[ERROR] ai_mix_outfit: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ==========================================================
# 🎨 API TẠO ẢNH THỜI TRANG VỚI GEMINI (2-STEP PROCESS - LEGACY)
# ==========================================================
@app.route('/ai_generate_fashion', methods=['POST'])
def ai_generate_fashion():
    """
    Input form-data:
    - model_image: file (required) - Ảnh người mẫu
    - shirt: file (optional) - Ảnh áo
    - pants: file (optional) - Ảnh quần
    - shoes: file (optional) - Ảnh giày
    - hat: file (optional) - Ảnh mũ
    - accessories: file (optional) - Ảnh phụ kiện
    
    2-STEP PROCESS:
    Step 1: Extract each garment from outfit images
    Step 2: Mix extracted garments onto model
    """
    try:
        from google import genai
        from PIL import Image
        
        # Get model image
        model_file = request.files.get('model_image')
        if not model_file:
            return jsonify({"error": "Missing model_image file"}), 400
        
        # Save model image
        saved_files = []
        model_ext = os.path.splitext(model_file.filename)[1] or '.png'
        model_filename = f"model_{uuid.uuid4().hex[:8]}{model_ext}"
        model_path = os.path.join(IMAGES_DIR, model_filename)
        model_file.save(model_path)
        saved_files.append(model_path)
        
        # Danh sách các loại trang phục được hỗ trợ
        outfit_types = {
            'shirt': 'áo',
            'pants': 'quần', 
            'shoes': 'giày',
            'hat': 'mũ',
            'accessories': 'phụ kiện',
            'dress': 'váy',
            'jacket': 'áo khoác',
            'skirt': 'chân váy'
        }
        
        # Thu thập các outfit items từ form-data
        outfit_items = []
        for key, vietnamese_name in outfit_types.items():
            file = request.files.get(key)
            if file:
                outfit_ext = os.path.splitext(file.filename)[1] or '.png'
                outfit_filename = f"{key}_{uuid.uuid4().hex[:8]}{outfit_ext}"
                outfit_path = os.path.join(IMAGES_DIR, outfit_filename)
                file.save(outfit_path)
                saved_files.append(outfit_path)
                outfit_items.append({
                    'key': key,
                    'name': vietnamese_name,
                    'path': outfit_path
                })
        
        if not outfit_items:
            cleanup_media_files(saved_files)
            return jsonify({"error": "No outfit items provided. Please upload at least one outfit item (shirt, pants, shoes, hat, etc.)"}), 400
        
        # ===========================================
        # STEP 1: EXTRACT GARMENTS
        # ===========================================
        extracted_garments = []
        extraction_errors = []
        
        for item in outfit_items:
            try:
                print(f"[INFO] Extracting {item['name']} from {item['path']}")
                extracted_path = extract_garment_internal(
                    garment_image_path=item['path'],
                    garment_type=item['key'],
                    garment_name=item['name'],
                    custom_prompt=None
                )
                saved_files.append(extracted_path)
                extracted_garments.append({
                    'type': item['key'],
                    'name': item['name'],
                    'extracted_path': extracted_path
                })
                print(f"[SUCCESS] Extracted {item['name']} -> {extracted_path}")
            except Exception as e:
                error_msg = f"Failed to extract {item['name']}: {str(e)}"
                print(f"[ERROR] {error_msg}")
                extraction_errors.append(error_msg)
        
        if not extracted_garments:
            cleanup_media_files(saved_files)
            return jsonify({
                "error": "Failed to extract any garments",
                "details": extraction_errors
            }), 500
        
        # ===========================================
        # STEP 2: MIX ONTO MODEL
        # ===========================================
        try:
            print(f"[INFO] Mixing {len(extracted_garments)} garments onto model")
            final_image_path = generate_outfit_mix(
                model_image_path=model_path,
                extracted_garments=extracted_garments
            )
            print(f"[SUCCESS] Final image generated -> {final_image_path}")
            
        except Exception as e:
            cleanup_media_files(saved_files)
            return jsonify({
                "error": f"Failed to mix outfit: {str(e)}",
                "extraction_warnings": extraction_errors if extraction_errors else None
            }), 500
        
        # Cleanup uploaded and intermediate files (keep final image)
        cleanup_media_files(saved_files)
        
        # Return result
        result_data = {
            "success": True,
            "image_path": final_image_path,
            "applied_items": [{"key": g['type'], "name": g['name']} for g in extracted_garments],
            "extraction_warnings": extraction_errors if extraction_errors else None
        }
        
        # Convert image to base64 for response
        if os.path.exists(final_image_path):
            with open(final_image_path, "rb") as f:
                image_base64 = base64.b64encode(f.read()).decode("utf-8")
                result_data["image_base64"] = f"data:image/png;base64,{image_base64}"
        
        return jsonify(result_data), 200
        
    except Exception as e:
        print(f"[ERROR] ai_generate_fashion: {str(e)}")
        return jsonify({"error": str(e)}), 500


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
