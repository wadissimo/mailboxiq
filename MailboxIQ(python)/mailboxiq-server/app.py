from flask import Flask, render_template, request
from vertexai.preview.language_models import TextGenerationModel
import json

def interview(temperature: float = .2):
    """Ideation example with a Large Language Model"""

    # TODO developer - override these parameters as needed:
    parameters = {
        "temperature": temperature,
        "max_output_tokens": 256,   
        "top_p": .8,                
        "top_k": 40,                 
    }

    model = TextGenerationModel.from_pretrained("text-bison@001")
    response = model.predict(
        'Give me ten interview questions for the role of program manager.',
        **parameters,
    )
    print(f"Response from Model: {response.text}")
    return response.text


app = Flask(__name__)
app.secret_key="klnv55asfdasdas$$%21321!!"
ERROR_RESPONSE_JSON = '{"error":"invalid request"}'


@app.route("/")
def home():
    return render_template("taskpane.html")

@app.route("/classify_tone_and_sentiment/", methods=['POST'])
def classify_tone_and_sentiment():
    print("tone method called")
    try:
        data = request.get_json()
        if data and "body" in data:
            #print(data["body"])
            prompt = """Classify sentiment and politeness of the language tone of the reply message of the following email:
            Options: 
            - positive/toxic
            - positive/polite
            - positive/normal
            - negative/normal
            - negative/toxic
            - negative/polite

            input:
            """
            response = call_palm2(prompt + data["body"])
            response_text = response.text
            print(f"Response from Model(Tone/Sentiment): {response_text}")

            sentiment = "positive"
            tone = "normal"
            if "toxic" in response_text:
                tone = "toxic"
            elif "polite" in response_text:
                tone = "polite"
            if "negative" in response_text:
                sentiment = "negative"
            
            response = json.dumps({
                "sentiment": sentiment,
                "tone": tone
            })
        else:
            response = ERROR_RESPONSE_JSON
    except:
        response = ERROR_RESPONSE_JSON
    print("response:", response)
    return response


@app.route("/generate_summary/", methods=['POST'])
def generate_summary():
    try:
        print("generate_summary called")
        data = request.get_json()
        if data and "body" in data:
            #print(data["body"])
            prompt = """Summarize the text:
            input:
            """
            response = call_palm2(prompt + data["body"])
            #print(f"Response from Model(Tone/Sentiment): {response.text}")
            response = json.dumps({
                "text": response.text
            })
        else:
            response = ERROR_RESPONSE_JSON
    except:
        response = ERROR_RESPONSE_JSON
    print("response:", response)
    return response


@app.route("/rephrase/", methods=['POST'])
def rephrase():
    try:
        print("rephrase called")
        data = request.get_json()
        if data and "body" in data:
            #print(data["body"])
            prompt = """Rephrase the response of the following email in polite and positive manner:
            input:
            """
            response = call_palm2(prompt + data["body"])
            #print(f"Response from Model(Tone/Sentiment): {response.text}") 
            response = json.dumps({
                "text": response.text
            })
        else:
            response = ERROR_RESPONSE_JSON
    except:
        response = ERROR_RESPONSE_JSON
    print("response:", response)
    return response


@app.route("/prompt/", methods=['POST'])
def prompt():
    try:
        print("prompt called")
        data = request.get_json()
        if data and "body" in data and "params" in data:
            #print(data["body"])
            prompt = data["params"]
            response = call_palm2(prompt + "\ninput:\n" + data["body"])
            #print(f"Response from Model(Tone/Sentiment): {response.text}") 
            response = json.dumps({
                "text": response.text
            })
        else:
            response = ERROR_RESPONSE_JSON
    except:
        response = ERROR_RESPONSE_JSON
    print("response:", response)
    return response


@app.route("/translate/", methods=['POST'])
def translate():
    try:
        print("translate called")
        data = request.get_json()
        if data and "body" in data:
            #print(data["body"])
            prompt = """Translate the following to German if text is in English or to English if text is in German:
            input:
            """
            response = call_palm2(prompt + data["body"])
            #print(f"Response from Model(Tone/Sentiment): {response.text}") 
            response = json.dumps({
                "text": response.text
            })
        else:
            response = ERROR_RESPONSE_JSON
    except:
        response = ERROR_RESPONSE_JSON
    print("response:", response)
    return response

@app.route("/classify_severity/", methods=['POST'])
def classify_severity():
    try:
        print("classify_severity called")
        data = request.get_json()
        if data and "body" in data:
            #print(data["body"])
            prompt = """Classify severity of the following e-mail:
            Options:
            - Severity: Very High
            - Severity: High
            - Severity: Normal
            - Severity: Low
            input:
            """
            response = call_palm2(prompt + data["body"])
            response = json.dumps({
                "text": response.text
            })
        else:
            response = ERROR_RESPONSE_JSON
    except:
        response = ERROR_RESPONSE_JSON
    print("response:", response)
    return response


@app.route("/classify_fraud/", methods=['POST'])
def classify_fraud():
    try:
        print("classify_fraud called")
        data = request.get_json()
        if data and "body" in data:
            #print(data["body"])
            prompt = """Classify whether the following email fraud or non-fraud:
            Options:
            - Fraud
            - May be fraud
            - Non-fraud
            input:
            """
            response = call_palm2(prompt + data["body"])
            response = json.dumps({
                "text": response.text
            })
        else:
            response = ERROR_RESPONSE_JSON
    except:
        response = ERROR_RESPONSE_JSON
    print("response:", response)
    return response

def call_palm2(prompt):
    parameters = {
        "temperature": 0.2,
        "max_output_tokens": 256,   
        "top_p": .8,                
        "top_k": 40,                 
    }
    #model = TextGenerationModel.from_pretrained("text-bison@001")
    model = TextGenerationModel.from_pretrained("text-bison")
    response = model.predict(prompt, **parameters)
    return response


@app.route("/test/")
def test():
    resp = interview()
    #return render_template("index.html")
    return "Response: " + resp


if __name__ == "__main__":
    #app.run(debug=True, port=5000, ssl_context=('cert.pem', 'key.pem'))
    #app.run('0.0.0.0',debug=True, port=5000, ssl_context=('cert.pem', 'key.pem'))
    app.run('localhost',debug=True, port=5000, ssl_context=('localhost.crt', 'localhost.key'))