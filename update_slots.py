import os

file_path = r"d:\PROJECTS\Exam Platform\src\app\admin\dashboard\page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    '"10:00 AM - 11:30 AM"': '"10:00 AM - 11:15 AM"',
    '"12:00 PM - 01:30 PM"': '"11:45 AM - 01:00 PM"',
    '"03:00 PM - 04:30 PM"': '"02:45 PM - 04:00 PM"',
    '"06:00 PM - 07:30 PM"': '"05:30 PM - 06:45 PM"',
    '"08:00 PM - 09:30 PM"': '"07:00 PM - 08:15 PM"',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
