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
        probas = model.predict_proba([symptom_vector])[0]  # Get probability scores
        top_indices = probas.argsort()[::-1][:3]  # Top 3 predicted specialists

        results = []
        for idx in top_indices:
            specialist_label = specialist_encoder.inverse_transform([idx])[0]
            confidence = round(probas[idx] * 100, 2)  # e.g., 62.3%
            results.append({'specialist': specialist_label, 'confidence': confidence})

        return jsonify({'top_specialists': results})
    except Exception as e:
        return jsonify({'message': 'Error processing request', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)

