import json

# 1. Configuration
input_filename = '85quranic-words.json'
output_filename = '85quranic-words-updated.json'

# 2. Load your data
try:
    with open(input_filename, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 3. Add the empty audio_path field
    for lesson in data['lessons']:
        for word in lesson['words']:
            word['audio_path'] = ""

    # 4. Save the updated JSON
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Successfully added empty 'audio_path' to {output_filename}")

except FileNotFoundError:
    print(f"Error: The file '{input_filename}' was not found.")
except Exception as e:
    print(f"An error occurred: {e}")