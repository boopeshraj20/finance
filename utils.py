import pandas as pd
import matplotlib.pyplot as plt
import plotly.express as px
import streamlit as st
import json
import os

def format_currency(amount):
    return f"${amount:,.2f}"

def create_spending_chart(transactions):
    df = pd.DataFrame(transactions)
    fig = px.pie(df, values='amount', names='category', title="Spending by Category")
    return fig

def create_budget_chart(income, expenses):
    categories = list(expenses.keys())
    values = list(expenses.values())
    
    fig = px.bar(x=categories, y=values, title="Monthly Budget",
                 labels={'x': 'Category', 'y': 'Amount ($)'})
    fig.add_hline(y=income, line_dash="dash", line_color="green", 
                 annotation_text=f"Income: {format_currency(income)}")
    return fig

def load_sample_data():
    if os.path.exists("data/sample_data.json"):
        with open("data/sample_data.json", "r") as f:
            return json.load(f)
    return {
        "income": 5000,
        "expenses": {
            "Housing": 1500,
            "Food": 800,
            "Transportation": 400,
            "Entertainment": 300,
            "Utilities": 250,
            "Other": 250
        },
        "transactions": [
            {"category": "Housing", "amount": 1500, "description": "Monthly rent"},
            {"category": "Food", "amount": 400, "description": "Groceries"},
            {"category": "Food", "amount": 400, "description": "Restaurants"},
            {"category": "Transportation", "amount": 400, "description": "Gas and public transit"},
            {"category": "Entertainment", "amount": 300, "description": "Movies and hobbies"},
            {"category": "Utilities", "amount": 250, "description": "Electric, water, internet"},
            {"category": "Other", "amount": 250, "description": "Miscellaneous"}
        ]
    }

def load_intents():
    if os.path.exists("data/intents.json"):
        with open("data/intents.json", "r") as f:
            return json.load(f)
    return {
        "intents": [
            {"tag": "budget_summary", "patterns": ["budget summary", "how am i doing", "monthly summary", "financial overview"]},
            {"tag": "savings_advice", "patterns": ["savings", "save money", "how much should i save", "savings rate"]},
            {"tag": "spending_insights", "patterns": ["spending", "where is my money going", "insights", "analyze my spending"]},
            {"tag": "investment_advice", "patterns": ["investments", "stocks", "portfolio", "investment advice"]},
            {"tag": "tax_guidance", "patterns": ["taxes", "tax advice", "deductions", "tax planning"]},
            {"tag": "greeting", "patterns": ["hi", "hello", "hey", "good morning", "good afternoon"]},
            {"tag": "goodbye", "patterns": ["bye", "goodbye", "see you later", "thanks"]}
        ]
    }