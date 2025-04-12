import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# Load datasets
train_path = "Training.csv"
test_path = "Testing.csv"

df_train = pd.read_csv(train_path)
df_test = pd.read_csv(test_path)

# Remove underscores from column names
df_train.columns = df_train.columns.str.replace("_", " ")
df_test.columns = df_test.columns.str.replace("_", " ")

# Identify target columns
target_column = "prognosis"
specialist_column = "specialist"

# Encode target variables
le_prognosis = LabelEncoder()
df_train[target_column] = le_prognosis.fit_transform(df_train[target_column])
df_test[target_column] = le_prognosis.transform(df_test[target_column])

le_specialist = LabelEncoder()
df_train[specialist_column] = le_specialist.fit_transform(df_train[specialist_column])
df_test[specialist_column] = le_specialist.transform(df_test[specialist_column])

# Separate features and labels
X_train = df_train.drop(columns=[target_column, specialist_column])
y_train = df_train[specialist_column]

X_test = df_test.drop(columns=[target_column, specialist_column])
y_test = df_test[specialist_column]

# Train Random Forest Model
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

# Save necessary objects
pickle.dump(rf_model, open("symptom_model.pkl", "wb"))
pickle.dump(le_specialist, open("specialist_encoder.pkl", "wb"))
pickle.dump(list(X_train.columns), open("symptom_list.pkl", "wb"))

print("Model training complete! Saved as symptom_model.pkl")
