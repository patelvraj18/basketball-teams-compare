import json
import csv
import os

# Directory containing JSON files
json_directory = 'data_pre_processing/'

# Iterate over each file in the directory
for filename in os.listdir(json_directory):
    if filename.endswith(".json"):
        json_file_path = os.path.join(json_directory, filename)

        with open(json_file_path) as f:
            data = json.load(f)
            data = json.loads(data)
        f.close

        # Extract headers and rows
        headers = list(data["TeamStats"][0].keys())
        rows = [list(d.values()) for d in data['TeamStats']]

        # Define features to be divided by 'GP'
        features_to_divide = ['FTA', 'FGA', 'FG3A', 'REB', 'AST', 'PF', 'STL', 'BLK', 'PTS']

        # Iterate over rows and update specified features by dividing them by 'GP'
        for row in rows:
            GP_index = headers.index('GP')  # Get the index of 'GP' in headers
            GP_value = row[GP_index]  # Get the 'GP' value for the current row
            
            # Update specified features by dividing them by 'GP'
            for feature in features_to_divide:
                feature_index = headers.index(feature)
                row[feature_index] = (row[feature_index] + 0) / GP_value if GP_value != 0 else 0

        # Write to CSV file
        csv_file_path = os.path.join('data/', f"{os.path.splitext(filename)[0]}.csv")
        with open(csv_file_path, 'w', newline='') as csv_file:
            csv_writer = csv.writer(csv_file)
            
            # Write headers
            csv_writer.writerow(headers)
            
            # Write modified rows
            csv_writer.writerows(rows)

        print(f'CSV file "{csv_file_path}" created successfully.')