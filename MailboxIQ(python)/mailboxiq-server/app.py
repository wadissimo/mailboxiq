from flask import Flask, render_template, request

import traceback
from palm2_model import Palm2Model
from gpt_model import GptModel

app = Flask(__name__)
app.secret_key="klnv55asfdasdas$$%21321!!"
ERROR_RESPONSE_JSON = '{"error":"invalid request"}'
#DEFAULT_MODEL = Palm2Model()
DEFAULT_MODEL = GptModel("C:/Users/Vadim/Documents/api-key.txt")

@app.route("/")
def home():
    return render_template("taskpane.html")


@app.route("/classify_tone_and_sentiment/", methods=['POST'])
def classify_tone_and_sentiment():
    return serve_from_body(model.classify_tone_and_sentiment)


@app.route("/generate_summary/", methods=['POST'])
def generate_summary():
    return serve_from_body(model.generate_summary)


@app.route("/rephrase/", methods=['POST'])
def rephrase():
    return serve_from_body(model.rephrase)


@app.route("/prompt/", methods=['POST'])
def prompt():
    try:
        print("prompt called")
        data = request.get_json()
        if data and "body" in data and "params" in data:
            response = model.prompt(data["body"], data["params"])
        else:
            response = ERROR_RESPONSE_JSON
    except:
        response = ERROR_RESPONSE_JSON
    print("response:", response)
    return response


@app.route("/translate/", methods=['POST'])
def translate():
    return serve_from_body(model.translate)


@app.route("/classify_severity/", methods=['POST'])
def classify_severity():
    return serve_from_body(model.classify_severity)


@app.route("/classify_fraud/", methods=['POST'])
def classify_fraud():
    return serve_from_body(model.classify_fraud)
    

def serve_from_body(model_function):
    try:
        print(f"{model_function} called")
        data = request.get_json()
        if data and "body" in data:
            response = model_function(data["body"])
        else:
            response = ERROR_RESPONSE_JSON
    except Exception:
        traceback.print_exc()
        response = ERROR_RESPONSE_JSON
    print("response:", response)
    return response


if __name__ == "__main__":
    model = DEFAULT_MODEL
    #app.run(debug=True, port=5000, ssl_context=('cert.pem', 'key.pem'))
    #app.run('0.0.0.0',debug=True, port=5000, ssl_context=('cert.pem', 'key.pem'))
    app.run('localhost',debug=True, port=5000, ssl_context=('localhost.crt', 'localhost.key'))