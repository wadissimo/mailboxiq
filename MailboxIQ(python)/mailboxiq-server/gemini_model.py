from model import Model
from vertexai.preview.generative_models import GenerativeModel

import json

class GeminiModel(Model):

    def __init__(self):
        super().__init__("Gemini")

    def call_model(self, prompt):
        # parameters = {
        #     "temperature": 0.2,
        #     "max_output_tokens": 256,   
        #     "top_p": .8,                
        #     "top_k": 40,                 
        # }
        #model = TextGenerationModel.from_pretrained("text-bison@001")
        model = GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return response


    def classify_tone_and_sentiment(self, body):
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
        response = self.call_model(prompt + body)
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
        return response

    def generate_summary(self, body):
        prompt = """Summarize the text:
        input:
        """
        response = self.call_model(prompt + body)
        return json.dumps({
            "text": response.text
        })

    def rephrase(self, body):
        prompt = """Rephrase the given input text in polite and positive manner
        input:
        """
        response = self.call_model(prompt + body)
        return json.dumps({
            "text": response.text
        })

    def prompt(self, body, prompt):
        response = self.call_model(prompt + "\ninput:\n" + body)
        return json.dumps({
            "text": response.text
        })

    def translate(self, body):
        prompt = """Translate the following to German if text is in English or to English if text is in German:
        input:
        """
        response = self.call_model(prompt + body)
        return json.dumps({
            "text": response.text
        })

    def classify_severity(self, body):
        prompt = """Classify severity of the following e-mail:
        Options:
        - Severity: Very High
        - Severity: High
        - Severity: Normal
        - Severity: Low
        input:
        """
        response = self.call_model(prompt + body)
        return json.dumps({
            "text": response.text
        })

    def classify_fraud(self, body):
        prompt = """Classify whether the following email fraud or non-fraud:
        Options:
        - Fraud
        - May be fraud
        - Non-fraud
        input:
        """
        response = self.call_model(prompt + body)
        return json.dumps({
            "text": response.text
        })
