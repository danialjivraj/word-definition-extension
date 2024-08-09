import json
import random
from datetime import datetime, timedelta

with open("./dictionary/word-of-the-day", "r", encoding="utf-8") as file:
    words = file.read().splitlines()

random.shuffle(words)

start_date = datetime.today()

word_date_dict = {}

for i, word in enumerate(words):
    date = (start_date + timedelta(days=i)).strftime("%d/%m/%Y")
    word_date_dict[date] = word

with open("./dictionary/word-of-the-day.json", "w", encoding="utf-8") as json_file:
    json.dump(word_date_dict, json_file, ensure_ascii=False, indent=2)

print("JSON file has been created successfully!")
