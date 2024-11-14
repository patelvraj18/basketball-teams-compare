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

# Create an empty dataframe to store the minimum data
min_data_df = pd.DataFrame(columns=["YEAR"] + features)

# Iterate through each year starting from 1949
for year in range(1948, 2024):  
    year_data = {"YEAR": [f"{year}-{str(year+1)[-2:]}"]} 
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
                # Append 0 if the team doesn't have data for the current year and feature
                if year_feature_data.empty:
                    # print("team_name ",team_name,"year",year,"value", " EMPTY")
                    feature_values.append(0)
                else:
                    # Append non-NaN values to the list
                    # print("team_name ",team_name,"year",year,"value", year_feature_data)
                    feature_values.extend(year_feature_data.dropna())

        non_zero_values = [value for value in feature_values if value != 0 and not pd.isna(value)]
        year_data[feature] = min(non_zero_values) if non_zero_values else 0

    # Append the data for the current year to the main dataframe
    min_data_df = pd.concat([min_data_df, pd.DataFrame(year_data)])

# Save the resulting dataframe to a CSV file
min_data_df.to_csv("data/min_team_data.csv", index=False)