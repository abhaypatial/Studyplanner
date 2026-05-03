import os
path = "ios/App/App.xcodeproj/project.pbxproj"
with open(path, "r") as f:
    content = f.read()
bad_str = "\t`\t\t"
content = content.replace(bad_str, "App")
content = content.replace('"\\t`\\t\\t.app"', '"App.app"')
with open(path, "w") as f:
    f.write(content)
print("Replaced!")
