from model import Model

import json
from openai import OpenAI

class GptModel(Model):

    def __init__(self, key_path, model_name="gpt-3.5-turbo"):
        
        #self.key_path = key_path
        #self.key = 
        self.model_name=model_name
        
        self.client = OpenAI(
           api_key=self.get_key(key_path)
        )
        super().__init__(model_name)

    def get_key(self, key_path):
        with open(key_path, 'r') as f:
            key = f.readline()
            return key


    def call_gpt(self, prompt):
        print("call_gpt")
        #response = openai.ChatCompletion.create(model=self.model_name, messages=[{"role": "user", "content": prompt}])
        completion = self.client.chat.completions.create(model=self.model_name, messages=[{"role": "user", "content": prompt}])
        response_text = completion.choices[0].message.content #response['choices'][0]['message']['content']
        return response_text


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
        response_text = self.call_gpt(prompt + body)
        
        print(f"Response text from Model(Tone/Sentiment): {response_text}")
        #print(f"Response from Model(Tone/Sentiment): {response}")
        

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
        response_text = self.call_gpt(prompt + body)
        
        return json.dumps({
            "text": response_text
        })

    def rephrase(self, body):
        prompt = """Rephrase the given input text in polite and positive manner
        input:
        """
        response_text = self.call_gpt(prompt + body)
        
        return json.dumps({
            "text": response_text
        })

    def prompt(self, body, prompt):
        response_text = self.call_gpt(prompt + "\ninput:\n" + body)
        return json.dumps({
            "text": response_text
        })

    def translate(self, body):
        prompt = """Translate the following to German if text is in English or to English if text is in German:
        input:
        """
        response_text = self.call_gpt(prompt + body)
        
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
        response_text = self.call_gpt(prompt + body)
        
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
        response_text = self.call_gpt(prompt + body)
        
        return json.dumps({
            "text": response_text
        })
