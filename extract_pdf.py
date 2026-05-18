import pypdf
import os

pdf_path = "QUY-CHE-THI-CUOI-KY.pdf"
txt_path = "QUY-CHE-THI-CUOI-KY.txt"

if not os.path.exists(pdf_path):
    print(f"Error: {pdf_path} not found.")
    exit(1)

try:
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for idx, page in enumerate(reader.pages):
        text += f"--- TRANG {idx + 1} ---\n"
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
        else:
            text += "[Không thể trích xuất văn bản từ trang này]\n"
        text += "\n"

    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"Success: Extracted {len(reader.pages)} pages to {txt_path} successfully!")
except Exception as e:
    print(f"Error extracting PDF: {e}")
