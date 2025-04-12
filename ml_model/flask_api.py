from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Load trained model and encoders
model = pickle.load(open('./symptom_model.pkl', 'rb'))
specialist_encoder = pickle.load(open('./specialist_encoder.pkl', 'rb'))
symptom_list = pickle.load(open('./symptom_list.pkl', 'rb'))

@app.route('/predict-specialist', methods=['POST'])
def predict_specialist():
    try:
        data = request.json
        symptoms = data.get('symptoms', [])
        
        if not symptoms:
            return jsonify({'message': 'No symptoms provided'}), 400
        
        # Convert input symptoms to model-compatible format
        symptom_vector = [1 if symptom in symptoms else 0 for symptom in symptom_list]
        
        # Predict specialist
        prediction = model.predict([symptom_vector])[0]
        specialist = specialist_encoder.inverse_transform([prediction])[0]
        
        return jsonify({'specialist': specialist})
    except Exception as e:
        return jsonify({'message': 'Error processing request', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)

