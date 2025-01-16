import pandas as pd

# Create sample hierarchical data
data = {
    "L0": ["战略部门", "运营部门", "技术部门"],
    "L1": ["规划组", "执行组", "评估组"] * 1,
    "L2": ["项目A", "项目B"] * 2,
}

# Create DataFrame
df = pd.DataFrame()
for level, values in data.items():
    df[level] = pd.Series(values)

# Save to Excel
df.to_excel("sample_data/sample.xlsx", index=False)
print("Sample data generated successfully!")
