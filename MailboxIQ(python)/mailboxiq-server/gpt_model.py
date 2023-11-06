from model import Model

import json
import openai

class GptModel(Model):

    def __init__(self, key_path):
        self.key_path = key_path
        self.key = self.get_key(key_path)
        
        super().__init__("GPT")

    def get_key(self, key_path):
        with open(key_path, 'r') as f:
            key = f.readline()
            return key


    def call_gpt(self, prompt):
        openai.api_key = self.key
        response = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}])
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
        response = self.call_gpt(prompt + body)
        response_text = response['choices'][0]['message']['content']
        print(f"Response text from Model(Tone/Sentiment): {response_text}")
        print(f"Response from Model(Tone/Sentiment): {response}")
        

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
        response = self.call_gpt(prompt + body)
        response_text = response['choices'][0]['message']['content']
        return json.dumps({
            "text": response_text
        })

    def rephrase(self, body):
        prompt = """Rephrase the given input text in polite and positive manner
        input:
        """
        response = self.call_gpt(prompt + body)
        response_text = response['choices'][0]['message']['content']
        return json.dumps({
            "text": response_text
        })

    def prompt(self, body, prompt):
        response = self.call_gpt(prompt + "\ninput:\n" + body)
        response_text = response['choices'][0]['message']['content']
        return json.dumps({
            "text": response_text
        })

    def translate(self, body):
        prompt = """Translate the following to German if text is in English or to English if text is in German:
        input:
        """
        response = self.call_gpt(prompt + body)
        response_text = response['choices'][0]['message']['content']
        return json.dumps({
            "text": response_text
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
        response = self.call_gpt(prompt + body)
        response_text = response['choices'][0]['message']['content']
        return json.dumps({
            "text": response_text
        })

    def classify_fraud(self, body):
        prompt = """Classify whether the following email fraud or non-fraud:
        Options:
        - Fraud
        - May be fraud
        - Non-fraud
        input:
        """
        response = self.call_gpt(prompt + body)
        response_text = response['choices'][0]['message']['content']
        return json.dumps({
            "text": response_text
        })
