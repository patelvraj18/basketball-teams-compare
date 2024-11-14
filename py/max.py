import os
import pandas as pd

# Path to the directory containing team CSV files
teams_directory = "data/"

# List of team names
teams_info = [
    "76ers", "Angeles Lakers", "Antonio Spurs", "Bucks", "Bulls", "Cavaliers", "Celtics", "City Thunder",
    "Clippers", "Grizzlies", "Hawks", "Heat", "Hornets", "Jazz", "Kings", "Magic", "Mavericks", "Nets", "Nuggets",
    "Orleans Pelicans", "Pacers", "Pistons", "Raptors", "Rockets", "State Warriors", "Suns", "Timberwolves",
    "Trail Blazers", "Wizards", "York Knicks"
]

# List of features
features = ["WIN_PCT", "FGA", "FG_PCT", "FG3A", "FG3_PCT", "FT_PCT", "REB", "AST", "PF", "STL", "BLK", "PTS"]

# Create an empty dataframe to store the maximum data
max_data_df = pd.DataFrame(columns=["YEAR"] + features)

# Iterate through each year starting from 1949
for year in range(1948, 2024):  
    end_year = (year + 1) % 100  # Calculate the last two digits of the end year
    year_data = {"YEAR": [f"{year}-{end_year:02d}"]}  # Format the year string
    # Iterate through each feature
    for feature in features:
        feature_values = []

        # Iterate through each team's dataframe
        for team_name in teams_info:
            filename = f"{team_name}.csv"
            team_df = pd.read_csv(os.path.join(teams_directory, filename))

            team_df["YEAR"] = team_df["YEAR"].apply(lambda x: int(x.split('-')[0]))
            
            # Filter data for the current year and feature
            year_feature_data = team_df.loc[(team_df["YEAR"] == year), feature]
            
            if not year_feature_data.isna().all():
                # Append NaN if the team doesn't have data for the current year and feature
                if year_feature_data.empty:
                    feature_values.append(float('nan'))
                else:
                    # Append non-NaN values to the list
                    feature_values.extend(year_feature_data.dropna())

        # Check if there are any non-zero and non-NaN values
        non_zero_values = [value for value in feature_values if not pd.isna(value)]
        year_data[feature] = max(non_zero_values) if non_zero_values else float('nan')

    # Append the data for the current year to the main dataframe
    max_data_df = pd.concat([max_data_df, pd.DataFrame(year_data)])

# Save the resulting dataframe to a CSV file
max_data_df.to_csv("data/max_team_data.csv", index=False)
