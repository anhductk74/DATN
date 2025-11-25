from google import genai
from google.genai import types
from PIL import Image

client = genai.Client(api_key="")

prompt = (
    "Generate a realistic fashion image of the model wearing the outfit. "
    "Keep face, pose, and background consistent. High-quality, photorealistic output."
)

image_model = Image.open("C:\\Users\\right\\Downloads\\model.png")
image_outfit1 = Image.open("C:\\Users\\right\\Downloads\\outfit1.png")
image_outfit3 = Image.open("C:\\Users\\right\\Downloads\\outfit3.jpg")

response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=[prompt, image_model, image_outfit1, image_outfit3],
)

for part in response.parts:
    if part.text is not None:
        print(part.text)
    elif part.inline_data is not None:
        image = part.as_image()
        image.save("generated_image.png")