import json
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

class NLPIntegration:
    def __init__(self, intents_path, model_name="microsoft/DialoGPT-medium"):
        self.intents = self._load_intents(intents_path)
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.vectorizer = TfidfVectorizer()
        self.intent_vectors = None
        self._initialize_models()
        self._prepare_intent_matching()
    
    def _load_intents(self, intents_path):
        with open(intents_path, 'r') as f:
            data = json.load(f)
        return data["intents"]
    
    def _initialize_models(self):
        print("Loading NLP models...")
        try:
            # Set up device and memory optimization settings
            device = "cuda" if torch.cuda.is_available() else "cpu"
            model_kwargs = {
                "low_cpu_mem_usage": True,
                "torch_dtype": torch.float32,
                "use_safetensors": True,
                "device_map": "auto"
            }
            
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                **model_kwargs
            )
            
            # Load QA pipeline with optimizations
            self.qa_pipeline = pipeline(
                "question-answering", 
                model="deepset/roberta-base-squad2",
                device=device
            )
            print("Models loaded successfully.")
        except Exception as e:
            print(f"Error loading models: {str(e)}")
            # Fallback to smaller model if needed
            try:
                print("Attempting to load smaller model...")
                self.model_name = "microsoft/DialoGPT-small"
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    **model_kwargs
                )
                print("Successfully loaded smaller model.")
            except Exception as e:
                print(f"Failed to load fallback model: {str(e)}")
                raise
    
    def _prepare_intent_matching(self):
        patterns = []
        self.intent_tags = []
        
        for intent in self.intents:
            for pattern in intent["patterns"]:
                patterns.append(pattern)
                self.intent_tags.append(intent["tag"])
        
        self.intent_vectors = self.vectorizer.fit_transform(patterns)
    
    def classify_intent(self, text):
        text_vector = self.vectorizer.transform([text])
        similarities = cosine_similarity(text_vector, self.intent_vectors)
        max_idx = np.argmax(similarities)
        
        if similarities[0][max_idx] > 0.3:  # Threshold for matching
            return self.intent_tags[max_idx]
        return "general"
    
    def generate_response(self, prompt, user_type="student"):
        # Adjust prompt based on user type
        if user_type == "student":
            system_prompt = "You are a friendly financial advisor for students. Use simple language and practical examples."
        else:
            system_prompt = "You are a professional financial advisor. Use appropriate financial terminology and detailed explanations."
        
        full_prompt = f"{system_prompt}\n\nUser question: {prompt}\n\nResponse:"
        
        # Encode the prompt
        input_ids = self.tokenizer.encode(full_prompt, return_tensors="pt")
        
        # Generate response
        with torch.no_grad():
            output = self.model.generate(
                input_ids, 
                max_length=200, 
                num_return_sequences=1,
                temperature=0.8,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        # Decode the response
        response = self.tokenizer.decode(output[:, input_ids.shape[-1]:][0], skip_special_tokens=True)
        
        # Clean up response
        response = re.sub(r'\n+', ' ', response).strip()
        
        return response
    
    def answer_question(self, question, context):
        result = self.qa_pipeline(question=question, context=context)
        return result['answer']