import kagglehub
import pandas as pd
import json
import os
import shutil
from glob import glob

path = kagglehub.dataset_download("niharika41298/gym-exercise-data")

csv_files = glob(os.path.join(path, "*.csv"))
if not csv_files:
    raise FileNotFoundError("No CSV file")

df = pd.read_csv(csv_files[0])

json_data = (df[['Title', 'Desc', 'Type', 'BodyPart', 'Equipment', 'Level']]
             .rename(columns={
                 'Title': 'title',
                 'Desc': 'description',
                 'Type': 'type',
                 'BodyPart': 'body_part',
                 'Equipment': 'equipment',
                 'Level': 'level'
             })
             .fillna('')  
             .to_dict(orient='records'))

for item in json_data:
    for key in item:
        if pd.isna(item[key]): 
            item[key] = ''

with open('gym_exercises.json', 'w') as f:
    json.dump(json_data, f, indent=2)

if os.path.isdir(path):
    shutil.rmtree(path)
elif os.path.isfile(path):
    os.remove(path)

print("Dataset successfully converted to JSON")