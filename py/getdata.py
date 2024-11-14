from nba_api.stats.endpoints import teamyearbyyearstats
from nba_api.stats.endpoints import teamestimatedmetrics
from nba_api.stats.static import teams
import json
teams_list = teams.get_teams()
team_ids = []
team_names = []
team_jsons = []
team_advanced_jsons = []
for team in teams_list:
    team_ids.append(team['id'])
    team_names.append(team['nickname'])
for id in team_ids:
    team_jsons.append(teamyearbyyearstats.TeamYearByYearStats(team_id=id).get_normalized_json())
    team_advanced_jsons.append(teamestimatedmetrics.TeamEstimatedMetrics(team_id=id).get_normalized_json())
for i in range(len(team_jsons)):
    with open("data_pre_processing/"+team_names[i]+".json", 'w') as out_file:
     json.dump(team_jsons[i], out_file, sort_keys = True, indent = 4,
               ensure_ascii = False)
for i in range(len(team_advanced_jsons)):
    with open("data_adv_pre_processing/"+team_names[i]+"_adv.json", 'w') as out_file:
     json.dump(team_advanced_jsons[i], out_file, sort_keys = True, indent = 4,
               ensure_ascii = False)