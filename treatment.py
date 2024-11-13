import pandas as pd

def group_by_column(input_file, column_name):
    # Read the input CSV file
    df = pd.read_csv(input_file, sep=';')
    
    # Group the data by the specified column
    grouped = df.groupby(column_name)
    
    # Save each group into separate CSV files
    for group_name, group_data in grouped:
        output_file = f"{group_name}_data.csv"
        group_data.to_csv(output_file, index=False, sep=';')
        print(f"Data for {group_name} saved to {output_file}")

# Use the function with your CSV file and the column name
group_by_column('dataset.csv', 'Gender')